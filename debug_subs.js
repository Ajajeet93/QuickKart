const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Subscription = require('./server/models/Subscription');
const Address = require('./server/models/Address');

dotenv.config({ path: './client/.env' }); // try client env first? actually usually server .env or hardcoded for script
// Wait, I need the mongo URI. I'll read server/config or just assume standard local if not visible.
// I'll assume standard processing.

const MONGO_URI = 'mongodb+srv://quickkart_user:quickkart123@cluster0.bg0g9.mongodb.net/quickkart?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');

        // Find all subscriptions
        const subs = await Subscription.find({});
        console.log(`Found ${subs.length} subscriptions`);

        for (const sub of subs) {
            console.log('---');
            console.log(`Sub ID: ${sub._id}`);
            console.log(`Raw DeliveryAddress: ${sub.deliveryAddress} (Type: ${typeof sub.deliveryAddress})`);

            // Try to find this address manually
            if (sub.deliveryAddress) {
                try {
                    const addr = await Address.findById(sub.deliveryAddress);
                    console.log(`Find Address Result: ${addr ? 'Found' : 'NOT FOUND'}`);
                    if (addr) console.log(addr);
                } catch (e) {
                    console.log(`Error finding address: ${e.message}`);
                }
            }
        }
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
