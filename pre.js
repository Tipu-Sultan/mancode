const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const smtpTransport = require("nodemailer-smtp-transport");
const bodyParser = require("body-parser");
const cors = require("cors");

const main = require("./modals/db");
main()
  .then()
  .catch((err) => console.log(err));
const {
  JWT_TOKEN,
  EMAIL_FROM,
  EMAIL_PASS,
  accountSid,
  authToken,
  PORT,
  HOST,
} = require("./config/keys");
const client = require("twilio")(accountSid, authToken);

const corsOptions = {
  origin: "https://themancode.vercel.app", // Allow only this origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow credentials (e.g., cookies)
};
// Middleware
const app = express();
app.use(bodyParser.json());
if (process.env.NODE_ENV === "production") {
  app.use(cors(corsOptions));
} else {
  app.use(cors());
}

// Connect to MongoDB
const File = require("./modals/video");
const UserData = require("./modals/Register");
const EditorModel = require("./modals/editor");

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // Uploads folder where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({ storage });

// Define a route for file uploads
app.post("/", (req, res) => {
  const { email, password } = req.body;
  res.json({ email: email, password: password });
});

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  // Save file details to MongoDB
  const newFile = new File({
    filename: req.file.filename,
    mimetype: req.file.mimetype, // Add mimetype
    originalname: req.file.originalname, // Add originalname
    path: req.file.path,
    size: req.file.size,
  });

  try {
    await newFile.save();
    return res.status(200).json({ message: "Video added successfully" });
  } catch (err) {
    console.error("Error saving file details to MongoDB:", err);
    return res
      .status(500)
      .json({ message: "Error saving file details to MongoDB." });
  }
});

// for signup

// Function to send a verification email
const sendVerificationEmail = async (email, subject, message, msg) => {
  // Create a transporter using nodemailer (replace with your actual email service configuration)
  const transporter = nodemailer.createTransport(
    smtpTransport({
      service: "gmail",
      auth: {
        user: EMAIL_FROM, // Your Gmail email address
        pass: EMAIL_PASS, // Your Gmail password or App Password
      },
    })
  );

  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject: `${subject}`,
    text: `${message}`,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};

// Your existing registration route

app.post("/signup", async (req, res) => {
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
});

function isStrongPassword(password) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

/// login with authentication

app.post("/checkAuth", async (req, res) => {
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
        const token = jwt.sign({ userId: user._id }, JWT_TOKEN);
        res.json({ token, user, message: "Login successful" });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/forgotPassword", async (req, res) => {
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
});

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhoneNumber(phoneNumber) {
  // Phone number regex for demonstration (matches 10-digit numbers)
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phoneNumber);
}

// Define the route to update data by ID in the database

app.post("/resetPassword", async (req, res) => {
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
});

// API endpoint to update user status from inactive to active
app.put("/activate/:token", async (req, res) => {
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

    return res
      .status(200)
      .json({
        message: `Hi ${updatedUser.full_name} your A/c activated successfully`,
      });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res
      .status(500)
      .json({ message: "An error occurred while activating the user" });
  }
});

app.post("/codeblocks", async (req, res) => {
  try {
    // Get data from the request body
    const { title, languages, content } = req.body;

    // Create a new code block
    const newCodeBlock = new EditorModel({
      title,
      languages,
      content
    });

    // Save the code block to the database
    await newCodeBlock.save();

    // Send a success response
    res.status(201).json({ message: "Code block saved successfully" });
  } catch (error) {
    // Handle errors
    console.error("Error saving code block:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/codeblocks", async (req, res) => {
  try {
    const codeBlocks = await EditorModel.find();
    res.json(codeBlocks);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/reader/:cid", async (req, res) => {
  try {
    const codeBlock = await EditorModel.findOne({ _id: req.params.cid });

    if (!codeBlock) {
      return res.status(404).json({ error: "Code block not found" });
    }

    res.json(codeBlock);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put('/updatecode/:cid', async (req, res) => {
  const { title, languages, content } = req.body;

  try {
    const updatedCodeBlock = await EditorModel.findByIdAndUpdate(
      req.params.cid,
      { title, languages, content },
      { new: true }
    );

    if (!updatedCodeBlock) {
      return res.status(404).json({ message: 'Code block not found' });
    }

    res.status(201).json({ message: 'Code updated successfully', updatedCodeBlock });
  } catch (error) {
    console.error('Error updating code block:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/codeblocks/:id', async (req, res) => {
  try {
    const deletedCodeBlock = await EditorModel.findByIdAndDelete(req.params.id);

    if (!deletedCodeBlock) {
      return res.status(404).json({ message: 'Code block not found' });
    }

    res.status(200).json({ message: 'Code block deleted successfully' });
  } catch (error) {
    console.error('Error deleting code block:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
