// import jwt from 'jsonwebtoken';
// import User from '../models/User.js';

// // const response = await fetch(`http://localhost:3000/api/books`,{
// //     method:'POST',
// //     body: JSON.stringify({
// //         title,
// //         caption
// //     }),
// //     headers:{Authorization : `Bearer  ${token}`},
// // });

// const protectRoute = async(req,res,next) =>{
//     try{
//         // get tokens
//         const token = req.header("Authorization").replace("Bearer","");
//         if(!token){
//             return res.status(401).json({message:"No authentication token access denied"})
//         }
//         //   verify tokens if we have the tokens
//         const decoded = jwt.verify(token,process.env.JWT_SECRET);
//         // find user from the database from the id

//         const user = await User.findById(decoded.userId).select('-password');
//         if(!user){
//             return res.status(400).json({message:"Token is not valid"});
//         }
//         req.user = user;
//         next();

//     } catch(error){
//         console.log("Authentication error",error.message);
//         res.status(401).json({message:"Token is not valid"})
//     }
// }


// export default protectRoute

// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Main authentication middleware
export const auth = async (req, res, next) => {
  try {
    // Get the authorization header
    const authHeader = req.header('Authorization');
    
    // Check if header exists and has the correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }
    
    // Extract token (remove "Bearer " prefix)
    const token = authHeader.replace('Bearer ', '').trim();
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Invalid token format.' 
      });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // IMPORTANT: Your JWT payload uses { userid } (lowercase)
    const user = await User.findById(decoded.userid).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }
    
    // Attach user info to request object
    req.userId = user._id;
    req.username = user.username;
    req.user = user; // Optional: attach full user object
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. Please log in again.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired. Please log in again.' 
      });
    }
    
    res.status(401).json({ 
      success: false, 
      message: 'Authentication failed. Please log in again.' 
    });
  }
};

// Optional: Middleware to check if user is admin
export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (user && user.isAdmin) {
      next();
    } else {
      res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default auth;