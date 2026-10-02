const QRCode = require('qrcode');
const Message = require('../models/Message');
const TokenService = require('../services/tokenService');
const smsService = require('../services/smsService');
const config = require('../config/env');

/**
 * POST /api/messages
 * Create a new secure message, generate cryptographic token, and save token hash.
 */
const createMessage = async (req, res, next) => {
  try {
    const {
      recipientPhone,
      title = 'Confidential Secure Message',
      message,
      imageUrl = '',
      expiresInMinutes = 1440, // 24 hours default
      isOneTime = true,
      consentGiven = true,
      sendImmediately = false,
    } = req.body;

    // 1. Generate 256-bit cryptographically secure random token (64 hex characters)
    const rawToken = TokenService.generateToken(32);
    
    // 2. Compute SHA-256 hash for secure storage
    const tokenHash = TokenService.hashToken(rawToken);

    // 3. Compute expiration date
    const expiresAt = new Date(Date.now() + parseInt(expiresInMinutes, 10) * 60 * 1000);

    // 4. Construct Public Recipient URL
    const accessUrl = `${config.publicAppUrl}/message/${rawToken}`;

    // 5. Generate QR Code Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(accessUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    // 6. Persist message in MongoDB
    const newMessage = await Message.create({
      recipientPhone: recipientPhone.trim(),
      title: title.trim() || 'Confidential Secure Message',
      message: message.trim(),
      imageUrl: imageUrl.trim(),
      tokenHash,
      expiresAt,
      isOneTime: Boolean(isOneTime),
      consentGiven: Boolean(consentGiven),
      createdBy: req.user ? req.user._id : null,
      smsStatus: 'not_sent',
    });

    let smsResult = null;

    // 7. Send SMS immediately if requested
    if (sendImmediately) {
      try {
        smsResult = await smsService.sendSecureLink({
          to: recipientPhone.trim(),
          accessUrl,
          title: newMessage.title,
        });

        newMessage.smsSentAt = new Date();
        newMessage.smsStatus = smsResult.mode === 'live' ? 'sent' : 'mock_sent';
        newMessage.smsSid = smsResult.sid;
        await newMessage.save();
      } catch (smsErr) {
        console.error('[Create Message] Failed to send SMS immediately:', smsErr.message);
        newMessage.smsStatus = 'failed';
        newMessage.smsError = smsErr.message;
        await newMessage.save();
        smsResult = {
          success: false,
          error: smsErr.message,
        };
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Secure link generated successfully',
      data: {
        id: newMessage._id,
        rawToken, // Only returned once at creation time
        tokenHash,
        tokenFingerprint: TokenService.getFingerprint(rawToken),
        accessUrl,
        qrCode: qrCodeDataUrl,
        title: newMessage.title,
        recipientPhoneMasked: newMessage.getMaskedPhone(),
        expiresAt: newMessage.expiresAt,
        isOneTime: newMessage.isOneTime,
        smsStatus: newMessage.smsStatus,
        smsResult,
        createdAt: newMessage.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/messages/:id/send
 * Trigger or resend SMS for an existing message
 */
const sendSMS = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rawToken } = req.body; // Can accept the rawToken if available from client session

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found.',
      });
    }

    if (!message.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Cannot send SMS for a revoked or inactive message.',
      });
    }

    if (new Date() > message.expiresAt) {
      return res.status(400).json({
        success: false,
        error: 'Cannot send SMS for an expired message.',
      });
    }

    let accessUrl = '';
    let tokenForUrl = rawToken;

    // If client supplied the original rawToken and its SHA-256 matches, use it
    if (rawToken && TokenService.verifyToken(rawToken, message.tokenHash)) {
      accessUrl = `${config.publicAppUrl}/message/${rawToken}`;
    } else {
      // If token not provided, generate a fresh cryptographic token for re-transmission
      const newRawToken = TokenService.generateToken(32);
      message.tokenHash = TokenService.hashToken(newRawToken);
      tokenForUrl = newRawToken;
      accessUrl = `${config.publicAppUrl}/message/${newRawToken}`;
    }

    const smsResult = await smsService.sendSecureLink({
      to: message.recipientPhone,
      accessUrl,
      title: message.title,
    });

    message.smsSentAt = new Date();
    message.smsStatus = smsResult.mode === 'live' ? 'sent' : 'mock_sent';
    message.smsSid = smsResult.sid;
    message.smsError = '';
    await message.save();

    // Re-generate QR code for the fresh link
    const qrCode = await QRCode.toDataURL(accessUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
    });

    return res.status(200).json({
      success: true,
      message: 'SMS delivery initiated successfully',
      data: {
        id: message._id,
        smsStatus: message.smsStatus,
        smsSid: message.smsSid,
        smsResult,
        accessUrl,
        rawToken: tokenForUrl,
        qrCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/messages/:token (PUBLIC RECIPIENT ENDPOINT)
 * Validates token hash, checks expiration, handles one-time view destruction, records audit metadata.
 */
const getMessageByToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        status: 'invalid',
        error: 'Invalid token parameter.',
      });
    }

    // 1. Hash the incoming token
    const tokenHash = TokenService.hashToken(token);

    // 2. Query MongoDB by tokenHash
    const messageDoc = await Message.findOne({ tokenHash });

    if (!messageDoc) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        error: 'Secure message not found or link has expired/been destroyed.',
        securityNote: 'This link is either invalid, revoked, or has already reached its access limit.',
      });
    }

    // 3. Check access state
    const accessCheck = messageDoc.isAccessible();

    if (!accessCheck.valid) {
      if (accessCheck.reason === 'expired') {
        return res.status(410).json({
          success: false,
          status: 'expired',
          error: 'This secure link has expired.',
          expiredAt: messageDoc.expiresAt,
          securityNote: 'Links automatically self-destruct once their expiration threshold is reached.',
        });
      }

      if (accessCheck.reason === 'already_viewed') {
        return res.status(410).json({
          success: false,
          status: 'already_viewed',
          error: 'This one-time secure link has already been opened and destroyed.',
          openedAt: messageDoc.openedAt,
          securityNote: 'One-time access links are permanently burned after the initial viewing.',
        });
      }

      if (accessCheck.reason === 'revoked') {
        return res.status(403).json({
          success: false,
          status: 'revoked',
          error: 'This message link was revoked by the sender.',
          securityNote: 'The administrator has terminated access to this confidential payload.',
        });
      }
    }

    // 4. Record access audit & burn if one-time
    const isFirstOpen = !messageDoc.openedAt;
    if (isFirstOpen) {
      messageDoc.openedAt = new Date();
    }
    messageDoc.viewCount += 1;
    messageDoc.openedMeta = {
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'] || 'Unknown',
    };

    await messageDoc.save();

    // 5. Return sanitized payload (DO NOT expose recipient phone number, DB IDs, or internal tokens)
    return res.status(200).json({
      success: true,
      status: 'valid',
      data: {
        title: messageDoc.title,
        message: messageDoc.message,
        imageUrl: messageDoc.imageUrl,
        createdAt: messageDoc.createdAt,
        expiresAt: messageDoc.expiresAt,
        openedAt: messageDoc.openedAt,
        isOneTime: messageDoc.isOneTime,
        viewCount: messageDoc.viewCount,
        tokenFingerprint: TokenService.getFingerprint(token),
        isFirstView: isFirstOpen,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/messages (ADMIN: List all messages with pagination & filters)
 */
const getAllMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', status = 'all' } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { recipientPhone: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    const now = new Date();

    if (status === 'active') {
      query.isActive = true;
      query.expiresAt = { $gt: now };
    } else if (status === 'opened') {
      query.openedAt = { $ne: null };
    } else if (status === 'unopened') {
      query.openedAt = null;
    } else if (status === 'expired') {
      query.expiresAt = { $lte: now };
    } else if (status === 'revoked') {
      query.isActive = false;
    }

    const total = await Message.countDocuments(query);
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page, 10) - 1) * parseInt(limit, 10))
      .limit(parseInt(limit, 10));

    const formattedMessages = messages.map((m) => ({
      id: m._id,
      recipientPhoneMasked: m.getMaskedPhone(),
      title: m.title,
      messageSnippet: m.message.length > 80 ? m.message.substring(0, 80) + '...' : m.message,
      hasImage: Boolean(m.imageUrl),
      expiresAt: m.expiresAt,
      openedAt: m.openedAt,
      smsSentAt: m.smsSentAt,
      smsStatus: m.smsStatus,
      smsSid: m.smsSid,
      isOneTime: m.isOneTime,
      viewCount: m.viewCount,
      isActive: m.isActive,
      isExpired: now > m.expiresAt,
      isOpened: Boolean(m.openedAt),
      createdAt: m.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: formattedMessages,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
        limit: parseInt(limit, 10),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/messages/:id (ADMIN: Single message details)
 */
const getMessageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: message._id,
        recipientPhoneMasked: message.getMaskedPhone(),
        title: message.title,
        message: message.message,
        imageUrl: message.imageUrl,
        expiresAt: message.expiresAt,
        openedAt: message.openedAt,
        smsSentAt: message.smsSentAt,
        smsStatus: message.smsStatus,
        smsSid: message.smsSid,
        smsError: message.smsError,
        isOneTime: message.isOneTime,
        viewCount: message.viewCount,
        isActive: message.isActive,
        createdAt: message.createdAt,
        openedMeta: message.openedMeta,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/messages/:id (ADMIN: Revoke/delete message)
 */
const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found.',
      });
    }

    // Set isActive to false (soft revoke) or permanent delete
    message.isActive = false;
    await message.save();

    return res.status(200).json({
      success: true,
      message: 'Secure link has been revoked and disabled successfully.',
      id: message._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/messages/stats/summary (ADMIN: Metrics for Dashboard)
 */
const getMessageStats = async (req, res, next) => {
  try {
    const now = new Date();

    const [
      totalMessages,
      activeMessages,
      openedMessages,
      expiredMessages,
      smsDelivered,
    ] = await Promise.all([
      Message.countDocuments(),
      Message.countDocuments({ isActive: true, expiresAt: { $gt: now } }),
      Message.countDocuments({ openedAt: { $ne: null } }),
      Message.countDocuments({ expiresAt: { $lte: now } }),
      Message.countDocuments({ smsStatus: { $in: ['sent', 'mock_sent'] } }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalMessages,
        activeMessages,
        openedMessages,
        expiredMessages,
        smsDelivered,
        openRate: totalMessages > 0 ? Math.round((openedMessages / totalMessages) * 100) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMessage,
  sendSMS,
  getMessageByToken,
  getAllMessages,
  getMessageById,
  deleteMessage,
  getMessageStats,
};
