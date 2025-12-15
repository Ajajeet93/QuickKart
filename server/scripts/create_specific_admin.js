const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const createSpecificAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'quickcartadmin@gmail.com';
        const plainPassword = 'Admin@9305';
        const name = 'QuickCart Admin';

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            console.log('User found. Updating credentials and role...');
            user.password = hashedPassword;
            user.role = 'admin';
            user.name = name; // Ensure name is set nicely
            await user.save();
            console.log(`Updated existing user ${email} to Admin.`);
        } else {
            console.log('User not found. Creating new admin user...');
            user = new User({
                name,
                email,
                password: hashedPassword,
                role: 'admin',
                phone: '0000000000' // consistent dummy phone
            });
            await user.save();
            console.log(`Created new Admin user ${email}.`);
        }

        mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createSpecificAdmin();
