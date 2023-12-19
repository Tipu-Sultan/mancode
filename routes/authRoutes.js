// authRoutes.js
const express = require("express");
const router = express.Router()
const { signup, checkLoginAuth, forgotPassword, resetPassword, activateAuthUser, getUsersData } = require("../controller/auth");
const { getUser } = require("../middleware/authenticate");


router.post("/signup", signup);

/// login with authentication

router.post("/login", checkLoginAuth);

router.post("/forgotPassword", forgotPassword);



// Define the route to update data by ID in the database

router.post("/resetPassword", resetPassword);

// API endpoint to update user status from inactive to active
router.put("/activate/:token", activateAuthUser);

router.get("/profile",getUsersData);

module.exports = router;
