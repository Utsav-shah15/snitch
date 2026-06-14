const Product = require("../models/product.model");
const Order = require("../models/order.model");
const { generateJSON, generateText } = require("../services/ai.service");

// In-memory cache for outfit suggestions
const outfitCache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes TTL

// Get /api/ai/search — AI semantic search results
const aiSearch = async (req, res) => {
    const { q } = req.query;
    if (!q || q.trim().length < 3) {
        return res.status(400).json({ error: "Search query too short" });
    }

    try {
        const prompt = `You are a fashion search assistant for an Indian streetwear resale marketplace called "Snitch".
The marketplace has these categories: Tops, Bottoms, Footwear, Accessories.
Sizes available: XS, S, M, L, XL, XXL, Free Size.
Conditions: New, Like New, Good, Fair.

A user searched: "${q}"

Understand the user's intent (occasion, vibe, style, season, etc.) and return a JSON object with:
{
  "interpretation": "brief 1-line description of what the user is looking for (in English)",
  "categories": ["matching categories from: Tops, Bottoms, Footwear, Accessories"],
  "keywords": ["5-8 search keywords to match product titles and descriptions"],
  "maxPrice": null or a number if user implied a budget,
  "style": "one word style tag like casual, formal, sporty, streetwear, ethnic"
}

Return ONLY valid JSON, no explanation.`;

        const aiResult = await generateJSON(prompt);

        // Build MongoDB filter from AI interpretation
        const filter = { status: "active", stock: { $gt: 0 } };

        // Category filter
        if (aiResult.categories && aiResult.categories.length > 0) {
            filter.category = { $in: aiResult.categories };
        }

        // Price filter
        if (aiResult.maxPrice) {
            filter["price.amount"] = { $lte: aiResult.maxPrice };
        }

        // Keyword search across title and description
        if (aiResult.keywords && aiResult.keywords.length > 0) {
            const keywordRegex = aiResult.keywords.join("|");
            filter.$or = [
                { title: { $regex: keywordRegex, $options: "i" } },
                { description: { $regex: keywordRegex, $options: "i" } },
            ];
        }

        const products = await Product.find(filter)
            .sort({ createdAt: -1 })
            .limit(20)
            .populate("seller", "fullName sellerProfile.shopName sellerProfile.avatar");

        // If AI search found nothing, fall back to broad keyword search
        let fallbackProducts = [];
        if (products.length === 0 && aiResult.keywords?.length > 0) {
            const broadFilter = {
                status: "active",
                stock: { $gt: 0 },
                $or: [
                    { title: { $regex: aiResult.keywords[0], $options: "i" } },
                    { description: { $regex: aiResult.keywords[0], $options: "i" } },
                ],
            };
            fallbackProducts = await Product.find(broadFilter)
                .sort({ createdAt: -1 })
                .limit(20)
                .populate("seller", "fullName sellerProfile.shopName sellerProfile.avatar");
        }

        res.status(200).json({
            interpretation: aiResult.interpretation,
            style: aiResult.style,
            products: products.length > 0 ? products : fallbackProducts,
            totalResults: products.length > 0 ? products.length : fallbackProducts.length,
        });
    } catch (error) {
        console.error("AI Search error, falling back to smart local search:", error.message);
        
        // Fallback: Smart local parsing if AI search fails or rate limits
        try {
            const cleanQuery = q.toLowerCase();
            
            // 1. Extract Price Limit
            let maxPrice = null;
            const priceMatch = cleanQuery.match(/(?:under|below|less than|within|budget|rs\.?|inr)?\s*(\d+)/i);
            if (priceMatch) {
                const parsedVal = parseInt(priceMatch[1], 10);
                if (parsedVal > 100) { 
                    maxPrice = parsedVal;
                }
            }

            // 2. Extract Category
            let category = null;
            if (/\b(shirts?|tees?|t-shirts?|hoodies?|sweatshirts?|tops?|tanks?|jackets?)\b/i.test(cleanQuery)) {
                category = "Tops";
            } else if (/\b(cargos?|pants?|jeans?|denims?|shorts?|joggers?|bottoms?|chinos?)\b/i.test(cleanQuery)) {
                category = "Bottoms";
            } else if (/\b(sneakers?|shoes?|boots?|slides?|footwears?|kicks)\b/i.test(cleanQuery)) {
                category = "Footwear";
            } else if (/\b(caps?|beanies?|chains?|glasses|sunglasses?|bags?|backpacks?|accessories?|rings?|watches?)\b/i.test(cleanQuery)) {
                category = "Accessories";
            }

            // 3. Extract Keywords & Expand Synonyms / Occasions
            const stopWords = new Set(["under", "below", "less", "than", "within", "budget", "rs", "inr", "outfit", "dress", "look", "for", "with", "a", "an", "the", "to", "in", "of", "and", "or", "ke", "liye"]);
            let words = cleanQuery.split(/[\s,.-]+/).filter(w => w.length > 1 && !stopWords.has(w) && isNaN(w));

            // Query Expansion: Map conceptual search terms to product attributes
            const expansions = [];
            if (cleanQuery.includes("college") || cleanQuery.includes("campus") || cleanQuery.includes("student")) {
                expansions.push("hoodie", "oversized", "tee", "cargo", "sneaker", "jogger", "jeans");
            }
            if (cleanQuery.includes("date") || cleanQuery.includes("romantic") || cleanQuery.includes("dinner")) {
                expansions.push("shirt", "boots", "chinos", "classic", "minimal");
            }
            if (cleanQuery.includes("gym") || cleanQuery.includes("workout") || cleanQuery.includes("fitness") || cleanQuery.includes("active")) {
                expansions.push("jogger", "shorts", "tank", "running");
            }
            if (cleanQuery.includes("party") || cleanQuery.includes("club") || cleanQuery.includes("night")) {
                expansions.push("graphic", "black", "leather", "high top");
            }
            if (cleanQuery.includes("travel") || cleanQuery.includes("vacation") || cleanQuery.includes("airport")) {
                expansions.push("hoodie", "cargo", "sneakers", "comfy");
            }
            if (cleanQuery.includes("winter") || cleanQuery.includes("cold")) {
                expansions.push("hoodie", "sweatshirt", "jacket", "beanie");
            }
            if (cleanQuery.includes("summer") || cleanQuery.includes("beach") || cleanQuery.includes("hot")) {
                expansions.push("shorts", "tee", "tank", "slides");
            }

            expansions.forEach(word => {
                if (!words.includes(word)) {
                    words.push(word);
                }
            });

            // Build filter
            const filter = { status: "active", stock: { $gt: 0 } };
            
            if (category) {
                filter.category = category;
            }
            if (maxPrice) {
                filter["price.amount"] = { $lte: maxPrice };
            }
            
            if (words.length > 0) {
                const keywordRegex = words.join("|");
                filter.$or = [
                    { title: { $regex: keywordRegex, $options: "i" } },
                    { description: { $regex: keywordRegex, $options: "i" } }
                ];
            }

            const products = await Product.find(filter)
                .sort({ createdAt: -1 })
                .limit(20)
                .populate("seller", "fullName sellerProfile.shopName sellerProfile.avatar");

            res.status(200).json({
                interpretation: `Smart Search: ${category || "All Items"}${maxPrice ? ` under ₹${maxPrice}` : ""}${words.length ? ` matching "${words.join(", ")}"` : ""}`,
                style: "casual",
                products,
                totalResults: products.length,
            });
        } catch (dbErr) {
            res.status(500).json({ error: "Search failed completely", details: dbErr.message });
        }
    }
};

// GET /api/ai/outfit-suggestions/:id-outfit suggestions
const getOutfitSuggestions = async (req, res) => {
    try {
        const productId = req.params.id;

        // 1. Check in-memory cache
        if (outfitCache.has(productId)) {
            const cached = outfitCache.get(productId);
            if (Date.now() - cached.timestamp < CACHE_TTL) {
                return res.status(200).json(cached.data);
            } else {
                outfitCache.delete(productId);
            }
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        try {
            const prompt = `You are a fashion stylist for an Indian streetwear marketplace.
The available product categories are ONLY: Tops, Bottoms, Footwear, Accessories.

A user is viewing this product:
- Title: "${product.title}"
- Category: "${product.category}"
- Description: "${product.description}"

Suggest complementary items to complete the outfit. Return JSON:
{
  "suggestions": [
    {
      "category": "one of: Tops, Bottoms, Footwear, Accessories",
      "label": "section label like 'Pair with Bottoms' or 'Add Footwear'",
      "keywords": ["3-5 keywords to search for matching items"],
      "style_tip": "1-line styling tip"
    }
  ]
}

Rules:
- Do NOT suggest the same category as the viewed product (${product.category}).
- Suggest 2-3 complementary categories max.
- Keywords should be specific to Indian streetwear/fashion.
- Return ONLY valid JSON.`;

            const aiResult = await generateJSON(prompt);

            const suggestionsWithProducts = await Promise.all(
                (aiResult.suggestions || []).map(async (suggestion) => {
                    // Optimized single DB query on indexes (status, stock, category) instead of regex scan
                    const candidateProducts = await Product.find({
                        status: "active",
                        stock: { $gt: 0 },
                        _id: { $ne: product._id },
                        category: suggestion.category,
                    })
                        .populate("seller", "fullName sellerProfile.shopName")
                        .limit(24);

                    // Rank matching products in memory
                    const keywords = (suggestion.keywords || []).map(k => k.toLowerCase());
                    const scoredProducts = candidateProducts.map(p => {
                        let score = 0;
                        const titleLower = p.title.toLowerCase();
                        const descLower = (p.description || "").toLowerCase();

                        keywords.forEach(keyword => {
                            if (titleLower.includes(keyword)) score += 5;
                            if (descLower.includes(keyword)) score += 1;
                        });
                        return { product: p, score };
                    });

                    // Sort by relevance score
                    scoredProducts.sort((a, b) => b.score - a.score);
                    const items = scoredProducts.slice(0, 6).map(sp => sp.product);

                    return {
                        category: suggestion.category,
                        label: suggestion.label,
                        styleTip: suggestion.style_tip,
                        products: items,
                    };
                })
            );

            let finalSuggestions = suggestionsWithProducts.filter((s) => s.products.length > 0);

            // Resilient Fallback: If recommended categories have no items, show any other active items
            if (finalSuggestions.length === 0) {
                const otherProducts = await Product.find({
                    status: "active",
                    stock: { $gt: 0 },
                    _id: { $ne: product._id },
                })
                    .limit(6)
                    .populate("seller", "fullName sellerProfile.shopName");

                if (otherProducts.length > 0) {
                    finalSuggestions = [
                        {
                            category: "Recommended",
                            label: "More Style Items",
                            styleTip: "Complete your look with these top streetwear finds.",
                            products: otherProducts,
                        },
                    ];
                }
            }

            const resultResponse = { suggestions: finalSuggestions };

            // Cache response
            outfitCache.set(productId, {
                timestamp: Date.now(),
                data: resultResponse,
            });

            return res.status(200).json(resultResponse);
        } catch (aiError) {
            console.error("Gemini API error, using database fallback for outfits:", aiError.message);
            
            // Fallback: Get items from other categories
            const targetCategories = ["Tops", "Bottoms", "Footwear", "Accessories"].filter(c => c !== product.category);
            
            const fallbackSuggestions = await Promise.all(
                targetCategories.slice(0, 2).map(async (cat) => {
                    const items = await Product.find({
                        status: "active",
                        stock: { $gt: 0 },
                        _id: { $ne: product._id },
                        category: cat,
                    })
                        .limit(6)
                        .populate("seller", "fullName sellerProfile.shopName");

                    return {
                        category: cat,
                        label: `Pair with ${cat}`,
                        styleTip: `Add some complementary ${cat.toLowerCase()} to level up your fit.`,
                        products: items,
                    };
                })
            );

            let finalFallback = fallbackSuggestions.filter((s) => s.products.length > 0);

            // Resilient Fallback for error block: If target categories have no items, show any other active items
            if (finalFallback.length === 0) {
                const otherProducts = await Product.find({
                    status: "active",
                    stock: { $gt: 0 },
                    _id: { $ne: product._id },
                })
                    .limit(6)
                    .populate("seller", "fullName sellerProfile.shopName");

                if (otherProducts.length > 0) {
                    finalFallback = [
                        {
                            category: "Recommended",
                            label: "More Style Items",
                            styleTip: "Complete your look with these top streetwear finds.",
                            products: otherProducts,
                        },
                    ];
                }
            }

            const fallbackResponse = { suggestions: finalFallback };

            // Cache fallback response
            outfitCache.set(productId, {
                timestamp: Date.now(),
                data: fallbackResponse,
            });

            return res.status(200).json(fallbackResponse);
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to get outfit suggestions", details: error.message });
    }
};

// POST /ai/generate-description-generate Description
const generateDescription = async (req, res) => {
    const { title, category, condition, keywords } = req.body;

    if (!title || !category) {
        return res.status(400).json({ error: "Title and category are required" });
    }

    try {
        const prompt = `You are a product listing copywriter for a premium streetwear resale marketplace called "Snitch".

Write a structured, professional, and clean product description for:
- Title: "${title}"
- Category: ${category}
- Condition: ${condition || "Like New"}
- Extra keywords/details: ${keywords || "None"}

Please format the response EXACTLY like this template:

Elevate your streetwear collection with this [describe item based on title/category]. Designed for a [describe fit and comfort], this piece delivers the perfect balance of style and everyday wearability. [Write 1 more styling suggestion sentence].

Features:
- [Specific feature 1, e.g. Boxy/Oversized silhouette]
- [Specific feature 2, e.g. Premium soft fabric]
- [Specific feature 3, e.g. Streetwear inspired design]
- [Specific feature 4, e.g. Easy to style with cargos or jeans]

Condition: ${condition || "Like New"}
Style: Streetwear / Casual
Fit: [Inferred fit from title, e.g. Oversized, Regular, Boxy]

Rules:
- Strictly follow the above structure.
- Do NOT use hashtags (e.g. #streetwear).
- Do NOT use casual slang like "cop this", "ultimate street cred", "drop tomorrow".
- Do NOT use emojis.
- Keep the tone clean, premium, and highly searchable.`;

        const description = await generateText(prompt);
        res.status(200).json({ description });
    } catch (error) {
        console.error("Gemini API error, falling back to local template description:", error.message);
        
        // Clean structured fallback description matching the requested template
        const fitWord = title.toLowerCase().includes("oversized") ? "Oversized" : "Regular";
        const condWord = condition || "Like New";
        const catWord = category || "Tops";
        
        const description = `Elevate your streetwear collection with this clean ${title}. Designed for a relaxed and comfortable fit, this piece delivers the perfect balance of style and everyday wearability. Ideal for daily casual styling or layered street outfits.

Features:
- Premium comfortable fabric construction
- Clean classic streetwear silhouette
- Versatile design suitable for daily wear
- Easy to style with cargos, denim, or shorts

Condition: ${condWord}
Style: Streetwear / Casual
Fit: ${fitWord}`;
        
        res.status(200).json({ description });
    }
};

// POST /ai/suggest-price-range
const suggestPrice = async (req, res) => {
    const { title, category, condition, size } = req.body;

    if (!category) {
        return res.status(400).json({ error: "Category is required" });
    }

    // Pre-calculate real market metrics from DB
    let avgPrice = 1299;
    let minPrice = 499;
    let maxPrice = 2999;
    let similarCount = 0;

    try {
        const filter = { status: "active", category };
        if (condition) filter.condition = condition;
        if (size) filter.size = size;

        const similarProducts = await Product.find(filter).limit(15).select("price");
        similarCount = similarProducts.length;

        if (similarCount > 0) {
            const prices = similarProducts.map((p) => p.price.amount);
            minPrice = Math.min(...prices);
            maxPrice = Math.max(...prices);
            avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / similarCount);
        }
    } catch (dbErr) {
        console.error("DB metrics query error:", dbErr.message);
    }

    try {
        const prompt = `You are a pricing assistant for an Indian streetwear resale marketplace.

A seller wants to list:
- Title: "${title || 'Not specified'}"
- Category: ${category}
- Condition: ${condition || "Not specified"}
- Size: ${size || "Not specified"}

Market data for similar products:
- ${similarCount} similar listings found
- Price range: ₹${minPrice} - ₹${maxPrice}
- Average price: ₹${avgPrice}

Return JSON:
{
  "suggestedPrice": number (in INR),
  "priceRange": { "min": number, "max": number },
  "reasoning": "1-2 line explanation of why this price",
  "tip": "1-line pricing tip for the seller"
}

If no market data, estimate based on typical Indian streetwear resale prices.
Return ONLY valid JSON.`;

        const aiResult = await generateJSON(prompt);

        res.status(200).json({
            ...aiResult,
            marketData: {
                similarListings: similarCount,
                avgPrice,
                minPrice,
                maxPrice,
            },
        });
    } catch (error) {
        console.error("Gemini API error, falling back to local price prediction:", error.message);
        
        // Adjust average based on condition
        let finalSuggested = avgPrice;
        if (condition === "New") finalSuggested = Math.round(avgPrice * 1.15);
        if (condition === "Fair") finalSuggested = Math.round(avgPrice * 0.8);

        res.status(200).json({
            suggestedPrice: finalSuggested,
            priceRange: {
                min: Math.round(finalSuggested * 0.8),
                max: Math.round(finalSuggested * 1.2),
            },
            reasoning: "Price estimated based on the average listing rates of similar products in this category.",
            tip: "Price it on the lower end of the range to find buyers faster!",
            marketData: {
                similarListings: similarCount,
                avgPrice,
                minPrice,
                maxPrice,
            },
        });
    }
};

// GET /ai/trends
const getTrends = async (req, res) => {
    let categorySales = [];
    let recentListings = [];

    try {
        categorySales = await Order.aggregate([
            { $match: { status: "delivered" } },
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "productData",
                },
            },
            { $unwind: "$productData" },
            {
                $group: {
                    _id: "$productData.category",
                    totalSold: { $sum: "$quantity" },
                    totalRevenue: { $sum: "$totalPrice" },
                    avgPrice: { $avg: "$totalPrice" },
                },
            },
            { $sort: { totalSold: -1 } },
        ]);

        recentListings = await Product.aggregate([
            { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);
    } catch (dbErr) {
        console.error("DB aggregate trends error:", dbErr.message);
    }

    try {
        const prompt = `You are a fashion trend analyst for an Indian streetwear resale marketplace called "Snitch".
Categories: Tops, Bottoms, Footwear, Accessories.

Sales data (delivered orders):
${JSON.stringify(categorySales, null, 2)}

Recent listings (last 30 days):
${JSON.stringify(recentListings, null, 2)}

Analyze this data and return JSON:
{
  "trends": [
    {
      "title": "trend title (e.g., 'Oversized Tees are 🔥')",
      "category": "Tops/Bottoms/Footwear/Accessories",
      "status": "rising" or "stable" or "declining",
      "description": "1-2 line trend insight",
      "confidence": "high" or "medium" or "low"
    }
  ],
  "prediction": "2-3 line prediction about what will trend next month in Indian streetwear",
  "tip": "1-line actionable tip for sellers"
}

Provide 3-5 trends. If data is limited, use your knowledge of Indian streetwear trends.
Return ONLY valid JSON.`;

        const aiResult = await generateJSON(prompt);
        res.status(200).json(aiResult);
    } catch (error) {
        console.error("Gemini API error, falling back to static trends dashboard:", error.message);
        
        // Static fallbacks
        res.status(200).json({
            trends: [
                {
                    title: "Oversized Tees & Heavy Hoodies",
                    category: "Tops",
                    status: "rising",
                    description: "Relaxed drop-shoulder aesthetics, vintage washes, and heavy GSM graphic prints are dominating buyer demand.",
                    confidence: "high"
                },
                {
                    title: "Baggy Jeans & Cargo Bottoms",
                    category: "Bottoms",
                    status: "rising",
                    description: "Multi-pocket tactical designs and retro wide-leg denim are highly searched styles this month.",
                    confidence: "high"
                },
                {
                    title: "Retro Sneakers & Runners",
                    category: "Footwear",
                    status: "stable",
                    description: "Chunky white sneakers and low-top retro silhouettes maintain a steady sales volume.",
                    confidence: "medium"
                }
            ],
            prediction: "Next month expect a major surge in heavy knitwear and aesthetic graphic zip-up hoodies as street style shifts to layered looks.",
            tip: "List items using descriptive tags like 'vintage', 'boxy fit', or 'heavy gsm' to improve visibility in search results."
        });
    }
};

module.exports = {
    aiSearch,
    getOutfitSuggestions,
    generateDescription,
    suggestPrice,
    getTrends,
};
