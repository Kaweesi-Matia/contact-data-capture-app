const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Middleware to read form data
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: true
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Fake user (for learning)
const USER = {
  email: "test@gmail.com",
  password: "1234"
};

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === USER.email && password === USER.password) {
    req.session.user = email;
    res.redirect('/dashboard');
  } else {
    res.send('Invalid credentials');
  }
});

// Auth middleware
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.send('You must login first');
  }
}