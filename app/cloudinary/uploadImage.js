const cloudinary = require("cloudinary").v2;

// Configuration 
cloudinary.config({
    cloud_name: "dzdqry9tt",
    api_key: "387468886483457",
    api_secret: "ysJaP-ntXbvuECyx_VIbNohZaGk"
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
