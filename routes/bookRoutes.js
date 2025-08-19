const path = require('path');
const express = require('express');
const multer = require('multer');
const { createBook, getBooks, getBookById, updateBook, deleteBook } = require('../controllers/bookController');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_%]/g, '_');
        cb(null, `${timestamp}_${safeName}`);
    },
});

const upload = multer({ storage });

// Routes
router.post('/', upload.single('image'), createBook);
router.get('/', getBooks);
router.get('/:id', getBookById);
router.put('/:id', upload.single('image'), updateBook);
router.delete('/:id', deleteBook);

module.exports = router;


