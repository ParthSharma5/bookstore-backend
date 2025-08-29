import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router(); //✅
const generateToken = (userid) => {
  return jwt.sign({ userid }, process.env.JWT_SECRET, { expiresIn: "105d" });
};
// this is for signup  page
router.post("/register", async (req, res) => {
  // res.send('REGISTER PAGE')
  const { username, email, password } = req.body;
  console.log("frontend seh data aata hua",username, email, password); 
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password < 7) {
      return res
        .status(400)
        .json({ message: "Passwords its to short atleast 7 characters Long" });
    }
    if (username < 3) {
      return res.status(400).json({ message: "Its to short" });
    }
    // check if the user already exist in the database
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exist" });
      e;
    }
    // for checking email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exist" });
    }
    // get a random profile image
    const profileImage = `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`;

    // now we have to create a new user
    const user = new User({
      email,
      username,
      password,
      profileImage,
    });
    // now we have to save the new user info
    await user.save();
    // NOW GENERATE TOKENS
    const token = generateToken(user._id);
    // send token to the client
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.log("error in register route", error.message);
    res.status(500).json({ message: error?.message });
  }
});



router.post("/login", async (req, res) => {
  //res.send("LOGIN PAGE");
  const { email, password } = req.body;
  console.log("frontend seh data aata hua", email, password);

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }
    // checks if the user passwords is entered correct or not
    const isPasswordCorrect = await user.comparePassword(password);
    if(!isPasswordCorrect){
      return res.status(400).json({message:"Incorrect password"});
    }
    // generate token
    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });

  } catch (error) {
    res.status(500).json({message:error?.message})
  }
});

export default router;
