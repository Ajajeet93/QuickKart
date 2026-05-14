const mongoose = require('mongoose');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const getProducts = require('../data/products');
const fs = require('fs');
const logError = (err) => {
    const errorMsg = `[${new Date().toISOString()}] Error: ${err.message}\nStack: ${err.stack}\n`;
    fs.appendFileSync('seed_error.log', errorMsg);
    console.error(err);
};

try {
    require('dotenv').config();
} catch (e) {
    logError(e);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/QuickKart')
    .then(() => {
        console.log('MongoDB Connected for Seeding');
        seedData();
    })
    .catch(err => logError(err));

const seedData = async () => {
    try {
        // Clear existing data
        await Category.deleteMany({});
        await Product.deleteMany({});

        // Categories
        const categoriesData = [
            { name: 'Vegetables', slug: 'vegetables', icon: '🥕', color: 'bg-green-100 text-green-600' },
            { name: 'Fruits', slug: 'fruits', icon: '🍎', color: 'bg-red-100 text-red-600' },
            { name: 'Dairy', slug: 'dairy', icon: '🥛', color: 'bg-blue-100 text-blue-600' },
            { name: 'Meat', slug: 'meat', icon: '🥩', color: 'bg-orange-100 text-orange-600' },
            { name: 'Bakery', slug: 'bakery', icon: '🍞', color: 'bg-yellow-100 text-yellow-600' },
            { name: 'Beverages', slug: 'beverages', icon: '🥤', color: 'bg-purple-100 text-purple-600' },
            { name: 'Snacks', slug: 'snacks', icon: '🍟', color: 'bg-pink-100 text-pink-600' },
            { name: 'Instant Food', slug: 'instant-food', icon: '🍜', color: 'bg-indigo-100 text-indigo-600' },
            { name: 'Personal Care', slug: 'personal-care', icon: '🧴', color: 'bg-teal-100 text-teal-600' },
            { name: 'Household', slug: 'household', icon: '🧹', color: 'bg-gray-100 text-gray-600' },
        ];

        const insertedCategories = await Category.insertMany(categoriesData);
        console.log('Categories Seeded');

        // Create Map for easy lookup
        const catMap = {};
        insertedCategories.forEach(cat => {
            catMap[cat.name] = cat._id;
        });

        // Products
        console.log('Generating products...');
        const products = getProducts(catMap);

        await Product.insertMany(products);
        console.log(`Products Seeded: ${products.length} items`);

        process.exit();
    } catch (error) {
        console.error('Seeding Failed:', error);
        logError(error);
        process.exit(1);
    }
};

// seedData(); removed
