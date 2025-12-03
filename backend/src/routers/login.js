const express = require("express");
const { postLogin } = require("../controllers/login.js");

module.exports = (app) => {
    const router = express.Router();

    app.post("/login", postLogin);
};
