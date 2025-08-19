const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');
const Book = require('./models/Book');
const bookRoutes = require('./routes/bookRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

// Static files for uploaded images
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/books', bookRoutes);

// Health check
app.get('/', (req, res) => {
	res.json({ status: 'ok', service: 'books-api' });
});

// Start server
const PORT = process.env.PORT || 3000;
(async () => {
	await testConnection();
	await Book.createTable();
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
})();


