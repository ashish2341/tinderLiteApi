const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
       // const uploadDir = 'uploads/';
        const uploadDir = path.join(process.cwd(), 'uploads');
        try {
            // Create uploads directory if it does not exist
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        } catch (error) {
            cb(new Error('Failed to create upload directory'), null);
        }
    },
    filename: (req, file, cb) => {
        try {
            cb(null, Date.now() + '-' + file.originalname);
        } catch (error) {
            cb(new Error('Failed to generate file name'), null);
        }
    }
});

const uploadSingleFile = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB file size limit
});

// Middleware to handle file upload errors
const handleFileUpload = (uploadFunction) => {
    return (req, res, next) => {
        uploadFunction(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                return res.status(400).json({ success:false,error: err.message });
            } else if (err) {
                // An unknown error occurred when uploading.
                return res.status(500).json({ success:false,error: 'An error occurred while uploading the file.' });
            }
            // Everything went fine.
            next();
        });
    };
};

module.exports = {
    uploadSingleFile,
    handleFileUpload
};
