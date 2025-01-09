const express = require('express');
const app = express();
const port = 3000;

app.get('/api', (req, res) => {
  res.send('Hello from Firebase and Node.js!');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
