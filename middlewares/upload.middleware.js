import multer from 'multer';

const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    console.log('File received:', file);
    if (file.fieldname === 'picture') {
      cb(null, true);
    } else {
      cb(new multer.MulterError('Unexpected field', file.fieldname), false);
    }
  },
});

export default upload;
