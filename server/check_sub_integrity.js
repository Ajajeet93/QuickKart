const mongoose = require('mongoose');
require('dotenv').config({ path: '../client/.env' }); // Adjust path if needed or hardcode if simple

const MONGO_URI = 'mongodb+srv://quickkart_user:quickkart123@cluster0.bg0g9.mongodb.net/quickkart?retryWrites=true&w=majority&appName=Cluster0';

const Subscription = require('./models/Subscription');
const Address = require('./models/Address');
const User = require('./models/User');

async function checkIntegrity() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        const subs = await Subscription.find({});
        console.log(`Found ${subs.length} total subscriptions.`);

        for (const sub of subs) {
            console.log(`------------------------------------------------`);
            console.log(`Subscription ID: ${sub._id}`);
            console.log(`User ID: ${sub.userId}`);

            const addrId = sub.deliveryAddress;
            console.log(`Stored DeliveryAddress ID: ${addrId} (${typeof addrId})`);

            if (!addrId) {
                console.log('ISSUE: No valid deliveryAddress ID stored.');
                continue;
            }

            // check if address exists
            let validId = addrId;
            if (typeof addrId === 'object' && addrId._id) validId = addrId._id;

            if (mongoose.Types.ObjectId.isValid(validId)) {
                const addr = await Address.findById(validId);
                if (addr) {
                    console.log(`OK: Address found: ${addr.street}, ${addr.city}`);
                } else {
                    console.log('CRITICAL: Address ID NOT FOUND in Address collection (Deleted?)');
                }
            } else {
                console.log('ISSUE: ID is not a valid ObjectId');
            }

            // Check if user has this address in their list?
            // (Not strictly required for lookup by ID, but good to know)
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        console.log('Done.');
    }
}

checkIntegrity();
