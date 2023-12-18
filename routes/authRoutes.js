// authRoutes.js
const express = require("express");
const router = express.Router();


const { signup, checkLoginAuth, forgotPassword, resetPassword, activateAuthUser } = require("../controller/auth");


router.post("/signup",signup);

/// login with authentication

router.post("/login",checkLoginAuth);

router.post("/forgotPassword", forgotPassword);



// Define the route to update data by ID in the database

router.post("/resetPassword", resetPassword);

// API endpoint to update user status from inactive to active
router.put("/activate/:token",activateAuthUser);

module.exports = router;
