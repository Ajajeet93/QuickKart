/**
 * cleanupDb.js — One-time database cleanup script
 *
 * KEEPS:
 *   - users       → only the admin user (role: 'admin')
 *   - products    → all records
 *   - categories  → all records
 *
 * WIPES (all documents):
 *   - orders, carts, addresses, payments, transactions,
 *     subscriptions, refreshtokens, returnrequests
 */

require('dotenv').config(); // loads server/.env when run from server/ directory
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env');
    process.exit(1);
}

async function cleanup() {
    await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 8000,
    });
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // ── 1. Users: delete everyone except admins ─────────────────────
    const userResult = await db.collection('users').deleteMany({ role: { $ne: 'admin' } });
    console.log(`🗑  Users removed (non-admin):  ${userResult.deletedCount}`);

    // Show remaining admin users
    const admins = await db.collection('users').find({ role: 'admin' }, { projection: { name: 1, email: 1, role: 1 } }).toArray();
    console.log(`✅ Admin users kept: ${admins.length}`);
    admins.forEach(a => console.log(`   → ${a.name} <${a.email}>`));

    // ── 2. Collections to wipe completely ───────────────────────────
    const collectionsToWipe = [
        'orders',
        'carts',
        'addresses',
        'payments',
        'transactions',
        'subscriptions',
        'refreshtokens',
        'returnrequests',
    ];

    console.log('\n🗑  Wiping other collections:');
    for (const col of collectionsToWipe) {
        try {
            const res = await db.collection(col).deleteMany({});
            console.log(`   ${col.padEnd(20)} → ${res.deletedCount} documents removed`);
        } catch (err) {
            console.warn(`   ${col.padEnd(20)} → skipped (${err.message})`);
        }
    }

    // ── 3. Products & Categories: untouched ─────────────────────────
    const productCount  = await db.collection('products').countDocuments();
    const categoryCount = await db.collection('categories').countDocuments();
    console.log(`\n✅ Products kept:    ${productCount}`);
    console.log(`✅ Categories kept:  ${categoryCount}`);

    await mongoose.disconnect();
    console.log('\n✅ Done. Database cleanup complete.');
}

cleanup().catch((err) => {
    console.error('❌ Cleanup failed:', err.message);
    mongoose.disconnect();
    process.exit(1);
});
