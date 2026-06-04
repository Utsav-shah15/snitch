const ImageKit = require('@imagekit/nodejs');
const config = require("../config/config.js");

const client = new ImageKit({
    privateKey: config.IMAGEKIT_PRIVATEKEY
});

async function uploadFile({ buffer, filename, folder = "snitch" }) {
    const result = await client.files.upload({
        file: await ImageKit.toFile(buffer),
        filename,
        folder
    })

    return result;
}

module.exports = uploadFile;



