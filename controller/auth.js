const UserData = require("../models/Register");
const {
  JWT_TOKEN,
  accountSid,
  authToken,
  HOST,
} = require("../config/keys");
const {
  isStrongPassword,
  isValidEmail,
  isValidPhoneNumber,
} = require("../services/services")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendVerificationEmail } = require("../services/sendmail");
const { setUser, getUser } = require("../middleware/authenticate");
const client = require("twilio")(accountSid, authToken);



async function signup(req, res) {
  // Generate a password reset token (you need to implement this logic)
  const token = Math.floor(100000 + Math.random() * 900000);

  const { full_name, email, phoneNumber, password } = req.body;
  try {
    // Check if the email already exists in the database
    const existingUser = await UserData.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    } else if (!isStrongPassword(password)) {
      return res.status(409).json({
        error:
          "Password must be at least 8 characters long and contain e.g: (@Mancode10)",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    const user = new UserData({
      full_name,
      email,
      phoneNumber,
      password: hashedPassword,
      token,
    });
    const saved = await user.save();

    // Send verification email
    const msg = "User registered successfully.";
    const subject = "Account verification email";
    const message = `Please click following link for verification account  ${HOST}/activation/${token}`;
    await sendVerificationEmail(email, subject, message, msg);
    res.status(201).json({ message: `${msg}` });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while registering the user" });
  }
}

async function checkLoginAuth(req, res) {
  const { email, password } = req.body;
  const status = "active";

  try {
    const user = await UserData.findOne({ email, status }).exec();

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
    } else {
      // Compare the provided password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        const token = setUser(user,JWT_TOKEN);
        res.cookie('uuid', token, {
          domain:'http://localhost:3000',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Change to 'production' in production
          maxAge: 60 * 60 * 1000,
          sameSite: 'Strict',
          path: '/',
        });        
        res.status(200).json({ token,message: "Login successful" });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function forgotPassword(req, res) {
  const { userValue } = req.body;

  try {
    let query;
    if (isValidEmail(userValue)) {
      query = { email: userValue };
    } else if (isValidPhoneNumber(userValue)) {
      query = { phoneNumber: userValue };
    } else {
      return res.status(400).json({ error: "Invalid email or number input" });
    }

    // Check if the user exists
    const user = await UserData.findOne(query);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a password reset token (you need to implement this logic)
    const otpToken = Math.floor(100000 + Math.random() * 900000);

    // Update the user's token based on email or phone number
    const updatedUser = await UserData.findOneAndUpdate(
      query,
      { $set: { otp: otpToken } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "OTP not UPDATED or Send" });
    }

    if (isValidEmail(userValue)) {
      // Send OTP to email
      // Send verification email
      const msg = "An OTP sent to " + userValue;
      const subject = "OTP Request Email";
      const message = `Your OTP IS : ${otpToken}`;

      await sendVerificationEmail(userValue, subject, message, msg);
      res.status(201).json({ message: `${msg}` });
    } else if (isValidPhoneNumber(userValue)) {
      // Send OTP to phone number
      client.messages
        .create({
          body: `Hi, ${user.full_name} Your OTP is: ${otpToken} , do not share to any one, Thank You.`,
          from: "+12562911993",
          to: "+91" + userValue,
        })
        .then(() => {
          res.json({ message: "OTP sent on phone" });
        })
        .catch((error) => {
          console.error("Error sending OTP to phone:", error);
          res.status(500).json({ error: "Error sending OTP to phone" });
        });
    }
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function resetPassword(req, res) {
  const { password, cpassword, otp } = req.body;

  if (password !== cpassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(cpassword, 10); // 10 is the salt rounds

    const updatedUser = await UserData.findOneAndUpdate(
      { otp },
      { $set: { password: hashedPassword } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "Invalid OTP" });
    }

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function activateAuthUser(req, res) {
  const { token } = req.params;

  try {
    // Assuming you have a model named UserData
    const updatedUser = await UserData.findOneAndUpdate(
      { token },
      { $set: { status: "active" } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: `Hi ${updatedUser.full_name} your A/c activated successfully`,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res
      .status(500)
      .json({ message: "An error occurred while activating the user" });
  }
}

async function getUsersData(req, res) {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ msg: 'Unauthorized - Token not provided' });
    }

    const authToken = token.split(' ')[1];

    // Now you can use authToken in your code
    const uid = getUser(authToken, JWT_TOKEN);

    if (!uid) {
      return res.json({ msg: 'Unauthorized accesse' });
    }

    const user = await UserData.findOne({ _id: uid }, { password: 0, otp: 0, token: 0 });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}



module.exports = {
  signup,
  checkLoginAuth,
  forgotPassword,
  resetPassword,
  activateAuthUser,
  getUsersData,
}