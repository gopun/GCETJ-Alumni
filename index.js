const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());  // Enable CORS for all origins

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");  // Allow requests from all domains, or specify domains like: 'https://yourdomain.com'
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.use(express.json());  // Middleware to handle JSON request bodies

// Example Route Handling
app.get('/', (req, res) => {
  res.send('Backend is working!');
});

app.post('/backend', (req, res) => {
  res.send('Data received!');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
