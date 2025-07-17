const MulterImageHandler = (uploader) => {
  return (req, res, next) => {
    uploader(req, res, function (err) {
      if (err) {
        return res.status(400).json({
          message: err.code === 'LIMIT_FILE_SIZE' ? 'File size exceeded: Please upload a file smaller than the allowed limit' :
                   err.code === 'LIMIT_FILE_COUNT' ? 'Too many files: Please upload only one file at a time' :
                   err.code === 'LIMIT_UNEXPECTED_FILE' ? 'Unexpected file field: Please use the correct field name for file upload' :
                   err.message || 'File upload error: Unable to process the uploaded file',
          data: {
            errorCode: err.code,
            fieldName: err.field
          }
        });
      }
      next();
    });
  };
};

const MulterFileHandler = (uploader) => {
  return (req, res, next) => {
    uploader(req, res, function (err) {
      if (err) {
        return res.status(400).json({
          message: err.code === 'LIMIT_FILE_SIZE' ? 'File size exceeded: Please upload a file smaller than the allowed limit' :
                   err.code === 'LIMIT_FILE_COUNT' ? 'Too many files: Please upload only one file at a time' :
                   err.code === 'LIMIT_UNEXPECTED_FILE' ? 'Unexpected file field: Please use the correct field name for file upload' :
                   err.message || 'File upload error: Unable to process the uploaded file',
          data: {
            errorCode: err.code,
            fieldName: err.field
          }
        });
      }
      next();
    });
  };
};

export {
  MulterImageHandler,
  MulterFileHandler
}