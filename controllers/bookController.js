const fs = require('fs');
const path = require('path');
const Book = require('../models/Book');

// Helper to build image URL
const buildImageUrl = (req, relativePath) => {
    if (!relativePath) return null;
    const normalized = relativePath.replace(/\\/g, '/');
    return `${req.protocol}://${req.get('host')}${normalized.startsWith('/') ? '' : '/'}${normalized}`;
};

exports.createBook = async (req, res) => {
    try {
        const { name, author, description, price } = req.body;
        if (!name || !author || !price) {
            return res.status(400).json({ message: 'name, author and price are required' });
        }

        const numericPrice = Number(price);
        if (Number.isNaN(numericPrice)) {
            return res.status(400).json({ message: 'price must be a number' });
        }

        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        const created = await Book.create({
            name,
            author,
            description: description || null,
            price: numericPrice,
            image: imagePath,
        });

        return res.status(201).json({
            ...created,
            imageUrl: buildImageUrl(req, created.image),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getBooks = async (req, res) => {
    try {
        const books = await Book.findAll();
        const withUrls = books.map(b => ({ ...b, imageUrl: buildImageUrl(req, b.image) }));
        return res.json(withUrls);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        return res.json({ ...book, imageUrl: buildImageUrl(req, book.image) });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await Book.findById(id);
        if (!existing) return res.status(404).json({ message: 'Book not found' });

        const { name, author, description, price } = req.body;
        const numericPrice = price !== undefined ? Number(price) : existing.price;
        if (price !== undefined && Number.isNaN(numericPrice)) {
            return res.status(400).json({ message: 'price must be a number' });
        }

        let imagePath = existing.image;
        if (req.file) {
            // delete old file if exists
            if (existing.image) {
                const absoluteOld = path.join(__dirname, '..', existing.image.replace(/^[\\/]+/, ''));
                fs.unlink(absoluteOld, () => {});
            }
            imagePath = `/uploads/${req.file.filename}`;
        }

        const payload = {
            name: name !== undefined ? name : existing.name,
            author: author !== undefined ? author : existing.author,
            description: description !== undefined ? description : existing.description,
            price: numericPrice,
            image: imagePath,
        };

        const updated = await Book.update(id, payload);
        return res.json({ ...updated, imageUrl: buildImageUrl(req, updated.image) });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await Book.findById(id);
        if (!existing) return res.status(404).json({ message: 'Book not found' });

        const deleted = await Book.delete(id);
        if (deleted && existing.image) {
            const absoluteOld = path.join(__dirname, '..', existing.image.replace(/^[\\/]+/, ''));
            fs.unlink(absoluteOld, () => {});
        }
        return res.json({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


