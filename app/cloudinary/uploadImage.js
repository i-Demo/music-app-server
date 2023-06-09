const cloudinary = require("cloudinary").v2;

// Configuration
cloudinary.config({
    cloud_name: `${process.env.CLOUD_NAME}`,
    api_key: `${process.env.CLOUD_API_KEY}`,
    api_secret: `${process.env.CLOUD_API_SECRET}`
});

// Config

// Upload
const uploadImage = (image, publicId) => {
    //image = > base64
    const opts = {
        overwrite: true,
        invalidate: true,
        resource_type: "auto",
        public_id: publicId,
    };

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(image, opts, (error, result) => {
            if (result && result.secure_url) {
                // console.log(result);
                return resolve(result.secure_url);
            }
            // console.log(error.message);
            return reject({ message: error.message });
        });
    });
};

module.exports = uploadImage;
