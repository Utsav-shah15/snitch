const ImageKit = require('@imagekit/nodejs');
const config = require("../config/config.js");
const fs = require("fs");
const path = require("path");

let client;
try {
    client = new ImageKit({
        privateKey: config.IMAGEKIT_PRIVATEKEY
    });
} catch (e) {
    console.warn("Could not initialize ImageKit. Local storage fallback will be used.");
}

async function uploadFile({ buffer, filename, folder = "snitch" }) {
    try {
        if (!client) {
            throw new Error("ImageKit client not initialized");
        }
        const result = await client.files.upload({
            file: await ImageKit.toFile(buffer),
            fileName: filename,
            folder
        });
        return result;
    } catch (error) {
        console.warn(`[ImageKit Warning] Upload failed (${error.message}). Saving file to local storage instead.`);
        
        try {
            // Local uploads directory in public folder
            const uploadsDir = path.join(process.cwd(), "public/uploads");
            
            // Create folder if it doesn't exist
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            
            // Generate unique clean filename
            const cleanFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
            const destPath = path.join(uploadsDir, cleanFilename);
            
            // Save buffer locally
            fs.writeFileSync(destPath, buffer);
            
            // Return local server url
            return {
                url: `http://localhost:3000/uploads/${cleanFilename}`
            };
        } catch (localError) {
            console.error("Local file save failed:", localError);
            throw new Error("Failed to upload image locally");
        }
    }
}

module.exports = uploadFile;