const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// Lista de usuarios registrados
let users = [
  { username: "existinguser", password: "password" }  // Usuario de prueba
];

// Función para validar si el username ya está registrado
const isValid = (username) => {
  return users.some(user => user.username === username);
}

// Función para verificar si el username y password son correctos
const authenticatedUser = (username, password) => {
  return users.find(user => user.username === username && user.password === password);
}

// Ruta para que los usuarios registrados hagan login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Verificar si el username o el password están vacíos
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Verificar si el usuario existe y si la contraseña es correcta
  const user = authenticatedUser(username, password);
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Si el login es exitoso, generar un token JWT
  const token = jwt.sign({ username }, "your_secret_key", { expiresIn: '1h' });

  // Guardar el token en la sesión
  req.session.token = token;

  return res.status(200).json({ message: "Login successful", token });
});

// Middleware para autenticar el token
regd_users.use("/auth/*", (req, res, next) => {
  let token = req.session.token || req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  // Limpieza del token si viene en formato Bearer
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  } else {
    return res.status(401).json({ message: "Invalid token format" });
  }

  jwt.verify(token, "your_secret_key", (err, user) => {
    if (err) {
      console.error("JWT verification error:", err); // Para debugging
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.user = user;
    next(); 
  });
});

// Ruta para agregar una reseña de un libro por un usuario autenticado
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { review } = req.body;
  const { isbn } = req.params;
  
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Asumimos que el usuario autenticado está en `req.user`
  const username = req.user.username;

  // Agregar o actualizar la reseña
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully" });
});

// Ruta para eliminar una reseña de un libro por un usuario autenticado
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Asumimos que el usuario autenticado está en `req.user`
  const username = req.user.username;

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user" });
  }

  // Eliminar la reseña del libro
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
