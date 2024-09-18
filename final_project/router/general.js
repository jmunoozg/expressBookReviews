const express = require('express');
const axios = require('axios'); // Importar Axios
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Ruta para obtener la lista de libros disponible en la tienda
public_users.get('/books', async (req, res) => {
    try {
        // Devolver la lista de libros directamente desde booksdb.js
        res.status(200).json(books);
    } catch (error) {
        console.error("Error fetching book list:", error);
        res.status(500).json({ message: "Failed to retrieve book list" });
    }
});

// Ruta para obtener los detalles del libro basado en ISBN usando async-await y Axios
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    try {
        // Obtener los detalles del libro directamente desde booksdb.js
        const book = books[isbn];

        if (book) {
            res.status(200).json(book);
        } else {
            res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        console.error("Error fetching book details:", error);
        res.status(500).json({ message: "Failed to retrieve book details" });
    }
});

public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author.toLowerCase();

    try {
        // Buscar libros por autor directamente desde booksdb.js
        const booksByAuthor = [];

        for (let isbn in books) {
            if (books[isbn].author.toLowerCase() === author) {
                booksByAuthor.push(books[isbn]);
            }
        }

        if (booksByAuthor.length > 0) {
            res.status(200).json(booksByAuthor);
        } else {
            res.status(404).json({ message: "No books found by this author" });
        }
    } catch (error) {
        console.error("Error fetching books by author:", error);
        res.status(500).json({ message: "Failed to retrieve books by author" });
    }
});

public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title.toLowerCase();

    try {
        // Buscar libros por título directamente desde booksdb.js
        const booksByTitle = [];

        for (let isbn in books) {
            if (books[isbn].title.toLowerCase() === title) {
                booksByTitle.push(books[isbn]);
            }
        }

        if (booksByTitle.length > 0) {
            res.status(200).json(booksByTitle);
        } else {
            res.status(404).json({ message: "No books found with this title" });
        }
    } catch (error) {
        console.error("Error fetching books by title:", error);
        res.status(500).json({ message: "Failed to retrieve books by title" });
    }
});

module.exports.general = public_users;



