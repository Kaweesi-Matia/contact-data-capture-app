const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to read form data
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML & CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Handle form submission
app.post('/submit', (req, res) => {
  const { name, email } = req.body;

  console.log("Name:", name);
  console.log("Email:", email);

  res.send(`<h2>Thank you, ${name}!</h2><p>Your email: ${email}</p>`);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});