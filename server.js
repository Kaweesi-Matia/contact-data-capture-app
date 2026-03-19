const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = 3000;

// Middleware to read form data
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
  }),
);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Fake user (for learning)
const USER = {
  email: "test@gmail.com",
  password: "1234",
};

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === USER.email && password === USER.password) {
    req.session.user = email;
    res.redirect("/dashboard");
  } else {
    res.send("Invalid credentials");
  }
});

// Auth middleware
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.send("You must login first");
  }
}

// Dashboard (Protected route)
app.get("/dashboard", isAuthenticated, (req, res) => {
  res.send(`
    <h2>Welcome ${req.session.user}</h2>

    <form action="/submit" method="POST">
      <input type="text" name="name" placeholder="Enter your name" required>
      <input type="email" name="email" placeholder="Enter your email" required>
      <button type="submit">Submit</button>
    </form>

    <br>
    <a href="/logout">Logout</a>
  `);
});

//  submit(protected route)
app.post("/submit", isAuthenticated, (req, res) => {
  const { name, email } = req.body;

  res.send(`
    <h2>Thank you, ${name}!</h2>
    <p>Your email: ${email}</p>
    <a href="/dashboard">Back</a>
  `);
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
