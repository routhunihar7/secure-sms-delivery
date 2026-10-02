const crypto = require('crypto');

/**
 * Token Service handles cryptographically secure random token generation
 * and SHA-256 token hashing for database storage.
 */
class TokenService {
  /**
   * Generates a 256-bit CSPRNG token (64 hex characters)
   * @param {number} bytes - Number of random bytes (default: 32)
   * @returns {string} Hex-encoded random token
   */
  static generateToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Generates a SHA-256 hash of the plain token
   * @param {string} token - The raw token string
   * @returns {string} Hex-encoded SHA-256 hash
   */
  static hashToken(token) {
    if (!token || typeof token !== 'string') {
      throw new Error('Token must be a non-empty string');
    }
    return crypto.createHash('sha256').update(token.trim()).digest('hex');
  }

  /**
   * Timing-safe verification of token against stored hash
   * @param {string} rawToken - Provided token
   * @param {string} storedHash - Stored SHA-256 hash
   * @returns {boolean} True if matching
   */
  static verifyToken(rawToken, storedHash) {
    try {
      const computedHash = this.hashToken(rawToken);
      const computedBuffer = Buffer.from(computedHash, 'hex');
      const storedBuffer = Buffer.from(storedHash, 'hex');

      if (computedBuffer.length !== storedBuffer.length) {
        return false;
      }
      return crypto.timingSafeEqual(computedBuffer, storedBuffer);
    } catch {
      return false;
    }
  }

  /**
   * Generates an easy-to-read cryptographic fingerprint for UI inspection
   * e.g. "8A4F...3B91"
   * @param {string} token - Raw or hashed token
   * @returns {string} Short fingerprint
   */
  static getFingerprint(token) {
    if (!token) return '';
    const hash = crypto.createHash('sha256').update(token).digest('hex').toUpperCase();
    return `${hash.slice(0, 4)}-${hash.slice(4, 8)}-${hash.slice(-4)}`;
  }
}

module.exports = TokenService;
