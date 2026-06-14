const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

/**
 * getModel — returns a Gemini generative model instance.
 * @param {string} modelName - defaults to gemini-2.0-flash
 */
const getModel = (modelName = "gemini-2.0-flash") => {
    return genAI.getGenerativeModel({ model: modelName });
};

/**
 * generateJSON — sends a prompt to Gemini and parses the JSON response.
 * Strips markdown fences if Gemini wraps the output.
 */
const generateJSON = async (prompt) => {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Strip markdown code fences if present
    const cleaned = text
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

    return JSON.parse(cleaned);
};

/**
 * generateText — sends a prompt and returns raw text.
 */
const generateText = async (prompt) => {
    const model = getModel();
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
};

module.exports = { getModel, generateJSON, generateText };
