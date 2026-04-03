const express = require('express');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

/* =======================
   MIDDLEWARE
======================= */
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));

/* =======================
   MONGODB CONNECTION
======================= */
mongoose.connect('mongodb://127.0.0.1:27017/myAppDB')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

/* =======================
   SCHEMA + MODEL
======================= */
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String
});

const User = mongoose.model('User', userSchema);

/* =======================
   AUTH MIDDLEWARE
======================= */
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

/* =======================
   ROUTES
======================= */

// Redirect root to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Serve register page
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Serve login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

/* ========= CREATE ========= */
// Register user
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send('User already exists. <a href="/register">Try again</a>');
    }

     // 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword
    });
    await newUser.save();

    // Redirect to login after successful registration
    res.redirect('/login');
  } catch (err) {
    res.send('Error registering user');
  }
});

/* ========= READ ========= */
// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, password });

  if (user) {
    req.session.user = user.email;
    res.redirect('/dashboard');
  } else {
    res.send('Invalid credentials <br><a href="/login">Try again</a>');
  }
});

// View all users (JSON)
app.get('/users', isAuthenticated, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

/* ========= DASHBOARD ========= */
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.send(`
    <h2>Welcome ${req.session.user}</h2>

    <h3>Add Name</h3>
    <form action="/submit" method="POST">
      <input type="text" name="name" placeholder="Enter your name" required>
      <button type="submit">Save</button>
    </form>

    <h3>Update Email</h3>
    <form action="/update" method="POST">
      <input type="email" name="oldEmail" placeholder="Old email" required>
      <input type="email" name="newEmail" placeholder="New email" required>
      <button type="submit">Update</button>
    </form>

    <h3>Delete User</h3>
    <form action="/delete" method="POST">
      <input type="email" name="email" placeholder="Enter email to delete" required>
      <button type="submit">Delete</button>
    </form>

    <br>
    <a href="/users">View All Users (JSON)</a>
    <br><br>
    <a href="/logout">Logout</a>
  `);
});

/* ========= UPDATE ========= */
app.post('/update', isAuthenticated, async (req, res) => {
  const { oldEmail, newEmail } = req.body;

  await User.updateOne({ email: oldEmail }, { $set: { email: newEmail } });
  res.send('Email updated successfully <br><a href="/dashboard">Back</a>');
});

/* ========= DELETE ========= */
app.post('/delete', isAuthenticated, async (req, res) => {
  const { email } = req.body;

  await User.deleteOne({ email });
  res.send('User deleted <br><a href="/dashboard">Back</a>');
});

/* ========= ADD NAME ========= */
app.post('/submit', isAuthenticated, async (req, res) => {
  const { name } = req.body;

  await User.updateOne({ email: req.session.user }, { $set: { name } });
  res.send(`Name saved: ${name} <br><a href="/dashboard">Back</a>`);
});

/* ========= LOGOUT ========= */
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

/* =======================
   SERVER
======================= */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});