const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 7070;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const JWT_SECRET_KEY = "jwt-secret-key";

const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "root",
  database: "contact_db",
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database:", connection.threadId);

  const createUserLoginsTable = `
    CREATE TABLE IF NOT EXISTS user_logins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    )
  `;

  const createContactsTable = `
    CREATE TABLE IF NOT EXISTS contacts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(15),
      FOREIGN KEY (user_id) REFERENCES user_logins(id) ON DELETE CASCADE,
      INDEX (user_id)
    )
  `;

  connection.query(createUserLoginsTable, (err) => {
    if (err) {
      console.error("Error creating user_logins table:", err);
    } else {
      console.log("user_logins table created successfully.");
    }
  });

  connection.query(createContactsTable, (err) => {
    if (err) {
      console.error("Error creating contacts table:", err);
    } else {
      console.log("contacts table created successfully.");
    }
  });

  connection.release();
});

app.listen(PORT, () => {
  console.log(`Our API is running on port ${PORT}`);
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401); // No token provided

  jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user;
    next();
  });
};

// API for user authentication
app.post("/register", (req, res) => {
  const sql =
    "INSERT INTO user_logins (name, email, password) VALUES (?, ?, ?)";

  bcrypt.hash(req.body.password.toString(), 10, (err, hash) => {
    if (err) {
      console.error("Error hashing password:", err);
      return res.json({ error: "Error hashing password" });
    }

    const values = [req.body.name, req.body.email, hash];

    db.query(sql, values, (err) => {
      if (err) {
        console.error("SQL Error:", err);
        return res.json({ error: "Error inserting data in server" });
      }
      return res.json({ status: "Success" });
    });
  });
});

app.post("/login", (req, res) => {
  const sql = "SELECT * FROM user_logins WHERE email = ?";

  db.query(sql, [req.body.email], (err, data) => {
    if (err) {
      return res.json({ error: "Login error in server" });
    }
    if (data.length > 0) {
      bcrypt.compare(
        req.body.password.toString(),
        data[0].password,
        (err, response) => {
          if (err) {
            return res.json({ error: "Password compare error" });
          }
          if (response) {
            const user = { id: data[0].id, email: data[0].email };
            const token = jwt.sign(user, JWT_SECRET_KEY, {
              expiresIn: "1d",
            });
            res.cookie("token", token);
            return res.json({ status: "Success", token });
          } else {
            return res.json({ error: "Password not matched" });
          }
        }
      );
    } else {
      return res.json({ error: "No email existed" });
    }
  });
});

app.get("/getall", authenticateToken, (req, res) => {
  const getAllContacts = "SELECT * FROM contacts WHERE user_id = ?";
  db.query(getAllContacts, [req.user.id], (err, result) => {
    if (!err) {
      res.send(result);
    } else {
      console.error(err);
      res.status(500).send("Error fetching contacts");
    }
  });
});

app.post("/add", authenticateToken, (req, res) => {
  const { name, email, phone } = req.body;
  const addQuery =
    "INSERT INTO contacts (name, email, phone, user_id) VALUES (?, ?, ?, ?)";
  db.query(addQuery, [name, email, phone, req.user.id], (err, result) => {
    if (!err) {
      res.send("Successfully added a contact");
    } else {
      console.error(err);
      res.status(500).send("Error adding contact");
    }
  });
});

app.get("/getsingle/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  const getSingleContact =
    "SELECT * FROM contacts WHERE id = ? AND user_id = ?";
  db.query(getSingleContact, [id, req.user.id], (err, result) => {
    if (!err) {
      res.send(result);
    } else {
      console.error(err);
      res.status(500).send("User not found");
    }
  });
});

app.put("/update/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql =
    "UPDATE contacts SET name = ?, email = ?, phone = ? WHERE id = ? AND user_id = ?";
  db.query(sql, [name, email, phone, id, req.user.id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.json({ message: "Contact updated successfully" });
  });
});

app.delete("/delete/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  const deleteQuery = "DELETE FROM contacts WHERE id = ? AND user_id = ?";
  db.query(deleteQuery, [id, req.user.id], (err, result) => {
    if (!err) {
      res.send("Successfully deleted the contact");
    } else {
      console.error(err);
      res.status(500).send("Error deleting contact");
    }
  });
});
