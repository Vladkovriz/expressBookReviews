const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return !users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{
    let validusers = users.filter((user)=>{
      return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
      return true;
    } else {
      return false;
    }
  }

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
    if (authenticatedUser(username,password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = {
                accessToken,username
            };
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;

    const book = books[isbn];

    const {username} = req.session.authorization;

    let i = 1;

    while(book.reviews[i]) {
        const reviews = book.reviews;
        if(reviews[i]?.username === username) {
            reviews[i].review = review;
            break;
        } else {
            const newReview = { review, username };
            reviews = { ...reviews, newReview};
        }

        i++;
    }

    return res.status(200).json({message: "Review successfully added"});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;

    const book = books[isbn];

    const {username} = req.session.authorization;

    let i = 1;

    while(book.reviews[i]) {
        const reviews = book.reviews;
        if(reviews[i]?.username === username) {
            delete reviews[i];
            break;
        }

        i++;
    }

    return res.status(200).json({message: "Review successfully deleted"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
