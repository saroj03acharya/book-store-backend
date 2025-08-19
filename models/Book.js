const { pool } = require('../config/database');

class Book {
    constructor(id, name, author, description, price, image) {
        this.id = id;
        this.name = name;
        this.author = author;
        this.description = description;
        this.price = price;
        this.image = image;
    }

    // Create books table
    static async createTable() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS books (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                image VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        
        try {
            await pool.execute(createTableQuery);
            console.log('Books table created successfully');
        } catch (error) {
            console.error('Error creating books table:', error);
            throw error;
        }
    }

    // Create a new book
    static async create(bookData) {
        const { name, author, description, price, image } = bookData;
        const query = `
            INSERT INTO books (name, author, description, price, image)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        try {
            const [result] = await pool.execute(query, [name, author, description, price, image]);
            return { id: result.insertId, ...bookData };
        } catch (error) {
            console.error('Error creating book:', error);
            throw error;
        }
    }

    // Get all books
    static async findAll() {
        const query = 'SELECT * FROM books ORDER BY created_at DESC';
        
        try {
            const [rows] = await pool.execute(query);
            return rows;
        } catch (error) {
            console.error('Error fetching books:', error);
            throw error;
        }
    }

    // Get book by ID
    static async findById(id) {
        const query = 'SELECT * FROM books WHERE id = ?';
        
        try {
            const [rows] = await pool.execute(query, [id]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error fetching book by ID:', error);
            throw error;
        }
    }

    // Update book
    static async update(id, bookData) {
        const { name, author, description, price, image } = bookData;
        const query = `
            UPDATE books 
            SET name = ?, author = ?, description = ?, price = ?, image = ?
            WHERE id = ?
        `;
        
        try {
            const [result] = await pool.execute(query, [name, author, description, price, image, id]);
            if (result.affectedRows === 0) {
                return null;
            }
            return { id, ...bookData };
        } catch (error) {
            console.error('Error updating book:', error);
            throw error;
        }
    }

    // Delete book
    static async delete(id) {
        const query = 'DELETE FROM books WHERE id = ?';
        
        try {
            const [result] = await pool.execute(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting book:', error);
            throw error;
        }
    }
}

module.exports = Book;
