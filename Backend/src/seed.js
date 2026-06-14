const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const User = require("./models/user.models");
const Product = require("./models/product.model");

const BRANDS = ["Snitch"];
const COLORS = ["Black", "White", "Beige", "Olive Green", "Charcoal Grey", "Navy Blue", "Off-White", "Cream", "Brown", "Khaki"];
const CONDITIONS = ["New", "Like New", "Good", "Fair"];
const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

// Image pools from Unsplash
const IMAGES = {
    Tops: [
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
        "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800",
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800",
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800",
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800",
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800"
    ],
    Bottoms: [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800",
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800",
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800",
        "https://images.unsplash.com/photo-1584865288642-42078afe6942?w=800",
        "https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=800"
    ],
    Footwear: [
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800",
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
        "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800",
        "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800"
    ],
    Accessories: [
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800",
        "https://images.unsplash.com/photo-1576053139778-7e32f2ae3cf4?w=800",
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800",
        "https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=800",
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"
    ]
};

// Templates for generating items
const TEMPLATES = {
    Tops: [
        { name: "Oversized Tee", basePrice: 999, variants: ["Graphic Print", "Heavyweight Boxy", "Drop Shoulder", "Acid Wash"] },
        { name: "Hoodie", basePrice: 2299, variants: ["Pullover Fleece", "Zip-Up Retro", "Cyberpunk Heavy", "Distressed Slouchy"] },
        { name: "Sweatshirt", basePrice: 1799, variants: ["Minimal Crewneck", "Vintage college", "Loose fit comfort"] },
        { name: "Casual Shirt", basePrice: 1499, variants: ["Flannel Checkered", "Oversized Denim", "Boxy Linen", "Utility Pocket"] },
        { name: "Tank Top", basePrice: 699, variants: ["Ribbed Activewear", "Gym Relaxed", "Basic Cotton"] }
    ],
    Bottoms: [
        { name: "Cargo Pants", basePrice: 1999, variants: ["Multi-pocket Tactical", "Wide Leg Utility", "Parachute Relaxed", "Gorpcore Techwear"] },
        { name: "Jeans", basePrice: 2499, variants: ["Baggy Skater", "Distressed Straight Fit", "90s Vintage Wide", "Slim Fit Denim"] },
        { name: "Shorts", basePrice: 1199, variants: ["Sweat Shorts", "Utility Cargo Shorts", "Nylon Active Shorts"] },
        { name: "Joggers", basePrice: 1499, variants: ["Heavy Fleece Sweatpants", "Cuffed Active Jogger", "Minimal Lounge Pants"] },
        { name: "Chinos", basePrice: 1799, variants: ["Smart Casual Slim", "Loose Pleated Chino"] }
    ],
    Footwear: [
        { name: "Sneakers", basePrice: 4999, variants: ["Retro Low Top Leather", "Chunky Hype Platform", "Minimalist White Classic", "Urban Running Shoe"] },
        { name: "High Tops", basePrice: 5499, variants: ["Vintage Skate High-Tops", "Street Style Canvas"] },
        { name: "Boots", basePrice: 6999, variants: ["Chunky Chelsea Leather Boots", "Tactical Combat Boot"] },
        { name: "Slides", basePrice: 1299, variants: ["Cozy Cushion Platform Slides", "Casual Gym Slides"] }
    ],
    Accessories: [
        { name: "Cap", basePrice: 799, variants: ["Distressed Dad Hat", "Vintage Trucker Cap", "Streetwear Bucket Hat"] },
        { name: "Beanie", basePrice: 699, variants: ["Ribbed Knit Slouchy Beanie", "Minimalist Docker Cap"] },
        { name: "Chain", basePrice: 999, variants: ["Cuban Link Silver Chain", "Chunky Lock Pendant Necklace"] },
        { name: "Sunglasses", basePrice: 1199, variants: ["Retro Acetate Rectangular", "Y2K Futuristic Rimless", "Classic Aviators"] },
        { name: "Bag", basePrice: 1899, variants: ["Tactical Chest Rig Crossbody", "Utility Canvas Backpack", "Sling Messenger Bag"] }
    ]
};

const OCCASIONS = [
    { name: "College Outfit", tags: ["college", "campus", "casual", "everyday", "student"] },
    { name: "Date Night", tags: ["date night", "romantic", "smart casual", "dinner", "evening vibe"] },
    { name: "Gym Workout", tags: ["gym", "workout", "fitness", "activewear", "athletic"] },
    { name: "Party Night", tags: ["party", "club", "night out", "dancing", "hype"] },
    { name: "Travel Look", tags: ["travel", "airport look", "vacation", "comfy holiday", "transit"] },
    { name: "Winter Wear", tags: ["winter", "cold weather", "cosy layering", "warm knit"] },
    { name: "Summer Vibe", tags: ["summer", "hot weather", "beach", "sunny day", "breathable"] }
];

const AESTHETICS = [
    { name: "Streetwear", tags: ["streetwear", "urban", "oversized", "drip", "hypebeast"] },
    { name: "Vintage", tags: ["vintage", "retro", "90s", "thrifted", "classic"] },
    { name: "Minimalist", tags: ["minimalist", "clean", "basic", "essential", "neutral"] },
    { name: "Y2K", tags: ["y2k", "baggy", "trendy", "skater", "futuristic"] },
    { name: "Korean Style", tags: ["korean style", "oversized fit", "soft aesthetic", "aesthetic"] },
    { name: "Techwear", tags: ["techwear", "utility", "cargo", "tactical", "gorpcore"] }
];

const seedDatabase = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.error("MONGO_URI not found in environment variables.");
            process.exit(1);
        }

        console.log("Connecting to Database...");
        await mongoose.connect(mongoUri);
        console.log("Connected successfully!");

        // 1. Fetch created sellers
        const sellers = await User.find({ isSeller: true });
        if (sellers.length === 0) {
            console.error("No sellers found! Please run the seller account generation script first.");
            process.exit(1);
        }
        console.log(`Found ${sellers.length} seller accounts to distribute products.`);

        // 2. Clear previous products
        console.log("Clearing previous product listings...");
        await Product.deleteMany({});

        // 3. Generate 250 listings
        const productsToInsert = [];
        const TOTAL_PRODUCTS = 250;

        console.log(`Generating ${TOTAL_PRODUCTS} products with custom occasions, brands, aesthetics...`);

        for (let i = 0; i < TOTAL_PRODUCTS; i++) {
            // Determine category distribution
            // Tops: 80, Bottoms: 70, Footwear: 50, Accessories: 50
            let category = "Tops";
            if (i >= 80 && i < 150) {
                category = "Bottoms";
            } else if (i >= 150 && i < 200) {
                category = "Footwear";
            } else if (i >= 200) {
                category = "Accessories";
            }

            // Pick seller
            const seller = sellers[i % sellers.length];

            // Pick random elements
            const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            const condition = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
            
            // Sizes (Footwear & Accessories gets "Free Size", clothes get normal clothing sizes)
            const size = (category === "Footwear" || category === "Accessories") 
                ? "Free Size" 
                : CLOTHING_SIZES[Math.floor(Math.random() * CLOTHING_SIZES.length)];

            // Select product template
            const catTemplates = TEMPLATES[category];
            const template = catTemplates[Math.floor(Math.random() * catTemplates.length)];
            const variant = template.variants[Math.floor(Math.random() * template.variants.length)];

            // Construct title: e.g. "Beige Oversized Graphic Tee"
            const title = `${color} ${variant} ${template.name}`;

            // Select 1-2 random occasions
            const occasionIndex1 = Math.floor(Math.random() * OCCASIONS.length);
            let occasionIndex2 = Math.floor(Math.random() * OCCASIONS.length);
            if (occasionIndex1 === occasionIndex2) {
                occasionIndex2 = (occasionIndex2 + 1) % OCCASIONS.length;
            }
            const occasion1 = OCCASIONS[occasionIndex1];
            const occasion2 = OCCASIONS[occasionIndex2];

            // Select random aesthetic
            const aesthetic = AESTHETICS[Math.floor(Math.random() * AESTHETICS.length)];

            // Construct rich description with tags integrated for semantic search
            const allSearchTags = [
                ...occasion1.tags,
                ...occasion2.tags,
                ...aesthetic.tags,
                brand.toLowerCase(),
                color.toLowerCase(),
                category.toLowerCase(),
                condition.toLowerCase()
            ];

            const description = `This premium ${template.name} is a must-have piece. Featuring a stylish ${color} tone with a distinct ${aesthetic.name} vibe, it is perfect for any ${occasion1.name} or ${occasion2.name} look. Fits comfortably with high-durability fabrics. Condition: ${condition}.`;

            // Calculate price based on category basePrice + randomized padding
            const pricePadding = Math.floor(Math.random() * 800) - 200; // -200 to +600
            const amount = Math.max(299, template.basePrice + pricePadding);

            // Select random category image
            const catImages = IMAGES[category];
            const imageUrl = catImages[Math.floor(Math.random() * catImages.length)];

            productsToInsert.push({
                title,
                description,
                seller: seller._id,
                price: { amount, currency: "INR" },
                images: [{ url: imageUrl }],
                category,
                size,
                condition,
                stock: Math.floor(Math.random() * 5) + 1, // 1 to 5 items in stock
                status: "active"
            });
        }

        // Shuffle the products array so categories are mixed chronologically
        for (let idx = productsToInsert.length - 1; idx > 0; idx--) {
            const jdx = Math.floor(Math.random() * (idx + 1));
            [productsToInsert[idx], productsToInsert[jdx]] = [productsToInsert[jdx], productsToInsert[idx]];
        }

        console.log("Saving products to MongoDB...");
        const createdProducts = await Product.insertMany(productsToInsert);
        console.log(`Success! Seeded ${createdProducts.length} listings in total.`);
        
        process.exit(0);
    } catch (err) {
        console.error("Error seeding products:", err);
        process.exit(1);
    }
};

seedDatabase();
