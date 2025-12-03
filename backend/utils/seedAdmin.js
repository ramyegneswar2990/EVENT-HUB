const User = require('../models/User');

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });

    if (adminExists) {
      // Update existing admin to ensure correct role and password
      adminExists.role = 'admin';
      // Reset password to ensure it's correct
      adminExists.password = 'admin123';
      await adminExists.save();
      console.log('✓ Admin user updated');
      console.log(`  Email: ${adminExists.email}`);
      console.log(`  Role: ${adminExists.role}`);
      console.log(`  Password: admin123 (reset)`);
      return;
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin',
    });

    console.log('✓ Admin user created successfully');
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role: ${admin.role}`);
    console.log(`  Password: admin123`);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    console.error('Full error:', error);
  }
};

module.exports = seedAdmin;

