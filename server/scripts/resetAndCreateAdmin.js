/**
 * resetAndCreateAdmin.js
 * ─────────────────────
 * Run with:  node scripts/resetAndCreateAdmin.js
 *
 * What it does:
 *  1. Deletes ALL users
 *  2. Drops the sessions collection (legacy)
 *  3. Deletes ALL refresh tokens
 *  4. Creates a single admin user with the credentials below
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User          = require('../src/models/User');
const RefreshToken  = require('../src/models/RefreshToken');

// ── ✏️  SET YOUR ADMIN CREDENTIALS HERE ──────────────────────────
const ADMIN_EMAIL    = 'admin@quickkart.com';
const ADMIN_PASSWORD = 'Admin@1234';
const ADMIN_NAME     = 'Admin';
// ─────────────────────────────────────────────────────────────────

async function main() {
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // 1. Delete all users
    const { deletedCount: usersDeleted } = await User.deleteMany({});
    console.log(`🗑️  Deleted ${usersDeleted} user(s)`);

    // 2. Drop sessions collection if it exists (legacy session-based auth)
    const collections = await mongoose.connection.db.listCollections().toArray();
    const sessionExists = collections.some(c => c.name === 'sessions');
    if (sessionExists) {
        await mongoose.connection.db.dropCollection('sessions');
        console.log('🗑️  Dropped sessions collection');
    } else {
        console.log('ℹ️  No sessions collection found (already clean)');
    }

    // 3. Delete all refresh tokens
    const { deletedCount: tokensDeleted } = await RefreshToken.deleteMany({});
    console.log(`🗑️  Deleted ${tokensDeleted} refresh token(s)`);

    // 4. Create admin user
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const admin = await User.create({
        name:     ADMIN_NAME,
        email:    ADMIN_EMAIL,
        password: hashedPassword,
        phone:    '',
        role:     'admin',
    });

    console.log('\n✅ Admin user created:');
    console.log(`   Email   : ${admin.email}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role    : ${admin.role}`);
    console.log(`   ID      : ${admin._id}\n`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected. Done!\n');
}

main().catch((err) => {
    console.error('❌ Error:', err.message);
    mongoose.disconnect();
    process.exit(1);
});
