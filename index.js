const express = require('express');
const app = express();

// Define a route for /
app.get('/', (req, res) => {
  res.send('Welcome to my Node.js app!');
});

// Define a route for /api
app.get('/api', (req, res) => {
  res.send('Hello from Vercel and Node.js!');
});

module.exports = app; // Export the app for Vercel
