const getProducts = (catMap) => {
    const products = [];
    const CATEGORIES = [
        'Fruits', 'Vegetables', 'Dairy', 'Meat', 'Bakery',
        'Beverages', 'Snacks', 'Instant Food', 'Personal Care', 'Household'
    ];

    // Helper to generate a SINGLE product with multiple variants
    const generateProductWithVariants = (category, baseName, image, basePrice, variantsList, ratingBase = 4.5) => {
        const isPopular = Math.random() > 0.8;

        // Map variant definitions to the schema structure
        const productVariants = variantsList.map(v => ({
            weight: v.qty,
            price: Math.floor(basePrice * v.mult)
        }));

        // Display price is the lowest price (usually the smallest variant)
        // Sort variants by price? Or keep order? Let's keep order defined in list.
        const displayPrice = Math.min(...productVariants.map(v => v.price));

        products.push({
            name: baseName, // No longer "Name (Weight)"
            price: displayPrice,
            variants: productVariants,
            category: category,
            categoryId: catMap[category],
            rating: parseFloat((ratingBase + (Math.random() * 0.5 - 0.1)).toFixed(1)),
            image: image,
            description: `Experience the premium quality of ${baseName}. Carefully selected and packed to ensure freshness and taste. Perfect for your daily ${category} needs.`,
            images: [
                image,
                "https://images.unsplash.com/photo-1615485925694-a6dd997b5394?auto=format&fit=crop&q=80&w=400", // Generic Placeholder 1
                "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=400"  // Generic Placeholder 2
            ],
            isPopular: isPopular
        });
    };

    // Standard Variants Definitions
    const weightVariants = [
        { qty: '1kg', mult: 1 },
        { qty: '500g', mult: 0.55 },
        { qty: '250g', mult: 0.3 }
    ];
    const countVariants = [
        { qty: '12pc', mult: 1 },
        { qty: '6pc', mult: 0.55 },
        { qty: '30pc', mult: 2.4 }
    ];
    const packVariants = [
        { qty: '4pk', mult: 1 },
        { qty: '2pk', mult: 0.55 },
        { qty: '1pk', mult: 0.3 }
    ];
    const liquidVariants = [
        { qty: '1L', mult: 1 },
        { qty: '500ml', mult: 0.55 },
        { qty: '250ml', mult: 0.3 }
    ];

    // --- 1. FRUITS ---
    generateProductWithVariants('Fruits', 'Organic Apples', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6', 200, weightVariants);
    generateProductWithVariants('Fruits', 'Fresh Bananas', 'https://images.unsplash.com/photo-1603833665858-e61d17a86279', 60, [{ qty: '1 Dozen', mult: 1 }, { qty: '6pc', mult: 0.55 }]);
    generateProductWithVariants('Fruits', 'Green Grapes', 'https://images.unsplash.com/photo-1537640538965-1756e17153ee', 120, weightVariants);
    generateProductWithVariants('Fruits', 'Pomegranate', 'https://images.unsplash.com/photo-1615485500704-8e99099928b3', 180, weightVariants);
    generateProductWithVariants('Fruits', 'Oranges', 'https://images.unsplash.com/photo-1547514701-42782101795e', 100, weightVariants);
    generateProductWithVariants('Fruits', 'Mangoes', 'https://images.unsplash.com/photo-1553279768-865429fa0078', 300, weightVariants);
    generateProductWithVariants('Fruits', 'Strawberries', 'https://images.unsplash.com/photo-1518635017498-87f514b751ba', 250, [{ qty: 'Box', mult: 1 }, { qty: 'Large Box', mult: 1.8 }]);
    generateProductWithVariants('Fruits', 'Watermelon', 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18', 80, [{ qty: '1pc', mult: 1 }]);
    generateProductWithVariants('Fruits', 'Papaya', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec', 60, [{ qty: '1pc', mult: 1 }]);
    generateProductWithVariants('Fruits', 'Kiwi', 'https://images.unsplash.com/photo-1518182170-e6e236add8f1', 150, [{ qty: '3pc', mult: 1 }, { qty: '6pc', mult: 1.9 }]);
    generateProductWithVariants('Fruits', 'Pineapple', 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba', 90, [{ qty: '1pc', mult: 1 }]);
    generateProductWithVariants('Fruits', 'Dragon Fruit', 'https://images.unsplash.com/photo-1527325678964-54921661f888', 200, [{ qty: '1pc', mult: 1 }]);
    generateProductWithVariants('Fruits', 'Avocado', 'https://images.unsplash.com/photo-1523049673856-42848c51f556', 300, weightVariants);
    generateProductWithVariants('Fruits', 'Cherries', 'https://images.unsplash.com/photo-1528825871115-3581a5387919', 400, [{ qty: '250g', mult: 0.3 }, { qty: '500g', mult: 0.55 }]);
    generateProductWithVariants('Fruits', 'Pears', 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25', 180, weightVariants);
    generateProductWithVariants('Fruits', 'Guava', 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46', 80, weightVariants);
    generateProductWithVariants('Fruits', 'Muskmelon', 'https://images.unsplash.com/photo-1598099395231-15b50d832822', 70, [{ qty: '1pc', mult: 1 }]);
    generateProductWithVariants('Fruits', 'Black Grapes', 'https://images.unsplash.com/photo-1596707328608-f46328315263', 140, weightVariants);

    // --- 2. VEGETABLES ---
    generateProductWithVariants('Vegetables', 'Broccoli', 'https://images.unsplash.com/photo-1459411621453-7fb8db6bae1b', 120, weightVariants);
    generateProductWithVariants('Vegetables', 'Carrots', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37', 60, weightVariants);
    generateProductWithVariants('Vegetables', 'Potatoes', 'https://images.unsplash.com/photo-1518977676651-71f6480aeef9', 40, weightVariants);
    generateProductWithVariants('Vegetables', 'Tomatoes', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea', 50, weightVariants);
    generateProductWithVariants('Vegetables', 'Onions', 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb', 45, weightVariants);
    generateProductWithVariants('Vegetables', 'Spinach', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb', 30, [{ qty: '1 Bunch', mult: 1 }]);
    generateProductWithVariants('Vegetables', 'Cauliflower', 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3', 50, [{ qty: '1pc', mult: 1 }]);
    generateProductWithVariants('Vegetables', 'Bell Pepper', 'https://images.unsplash.com/photo-1563565375-f3fdf5eca23e', 60, weightVariants);
    generateProductWithVariants('Vegetables', 'Cucumber', 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6', 40, weightVariants);
    generateProductWithVariants('Vegetables', 'Eggplant', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5', 50, weightVariants);
    generateProductWithVariants('Vegetables', 'Green Chilies', 'https://images.unsplash.com/photo-1588833979500-bf4f738c238c', 20, [{ qty: '100g', mult: 1 }, { qty: '250g', mult: 2.2 }]);
    generateProductWithVariants('Vegetables', 'Garlic', 'https://images.unsplash.com/photo-1615485290349-8b832b4b3b2c', 80, [{ qty: '200g', mult: 1 }]);
    generateProductWithVariants('Vegetables', 'Ginger', 'https://images.unsplash.com/photo-1615485500097-f5da18235252', 100, [{ qty: '200g', mult: 1 }]);
    generateProductWithVariants('Vegetables', 'Cabbage', 'https://images.unsplash.com/photo-1596521764658-006324d86927', 40, [{ qty: '1pc', mult: 1 }]);
    generateProductWithVariants('Vegetables', 'Mushrooms', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', 120, [{ qty: '200g', mult: 1 }]);
    generateProductWithVariants('Vegetables', 'Corn', 'https://images.unsplash.com/photo-1551754655-cd27e38d2076', 30, [{ qty: '1pc', mult: 1 }]);
    generateProductWithVariants('Vegetables', 'Peas', 'https://images.unsplash.com/photo-1587411768515-5619b78f3c94', 80, weightVariants);
    generateProductWithVariants('Vegetables', 'Sweet Potato', 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19', 60, weightVariants);

    // --- 3. DAIRY ---
    generateProductWithVariants('Dairy', 'Fresh Milk', 'https://images.unsplash.com/photo-1550583724-b2692b85b150', 70, liquidVariants);
    generateProductWithVariants('Dairy', 'Cheddar Cheese', 'https://images.unsplash.com/photo-1625246333195-24d16c1b0452', 400, weightVariants);
    generateProductWithVariants('Dairy', 'Butter', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d', 280, [{ qty: '500g', mult: 1 }, { qty: '100g', mult: 0.25 }]);
    generateProductWithVariants('Dairy', 'Paneer', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7', 350, weightVariants);
    generateProductWithVariants('Dairy', 'Yogurt', 'https://images.unsplash.com/photo-1488477181946-6428a0291777', 60, [{ qty: 'Cup', mult: 1 }, { qty: '1kg Bucket', mult: 4 }]);
    generateProductWithVariants('Dairy', 'Cream', 'https://images.unsplash.com/photo-1628151015705-728795da1823', 150, [{ qty: '200ml', mult: 1 }]);
    generateProductWithVariants('Dairy', 'Mozzarella', 'https://images.unsplash.com/photo-1588698942953-b4258c0c9cb3', 450, weightVariants);
    generateProductWithVariants('Dairy', 'Ghee', 'https://images.unsplash.com/photo-1631890354877-d6484399222c', 600, liquidVariants);
    generateProductWithVariants('Dairy', 'Buttermilk', 'https://images.unsplash.com/photo-1626131499557-beba09fb03d6', 30, liquidVariants);
    generateProductWithVariants('Dairy', 'Condensed Milk', 'https://images.unsplash.com/photo-1571556391492-359f40776c5b', 120, [{ qty: 'Tin', mult: 1 }]);
    generateProductWithVariants('Dairy', 'Flavored Milk', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc', 40, [{ qty: 'Bottle', mult: 1 }]);
    generateProductWithVariants('Dairy', 'Tofu (Soya Paneer)', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', 200, [{ qty: '200g', mult: 1 }]);
    generateProductWithVariants('Dairy', 'Ice Cream Tub', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb', 300, [{ qty: '1L', mult: 1 }, { qty: '500ml', mult: 0.6 }]);
    generateProductWithVariants('Dairy', 'Cheese Slices', 'https://images.unsplash.com/photo-1624806992066-5d482cc2eb1e', 140, [{ qty: '10 Slices', mult: 1 }]);

    // --- 4. MEAT ---
    generateProductWithVariants('Meat', 'Chicken Breast', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791', 320, weightVariants);
    generateProductWithVariants('Meat', 'Fresh Eggs', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f', 60, countVariants);
    generateProductWithVariants('Meat', 'Mutton Curry Cut', 'https://images.unsplash.com/photo-1603048297172-c92544798d5e', 700, weightVariants);
    generateProductWithVariants('Meat', 'Fish Fillet', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2', 500, weightVariants);
    generateProductWithVariants('Meat', 'Prawns', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47', 600, weightVariants);
    generateProductWithVariants('Meat', 'Salmon', 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6', 1200, weightVariants);
    generateProductWithVariants('Meat', 'Bacon Strips', 'https://images.unsplash.com/photo-1606851682829-2342410cb462', 400, [{ qty: '200g', mult: 1 }]);
    generateProductWithVariants('Meat', 'Sausages', 'https://images.unsplash.com/photo-1592398563375-9a8885b59a6d', 350, [{ qty: '500g', mult: 1 }]);
    generateProductWithVariants('Meat', 'Chicken Drumsticks', 'https://images.unsplash.com/photo-1594968160356-9ee020c29f60', 280, weightVariants);
    generateProductWithVariants('Meat', 'Ground Beef', 'https://images.unsplash.com/photo-1570824104453-508955ab713e', 450, weightVariants);
    generateProductWithVariants('Meat', 'Pork Chops', 'https://images.unsplash.com/photo-1605493666578-43d9418af7cb', 500, weightVariants);
    generateProductWithVariants('Meat', 'Tuna Steak', 'https://images.unsplash.com/photo-1533658284560-6062ac0c8c82', 900, weightVariants);
    generateProductWithVariants('Meat', 'Crab', 'https://images.unsplash.com/photo-1569395250422-95dfd0c75ae4', 600, [{ qty: '1kg', mult: 1 }]);

    // --- 5. BAKERY ---
    generateProductWithVariants('Bakery', 'Whole Wheat Bread', 'https://images.unsplash.com/photo-1509440159596-0249088772ff', 50, [{ qty: '400g', mult: 1 }]);
    generateProductWithVariants('Bakery', 'Croissants', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a', 200, packVariants);
    generateProductWithVariants('Bakery', 'Muffins', 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa', 150, packVariants);
    generateProductWithVariants('Bakery', 'Bagels', 'https://images.unsplash.com/photo-1594002636756-33989e21115b', 180, packVariants);
    generateProductWithVariants('Bakery', 'Baguette', 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04', 70, [{ qty: 'Large', mult: 1 }]);
    generateProductWithVariants('Bakery', 'Chocolate Cake', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587', 500, [{ qty: '500g', mult: 1 }, { qty: '1kg', mult: 1.8 }]);
    generateProductWithVariants('Bakery', 'Donuts', 'https://images.unsplash.com/photo-1551024601-569a6f4588a5', 250, packVariants);
    generateProductWithVariants('Bakery', 'Cookies', 'https://images.unsplash.com/photo-1499636138143-bd6490257b25', 180, [{ qty: 'Pack', mult: 1 }]);
    generateProductWithVariants('Bakery', 'Sourdough Bread', 'https://images.unsplash.com/photo-1585476644321-b976214b606d', 150, [{ qty: 'Loaf', mult: 1 }]);
    generateProductWithVariants('Bakery', 'Brownie', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c', 80, [{ qty: '1pc', mult: 1 }]);
    generateProductWithVariants('Bakery', 'Burger Buns', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641', 60, packVariants);
    generateProductWithVariants('Bakery', 'Pizza Base', 'https://images.unsplash.com/photo-1598514982635-c3319be282bb', 50, [{ qty: '2pk', mult: 1 }]);
    generateProductWithVariants('Bakery', 'Banana Bread', 'https://images.unsplash.com/photo-1610406225895-7d43258529cb', 120, [{ qty: 'Loaf', mult: 1 }]);
    generateProductWithVariants('Bakery', 'Pita Bread', 'https://images.unsplash.com/photo-1555529733-0e670560f7e1', 50, packVariants);

    // --- 6. BEVERAGES ---
    generateProductWithVariants('Beverages', 'Orange Juice', 'https://images.unsplash.com/photo-1613478223719-2ab802602423', 140, liquidVariants);
    generateProductWithVariants('Beverages', 'Coffee Powder', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', 450, [{ qty: '200g', mult: 1 }, { qty: '500g', mult: 2.2 }]);
    generateProductWithVariants('Beverages', 'Green Tea', 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5', 250, [{ qty: 'Box', mult: 1 }]);
    generateProductWithVariants('Beverages', 'Cola', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97', 40, [{ qty: 'Can', mult: 1 }, { qty: '2L', mult: 2.5 }]);
    generateProductWithVariants('Beverages', 'Coconut Water', 'https://images.unsplash.com/photo-1544253139-4d642b91838d', 50, [{ qty: '200ml', mult: 1 }]);
    generateProductWithVariants('Beverages', 'Energy Drink', 'https://images.unsplash.com/photo-1622543925258-d63b5849553b', 110, [{ qty: 'Can', mult: 1 }]);
    generateProductWithVariants('Beverages', 'Lemonade', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd', 60, liquidVariants);
    generateProductWithVariants('Beverages', 'Mineral Water', 'https://images.unsplash.com/photo-1560706834-819f637d3335', 20, liquidVariants);
    generateProductWithVariants('Beverages', 'Apple Juice', 'https://images.unsplash.com/photo-1612149591147-3dc616a2ef93', 130, liquidVariants);
    generateProductWithVariants('Beverages', 'Smoothie', 'https://images.unsplash.com/photo-1610970881699-44a5587cabec', 150, [{ qty: 'Bottle', mult: 1 }]);
    generateProductWithVariants('Beverages', 'Hot Chocolate Mix', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574', 300, [{ qty: 'Tin', mult: 1 }]);
    generateProductWithVariants('Beverages', 'Iced Tea', 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87', 50, [{ qty: 'Bottle', mult: 1 }]);
    generateProductWithVariants('Beverages', 'Sparkling Water', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be', 60, [{ qty: '500ml', mult: 1 }]);

    // --- 7. SNACKS ---
    generateProductWithVariants('Snacks', 'Potato Chips', 'https://images.unsplash.com/photo-1566478919030-26d81dd812de', 30, [{ qty: 'Small', mult: 1 }, { qty: 'Party Pack', mult: 2.5 }]);
    generateProductWithVariants('Snacks', 'Popcorn', 'https://images.unsplash.com/photo-1578849278619-a73853e7472e', 50, [{ qty: 'Pack', mult: 1 }]);
    generateProductWithVariants('Snacks', 'Almonds', 'https://images.unsplash.com/photo-1507474706915-18c645b20ad9', 400, weightVariants);
    generateProductWithVariants('Snacks', 'Dark Chocolate', 'https://images.unsplash.com/photo-1548139553-9114b3dc04c5', 120, [{ qty: 'Bar', mult: 1 }]);
    generateProductWithVariants('Snacks', 'Pretzels', 'https://images.unsplash.com/photo-1598282365288-752945d47504', 80, [{ qty: 'Pack', mult: 1 }]);
    generateProductWithVariants('Snacks', 'Cashews', 'https://images.unsplash.com/photo-1538356396657-e1ee4608c021', 450, weightVariants);
    generateProductWithVariants('Snacks', 'Trail Mix', 'https://images.unsplash.com/photo-1558509832-629ee4fa66c3', 300, weightVariants);
    generateProductWithVariants('Snacks', 'Cookies', 'https://images.unsplash.com/photo-1499636138143-bd6490257b25', 90, [{ qty: 'Pack', mult: 1 }]);
    generateProductWithVariants('Snacks', 'Nachos', 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca', 60, [{ qty: 'Pack', mult: 1 }]);
    generateProductWithVariants('Snacks', 'Granola Bar', 'https://images.unsplash.com/photo-1551829633-875c742c3858', 40, [{ qty: 'Bar', mult: 1 }, { qty: 'Box of 6', mult: 5 }]);
    generateProductWithVariants('Snacks', 'Dried Figs', 'https://images.unsplash.com/photo-1605333116960-e44eb28ac23c', 250, weightVariants);
    generateProductWithVariants('Snacks', 'Rice Cakes', 'https://images.unsplash.com/photo-1544321626-d2ed24b8022d', 50, [{ qty: 'Pack', mult: 1 }]);
    generateProductWithVariants('Snacks', 'Peanuts', 'https://images.unsplash.com/photo-1627909304910-ec7b4097e028', 100, weightVariants);
    generateProductWithVariants('Snacks', 'Walnuts', 'https://images.unsplash.com/photo-1582239401925-8272f2323e20', 500, weightVariants);

    // --- 8. INSTANT FOOD ---
    generateProductWithVariants('Instant Food', 'Instant Noodles', 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841', 20, [{ qty: 'Single', mult: 1 }, { qty: '4pk', mult: 3.8 }]);
    generateProductWithVariants('Instant Food', 'Pasta', 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8', 120, [{ qty: '500g', mult: 1 }]);
    generateProductWithVariants('Instant Food', 'Tomato Soup', 'https://images.unsplash.com/photo-1547592166-23acbe32263b', 40, [{ qty: 'Packet', mult: 1 }]);
    generateProductWithVariants('Instant Food', 'Macaroni', 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb', 80, [{ qty: '500g', mult: 1 }]);
    generateProductWithVariants('Instant Food', 'Ready Curry', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641', 150, [{ qty: 'Pack', mult: 1 }]);
    generateProductWithVariants('Instant Food', 'Frozen Pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591', 250, [{ qty: 'Medium', mult: 1 }]);
    generateProductWithVariants('Instant Food', 'Corn Flakes', 'https://images.unsplash.com/photo-1520623251787-8d0092c68616', 180, [{ qty: 'Box', mult: 1 }]);
    generateProductWithVariants('Instant Food', 'Oats', 'https://images.unsplash.com/photo-1612502844222-1985c575797f', 120, [{ qty: '1kg', mult: 1 }]);
    generateProductWithVariants('Instant Food', 'Muesli', 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e', 220, [{ qty: '500g', mult: 1 }]);
    generateProductWithVariants('Instant Food', 'Pancake Mix', 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759', 150, [{ qty: 'Box', mult: 1 }]);
    generateProductWithVariants('Instant Food', 'Peanut Butter', 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8', 200, [{ qty: 'Jar', mult: 1 }]);
    generateProductWithVariants('Instant Food', 'Jam', 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca', 100, [{ qty: 'Jar', mult: 1 }]);
    generateProductWithVariants('Instant Food', 'Pickles', 'https://images.unsplash.com/photo-1589135233689-d56222b51206', 80, [{ qty: 'Jar', mult: 1 }]);
    generateProductWithVariants('Instant Food', 'Canned Beans', 'https://images.unsplash.com/photo-1556910110-a5a63e9e392a', 60, [{ qty: 'Tin', mult: 1 }]);

    // --- 9. PERSONAL CARE ---
    generateProductWithVariants('Personal Care', 'Shampoo', 'https://images.unsplash.com/photo-1585232561028-2cb979a32c2a', 250, [{ qty: '200ml', mult: 1 }, { qty: '500ml', mult: 2.2 }]);
    generateProductWithVariants('Personal Care', 'Shower Gel', 'https://images.unsplash.com/photo-1616781298415-3850fab47bfd', 180, [{ qty: '250ml', mult: 1 }]);
    generateProductWithVariants('Personal Care', 'Toothpaste', 'https://images.unsplash.com/photo-1559304724-6330ce4f6479', 80, [{ qty: '150g', mult: 1 }]);
    generateProductWithVariants('Personal Care', 'Facewash', 'https://images.unsplash.com/photo-1556229162-5c63ed9c4efb', 150, [{ qty: '100ml', mult: 1 }]);
    generateProductWithVariants('Personal Care', 'Hand Soap', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae', 90, [{ qty: '250ml', mult: 1 }]);
    generateProductWithVariants('Personal Care', 'Moisturizer', 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8', 300, [{ qty: '200ml', mult: 1 }]);
    generateProductWithVariants('Personal Care', 'Sunscreen', 'https://images.unsplash.com/photo-1526947425960-945c6e72858f', 400, [{ qty: '100ml', mult: 1 }]);
    generateProductWithVariants('Personal Care', 'Conditioner', 'https://images.unsplash.com/photo-1576426863848-c2185fc6e3c8', 250, [{ qty: '200ml', mult: 1 }]);
    generateProductWithVariants('Personal Care', 'Deodorant', 'https://images.unsplash.com/photo-1619451427882-6eb36a157120', 180, [{ qty: 'Can', mult: 1 }]);
    generateProductWithVariants('Personal Care', 'Perfume', 'https://images.unsplash.com/photo-1541643600914-78b084683601', 1200, [{ qty: '50ml', mult: 1 }]);
    generateProductWithVariants('Personal Care', 'Hair Oil', 'https://images.unsplash.com/photo-1623916960813-f4325a81ca4e', 150, [{ qty: 'Bottle', mult: 1 }]);
    generateProductWithVariants('Personal Care', 'Razor', 'https://images.unsplash.com/photo-1557007798-e7178a2af61f', 120, [{ qty: 'Pack', mult: 1 }]);
    generateProductWithVariants('Personal Care', 'Cotton Pads', 'https://images.unsplash.com/photo-1586548540673-aee3fc59db81', 60, [{ qty: 'Pack', mult: 1 }]);
    generateProductWithVariants('Personal Care', 'Lip Balm', 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e', 100, [{ qty: 'Tube', mult: 1 }]);

    // --- 10. HOUSEHOLD ---
    generateProductWithVariants('Household', 'Laundry Detergent', 'https://images.unsplash.com/photo-1563453392212-326f5e854473', 350, liquidVariants);
    generateProductWithVariants('Household', 'Paper Towels', 'https://images.unsplash.com/photo-1606752766025-v0539-7?auto=format&fit=crop&w=500&q=80', 120, packVariants);
    generateProductWithVariants('Household', 'Dish Soap', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a', 90, liquidVariants);
    generateProductWithVariants('Household', 'Floor Cleaner', 'https://images.unsplash.com/photo-1585670149967-b4f4da66cc48', 150, liquidVariants);
    generateProductWithVariants('Household', 'Toilet Cleaner', 'https://images.unsplash.com/photo-1584622146445-565492d24269', 110, [{ qty: 'Bottle', mult: 1 }]);
    generateProductWithVariants('Household', 'Glass Cleaner', 'https://images.unsplash.com/photo-1610444588506-69502b4f6530', 130, [{ qty: 'Spray', mult: 1 }]);
    generateProductWithVariants('Household', 'Sponges', 'https://images.unsplash.com/photo-1589310243389-963e0f9b12c4', 40, packVariants);
    generateProductWithVariants('Household', 'Trash Bags', 'https://images.unsplash.com/photo-1610425712629-d5872d8a666e', 150, [{ qty: 'Roll', mult: 1 }]);
    generateProductWithVariants('Household', 'Air Freshener', 'https://images.unsplash.com/photo-1586202425624-b58605c4554b', 140, [{ qty: 'Can', mult: 1 }]);
    generateProductWithVariants('Household', 'Batteries', 'https://images.unsplash.com/photo-1620259570543-29c29829f2dc', 100, [{ qty: '4pk', mult: 1 }]);
    generateProductWithVariants('Household', 'Light Bulbs', 'https://images.unsplash.com/photo-1586561214088-251731b3eb38', 120, [{ qty: '2pk', mult: 1 }]);
    generateProductWithVariants('Household', 'Candles', 'https://images.unsplash.com/photo-1602607421271-477ba01a37c9', 200, [{ qty: 'Jar', mult: 1 }]);
    generateProductWithVariants('Household', 'Matches', 'https://images.unsplash.com/photo-1596568265057-0100d0246941', 10, [{ qty: 'Box', mult: 1 }]);
    generateProductWithVariants('Household', 'Tissues', 'https://images.unsplash.com/photo-1584949581559-07759ad7ad57', 60, [{ qty: 'Box', mult: 1 }]);

    return products;
};

module.exports = getProducts;
