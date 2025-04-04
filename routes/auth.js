const express = require("express");
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  invite,
  logout,
} = require("../controllers/authController");
const {
  getGoogleAuthURL,
  getTokens,
  getUserInfo,
} = require("../services/googleAuthService");
const User = require("../models/user");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// User authentication routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/invite", invite);
router.get("/logout", logout);

// Google OAuth routes
router.get("/google", (req, res) => {
  res.redirect(getGoogleAuthURL());
});

// router.post("/google/login", async (req, res) => {
//   const { idToken } = req.body;

//   try {
//     if (!idToken) {
//       return res.status(400).json({ message: "ID token is missing." });
//     }

//     // Validate the ID token with Google
//     const googleTokenInfoUrl = "https://www.googleapis.com/oauth2/v3/tokeninfo";
//     const { data: userInfo } = await axios.get(googleTokenInfoUrl, {
//       params: { id_token: idToken },
//     });

//     console.log("User Info from Google:", userInfo);

//     // Check if user exists in the database
//     let user = await User.findOne({ email: userInfo.email });
//     if (!user) {
//       // Create a new user
//       user = new User({
//         googleId: userInfo.sub, // Google unique ID
//         fullName: userInfo.name,
//         email: userInfo.email,
//         // picture: userInfo.picture, // Optional
//       });
//       await user.save();
//     }

//     // Generate a JWT for your application
//     const token = jwt.sign(
//       { id: user._id, email: user.email },
//       process.env.TOKEN_SECRET,
//       { expiresIn: "1d" }
//     );

//     // Send JWT and user details as response
//     res.status(200).json({
//       token,
//       user: { id: user._id, email: user.email, fullName: user.fullName },
//     });
//   } catch (error) {
//     console.error("Error in Google Login:", error);
//     res.status(500).json({ message: "Authentication failed. Try again." });
//   }
// });

router.post("/google/login", async (req, res) => {
  const { idToken } = req.body;

  try {
    if (!idToken) {
      return res.status(400).json({ message: "ID token is missing." });
    }

    // Validate the ID token with Google
    const googleTokenInfoUrl = "https://www.googleapis.com/oauth2/v3/tokeninfo";
    const { data: userInfo } = await axios.get(googleTokenInfoUrl, {
      params: { id_token: idToken },
    });

    // console.log("User Info from Google:", userInfo);

    // Check if user exists in the database
    let user = await User.findOne({ email: userInfo.email });

    if (!user) {
      return res.status(404).json({ message: "User not found. Please sign up first." });
    }

    // Generate a JWT for your application
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // Send JWT and user details as response
    res.status(200).json({
      token,
      user: { id: user._id, email: user.email, fullName: user.fullName },
    });
  } catch (error) {
    console.error("Error in Google Login:", error);
    res.status(500).json({ message: "Authentication failed. Try again." });
  }
});

router.post("/google/signup", async (req, res) => {
  const { idToken } = req.body;

  try {
    if (!idToken) {
      return res.status(400).json({ message: "ID token is missing." });
    }

    // Validate the ID token with Google
    const googleTokenInfoUrl = "https://www.googleapis.com/oauth2/v3/tokeninfo";
    const { data: userInfo } = await axios.get(googleTokenInfoUrl, {
      params: { id_token: idToken },
    });

    // console.log("User Info from Google:", userInfo);

    // Check if the user already exists
    let existingUser = await User.findOne({ email: userInfo.email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists. Please log in." });
    }

    // Create a new user
    const newUser = new User({
      googleId: userInfo.sub, // Google unique ID
      fullName: userInfo.name,
      email: userInfo.email,
      // picture: userInfo.picture, // Optional
    });

    await newUser.save();

    // Generate a JWT for your application
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // Send JWT and user details as response
    res.status(201).json({
      token,
      user: { id: newUser._id, email: newUser.email, fullName: newUser.fullName },
    });
  } catch (error) {
    console.error("Error in Google Signup:", error);
    res.status(500).json({ message: "Signup failed. Try again." });
  }
});


module.exports = router;
