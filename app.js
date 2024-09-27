const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const path = require('path');

const bookRoutes = require('./routes/book'); // Import des routes pour les livres

const app = express();

// Connexion à MongoDB
mongoose
  .connect('mongodb+srv://test:portugal9@coursoc.e6b5f.mongodb.net/CoursOC?retryWrites=true&w=majority')
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Middleware de sécurité Helmet
app.use(helmet());

// Middleware pour gérer les CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Middleware pour parser les requêtes en JSON
app.use(express.json());

// Middleware pour servir les fichiers statiques (ex: images)
app.use('/images', express.static(path.join(__dirname, 'images')));

// Route pour les livres
app.use('/api/books', bookRoutes);

// Export de l'application pour l'utiliser dans server.js
module.exports = app;
