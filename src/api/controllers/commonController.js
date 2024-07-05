exports.uploadSingleImage = async (req, res) => {
    try {
     
      res.status(200).send({ imageUrl:req.file.filename, success: true });
    } catch (error) {
  
      return res.status(500).json({ error: error.message, success: false });
    }
  }
  
  exports.uploadMultipleFile = async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded', success: false });
      }
  
      const imageUrls = [];
      req.files.forEach(file => {
        
        imageUrls.push(req.file.filename);
      });
  
      res.status(200).send({ imageUrls, success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message, success: false });
    }
  }