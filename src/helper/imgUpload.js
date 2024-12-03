const multer = require('multer');

const storage = multer.memoryStorage(); 

const uploadSingleFile = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 },
});

// Middleware to handle file upload errors
const handleFileUpload = (uploadFunction) => {
    return (req, res, next) => {
        uploadFunction(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ success: false, error: err.message });
            } else if (err) {
                return res.status(500).json({ success: false, error: 'An error occurred while uploading the file.' });
            }
            next();
        });
    };
};

module.exports = {
    uploadSingleFile,
    handleFileUpload
};
