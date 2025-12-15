const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Allow passing email as argument, otherwise list users or prompt
        const email = process.argv[2];

        if (!email) {
            console.log('No email provided. Updating the first user found...');
            // Select only necessary fields to avoid validation errors on bad data
            const user = await User.findOne({}).select('_id email');
            if (user) {
                await User.updateOne({ _id: user._id }, { $set: { role: 'admin' } });
                console.log(`User ${user.email} is now an ADMIN.`);
            } else {
                console.log('No users found in database.');
            }
        } else {
            const user = await User.findOne({ email }).select('_id email');
            if (!user) {
                console.log(`User with email ${email} not found.`);
            } else {
                await User.updateOne({ _id: user._id }, { $set: { role: 'admin' } });
                console.log(`User ${email} is now an ADMIN.`);
            }
        }

        mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

makeAdmin();
