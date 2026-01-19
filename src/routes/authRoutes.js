// import express from "express";
// import User from "../models/User.js";
// import jwt from "jsonwebtoken";

// const router = express.Router(); 
// const generateToken = (userid) => {
//   return jwt.sign({ userid }, process.env.JWT_SECRET, { expiresIn: "105d" });
// };
// // this is for signup  page
// router.post("/register", async (req, res) => {
//   // res.send('REGISTER PAGE')
//   const { username, email, password } = req.body;
//   console.log("frontend seh data aata hua",username, email, password); 
//   try {
//     const { username, email, password } = req.body;
//     if (!username || !email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }
//     if (password < 7) {
//       return res
//         .status(400)
//         .json({ message: "Passwords its to short atleast 7 characters Long" });
//     }
//     if (username < 3) {
//       return res.status(400).json({ message: "Its to short" });
//     }
//     // check if the user already exist in the database
//     const existingUsername = await User.findOne({ username });
//     if (existingUsername) {
//       return res.status(400).json({ message: "Username already exist" });
//       e;
//     }
//     // for checking email
//     const existingEmail = await User.findOne({ email });
//     if (existingEmail) {
//       return res.status(400).json({ message: "Email already exist" });
//     }
//     // get a random profile image
//     const profileImage = `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`;

//     // now we have to create a new user
//     const user = new User({
//       email,
//       username,
//       password,
//       profileImage,
//     });
//     await user.save();
//     const token = generateToken(user._id);
//     res.status(201).json({
//       token,
//       user: {
//         _id: user._id,
//         username: user.username,
//         email: user.email,
//         profileImage: user.profileImage,
//         createdAt: user.createdAt,
//       },
//     });
//   } catch (error) {
//     console.log("error in register route", error.message);
//     res.status(500).json({ message: error?.message });
//   }
// });



// router.post("/login", async (req, res) => {
//   //res.send("LOGIN PAGE");
//   const { email, password } = req.body;
//   console.log("frontend seh data aata hua", email, password);

//   try {
//     if (!email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }
//     // check if user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "User does not exist" });
//     }
//     // checks if the user passwords is entered correct or not
//     const isPasswordCorrect = await user.comparePassword(password);
//     if(!isPasswordCorrect){
//       return res.status(400).json({message:"Incorrect password"});
//     }
//     // generate token
//     const token = generateToken(user._id);
//     res.status(201).json({
//       token,
//       user: {
//         _id: user._id,
//         username: user.username,
//         email: user.email,
//         profileImage: user.profileImage,
//         createdAt: user.createdAt,
//       },
//     });

//   } catch (error) {
//     res.status(500).json({message:error?.message})
//   }
// });

// export default router;


// routes/authRoutes.js
import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Generate JWT token with user info
const generateToken = (user) => {
  return jwt.sign(
    { 
      userid: user._id,     // Keep lowercase 'userid' for consistency
      username: user.username, // Add username to token
      email: user.email     // Optional: add email if needed
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: "105d" }   // ~3.5 months
  );
};

// User Registration
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    console.log("Registration attempt:", { username, email });
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }
    
    if (password.length < 7) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 7 characters long" 
      });
    }
    
    if (username.length < 3) {
      return res.status(400).json({ 
        success: false, 
        message: "Username must be at least 3 characters long" 
      });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Please enter a valid email address" 
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      const field = existingUser.username === username ? "username" : "email";
      return res.status(400).json({ 
        success: false, 
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
      });
    }

    // Create user with avatar
    const profileImage = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
    
    const user = new User({ 
      email, 
      username, 
      password, 
      profileImage 
    });
    
    await user.save();
    
    // Generate token
    const token = generateToken(user);
    
    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
    
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Server error during registration" 
    });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("Login attempt for email:", email);
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }
    
    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }
    
    // Generate token
    const token = generateToken(user);
    
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
    
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Server error during login" 
    });
  }
});

// Get current user (protected route example)
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }
    
    const token = authHeader.replace('Bearer ', '').trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userid).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
    
  } catch (error) {
    console.error("Get user error:", error.message);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
});

export default router;