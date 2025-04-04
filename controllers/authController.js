const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../services/emailService");


exports.signup = async (req, res) => {
  const { fullName, email, password, organization } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      organization,
      role: "user", // Default role for newly registered users
    });

    await user.save();

    res.status(201).json({ message: "Signup successful. Please log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred during signup" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // Verify the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.TOKEN_SECRET, {
      expiresIn: "1d",  // chaneged from 1h to 1d
    });
    res.status(200).json({
      token: token,
      expiresIn: 3600,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// exports.profile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select("-password");
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.TOKEN_SECRET, {
      expiresIn: "1d",  // chaneged from 1h to 1d
    });

    const resetUrl =
      `${process.env.SERVER_URL}/reset-password/${token}`;

      const message = `You requested a password reset. Click the link below to set a new password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

    await sendEmail(user.email, "Password Reset", message);

    // Send the email with the reset link
    res.status(200).json({ message: "Email sent" });
  } catch (err) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// exports.resetPassword = async (req, res) => {
//   try {
//     const userId = req.user.id; // Assuming `req.user` contains the authenticated user details
//     const { currentPassword, newPassword } = req.body;

//     // Find the user by ID
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Check if the current password matches
//     const isMatch = await bcrypt.compare(currentPassword, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Current password is incorrect" });
//     }

//     // Hash the new password
//     const salt = await bcrypt.genSalt(10);
//     const hashedNewPassword = await bcrypt.hash(newPassword, salt);

//     // Update the user's password
//     user.password = hashedNewPassword;
//     await user.save();

//     res.status(200).json({ message: "Password changed successfully" });
//   } catch (error) {
//     console.error("Error changing password:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

exports.resetPassword = async (req, res) => {
  try {
    const userId = req.query.id; // Get userId from query params
    const { password, confirmPassword } = req.body;

    // Validate input
    if (!userId || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Find user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.invite = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const token = jwt.sign({ email }, process.env.TOKEN_SECRET, {
      expiresIn: "1d",  // chaneged from 1h to 1d
    });
    const inviteUrl = `${process.env.SERVER_URL}/signup/${token}`;
    const message = `You have been invited to join our platform. Please sign up using this link: \n\n ${inviteUrl}`;
    await sendEmail(email, "Invitation", message);
    res.json({ message: "Invitation sent" });
  }
  catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// exports.getUsers = async (req, res) => {
//   try {
//     const users = await User.find().select("-password").limit(5);
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// exports.changeRole = async (req, res) => {
//   const { userId, role } = req.body;
//   try {
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     user.role = role;
//     await user.save();
//     res.json(user);
//   }
//   catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.logout = async (req, res) => {
  res.json({ message: "Logged out" });
};