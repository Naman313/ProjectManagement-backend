exports.uploadFile = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      res.status(200).json({ fileUrl: `/uploads/${req.file.filename}` });
    } catch (error) {
      res.status(500).json({ message: "File upload failed", error });
    }
  };
  
  