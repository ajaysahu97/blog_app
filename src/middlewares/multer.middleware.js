import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname ) 
  }
})

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf', 'text/csv'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and CSV files are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter
})