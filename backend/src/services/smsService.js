const twilio = require('twilio');
const config = require('../config/env');

class SMSService {
  constructor() {
    this.hasCredentials = Boolean(
      config.twilio.accountSid &&
      config.twilio.authToken &&
      config.twilio.phoneNumber &&
      !config.twilio.accountSid.includes('your_twilio')
    );

    if (this.hasCredentials) {
      try {
        this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
        console.log('[SMS Service] Twilio client initialized with live credentials.');
      } catch (err) {
        console.warn(`[SMS Service] Failed to initialize Twilio client (${err.message}). Defaulting to Mock Mode.`);
        this.hasCredentials = false;
      }
    } else {
      console.log('[SMS Service] No valid Twilio credentials found. Running in MOCK SMS SIMULATOR mode.');
    }

    // In-memory log buffer for simulator demonstration (last 50 messages)
    this.mockSentLogs = [];
  }

  /**
   * Check if running in live Twilio mode or Mock mode
   */
  isLiveMode() {
    return this.hasCredentials && !!this.client;
  }

  /**
   * Send SMS via Twilio or Mock Simulator
   * @param {Object} params
   * @param {string} params.to - Recipient phone number
   * @param {string} params.accessUrl - Generated secure link
   * @param {string} params.title - Optional title
   * @returns {Promise<{ success: boolean, sid: string, mode: string, body: string }>}
   */
  async sendSecureLink({ to, accessUrl, title = 'Confidential Secure Message' }) {
    const body = `[Secure Message] You have received a confidential link: "${title}". Access securely here: ${accessUrl} (Expires soon)`;

    if (this.isLiveMode()) {
      try {
        console.log(`[SMS Service: LIVE] Sending SMS to ${to} via Twilio...`);
        const message = await this.client.messages.create({
          body,
          from: config.twilio.phoneNumber,
          to,
        });

        return {
          success: true,
          sid: message.sid,
          mode: 'live',
          body,
          status: message.status || 'sent',
          sentAt: new Date(),
        };
      } catch (error) {
        console.error(`[SMS Service: LIVE ERROR] Twilio send failed: ${error.message}`);
        throw new Error(`Twilio SMS Delivery Failed: ${error.message}`);
      }
    }

    // Mock Simulator Mode
    console.log(`[SMS Service: MOCK SIMULATOR]`);
    console.log(`  To: ${to}`);
    console.log(`  Body: ${body}`);
    console.log(`  Link: ${accessUrl}`);

    const mockSid = `SM_MOCK_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
    const logEntry = {
      sid: mockSid,
      to,
      body,
      accessUrl,
      mode: 'mock_simulator',
      sentAt: new Date(),
      status: 'mock_delivered',
    };

    this.mockSentLogs.unshift(logEntry);
    if (this.mockSentLogs.length > 50) {
      this.mockSentLogs.pop();
    }

    return {
      success: true,
      sid: mockSid,
      mode: 'mock',
      body,
      status: 'mock_sent',
      sentAt: logEntry.sentAt,
      note: 'SMS was processed via local Mock SMS Simulator. Check Simulated SMS logs in Dashboard.',
    };
  }

  /**
   * Get recent mock SMS logs for networking/testing inspection
   */
  getMockLogs() {
    return this.mockSentLogs;
  }
}

// Export singleton instance
module.exports = new SMSService();
