const User = require('../models/User');
const config = require('../config/env');

async function seedDefaultAdmin() {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      console.log('[Seed] No admin account found. Creating default administrator...');
      const passwordHash = await User.hashPassword(config.defaultAdmin.password);

      const defaultAdmin = await User.create({
        email: config.defaultAdmin.email.toLowerCase(),
        passwordHash,
        role: 'admin',
      });

      console.log(`[Seed] Default admin created successfully:`);
      console.log(`       Email: ${defaultAdmin.email}`);
      console.log(`       Password: ${config.defaultAdmin.password}`);
    } else {
      console.log('[Seed] Admin account already exists in database.');
    }
  } catch (error) {
    console.error('[Seed] Error seeding default admin:', error.message);
  }
}

module.exports = seedDefaultAdmin;
