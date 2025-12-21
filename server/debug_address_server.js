const mongoose = require('mongoose');
const path = require('path');

// Hardcoded URI for debugging stability
const MONGO_URI = 'mongodb+srv://quickkart_user:quickkart123@cluster0.bg0g9.mongodb.net/quickkart?retryWrites=true&w=majority&appName=Cluster0';

// Load Models (Relative to server/)
const Subscription = require('./models/Subscription');
const Address = require('./models/Address');
const User = require('./models/User');

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
                    // Check if it's a valid ObjectId first to avoid cast error
                    if (mongoose.Types.ObjectId.isValid(sub.deliveryAddress)) {
                        const addr = await Address.findById(sub.deliveryAddress);
                        console.log(`-> Lookup by ID result:`, addr ? `Found: ${addr.street}, ${addr.zip}` : 'NOT FOUND IN DB');
                    } else {
                        console.log(`-> ID is NOT a valid ObjectId`);
                    }
                } catch (e) {
                    console.log(`-> Lookup error: ${e.message}`);
                }
            } else {
                console.log('-> deliveryAddress is falsy');
            }
        }

    } catch (err) {
        console.error('Debug Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('\nDone');
    }
}

debug();
