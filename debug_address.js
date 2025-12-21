const mongoose = require('mongoose');
const path = require('path');

// Hardcoded URI for debugging stability
const MONGO_URI = 'mongodb+srv://quickkart_user:quickkart123@cluster0.bg0g9.mongodb.net/quickkart?retryWrites=true&w=majority&appName=Cluster0';

// Load Models
const Subscription = require(path.join(__dirname, 'server/models/Subscription.js'));
const Address = require(path.join(__dirname, 'server/models/Address.js'));
const User = require(path.join(__dirname, 'server/models/User.js'));

async function debug() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        console.log('\n--- Checking Subscriptions ---');
        const subs = await Subscription.find({});
        console.log(`Found ${subs.length} subscriptions`);

        for (const sub of subs) {
            console.log(`\nSub ID: ${sub._id}`);
            console.log(`User ID: ${sub.userId}`);
            console.log(`DeliveryAddress Field:`, sub.deliveryAddress);
            console.log(`DeliveryAddress Type:`, typeof sub.deliveryAddress);

            if (sub.deliveryAddress) {
                // Try to find raw
                try {
                    const addr = await Address.findById(sub.deliveryAddress);
                    console.log(`-> Lookup by ID result:`, addr ? `Found: ${addr.street}, ${addr.zip}` : 'NOT FOUND IN DB');
                } catch (e) {
                    console.log(`-> Lookup error: ${e.message}`);
                }
            } else {
                console.log('-> deliveryAddress is falsy');
            }
        }

        console.log('\n--- Checking Addresses for User (Sample) ---');
        if (subs.length > 0) {
            const sampleUserId = subs[0].userId;
            const addresses = await Address.find({ userId: sampleUserId });
            console.log(`Addresses for user ${sampleUserId}: ${addresses.length}`);
            addresses.forEach(a => console.log(` - ${a._id}: ${a.street}, ${a.zip}`));
        }

    } catch (err) {
        console.error('Debug Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('\nDone');
    }
}

debug();
