const express = require("express");
const { login } = require("../controllers/login.js");

module.exports = (app) => {
    const router = express.Router();

    app.post("/login", login);
};
