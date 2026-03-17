const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to read form data
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML & CSS)
app.use(express.static(path.join(__dirname, 'public')));