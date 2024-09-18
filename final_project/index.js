const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

// Importar rutas
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Middleware para analizar JSON
app.use(express.json()); // Asegúrate de que esta línea esté presente

// Configuración de sesiones
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// Middleware de autenticación
app.use("/customer/auth/*", (req, res, next) => {
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

    // Verificar el token
    jwt.verify(token, "your_secret_key", (err, user) => {
        if (err) {
            console.error("JWT verification error:", err); // Agrega esta línea para debuggear
            return res.status(403).json({ message: "Invalid or expired token" });
        }

        req.user = user; // Establecer el usuario en el objeto de solicitud
        next(); 
    });
});

// Configurar rutas
app.use("/customer", customer_routes); // Asegúrate de que esta ruta esté correcta
app.use("/", genl_routes); // Asegúrate de que esta ruta esté correcta

const PORT = 5000;

// Iniciar el servidor
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

