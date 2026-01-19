// import express from "express";
// import Recommendation from "../models/Recommendation.js";

// import { auth } from "../middleware/authMiddleware.js";
// const router = express.Router();

// // get all Recommendation
// router.get("/", async (req, res) => {
//   try {
//     const recommendations = await Recommendation.find()
//       .sort({ createdAt: -1 })
//       .populate("user", "username");
//     res.status(200).json({ success: true, recommendations });
//     console.log(recommendations);
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//     console.log("db error in getting recommendations");
//   }
// });

// // get users recommendations
// router.get("/my", auth, async (req, res) => {
//   try {
//     const recommendations = await Recommendation.find({ user: req.userId }).sort(
//       { createdAt: -1 },
//     );
//     res.status(200).json({ success: true, recommendations });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // create a  new Recommendation
// router.post("/", auth, async (req, res) => {
//   try {
//     const { bookTitle, caption, rating, image } = req.body;
//     const recommendation = new Recommendation({
//       user: req.userId,
//       bookTitle,
//       caption,
//       rating,
//       image,
//       username: req.username,
//     });
//     await recommendation.save();
//     res.status(201).json({
//       success: true,
//       message: "Recommendation created successfully",
//       recommendation,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//     console.log("db error in creating recommendation");
//   }
// });

// // delete a Recommmendation
// router.delete("/:id", auth, async (req, res) => {
//   try {
//     const recommendation = await Recommendation.findById(req.params.id);
//     if (!recommendation) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Recommendation not found" });
//     }
//     if (recommendation.user.toString() !== req.userId) {
//       return res.status(403).json({ success: false, message: "Unauthorized" });
//     }
//     await recommendation.deleteOne();
//     res
//       .status(200)
//       .json({ success: true, message: "Recommendation deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//     console.log("db error in deleting recommendation");
//   }
// });

// export default router;
import express from "express";
import Recommendation from "../models/Recommendation.js";
import { auth } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// Get all recommendations (public)
router.get("/", async (req, res) => {
  try {
    const recommendations = await Recommendation.find()
      .sort({ createdAt: -1 })
      .populate("user", "username");
    res.status(200).json({ success: true, recommendations });
  } catch (err) {
    console.error("Database error in getting recommendations:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get user's recommendations (protected)
router.get("/my", auth, async (req, res) => {
  try {
    const recommendations = await Recommendation.find({ user: req.userId })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, recommendations });
  } catch (err) {
    console.error("Error getting user recommendations:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create a new recommendation (protected)
router.post("/", auth, async (req, res) => {
  try {
    const { bookTitle, caption, rating, image } = req.body;
    
    // Validate required fields
    if (!bookTitle || !caption || !rating) {
      return res.status(400).json({ 
        success: false, 
        message: "Book title, caption, and rating are required" 
      });
    }
    
    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: "Rating must be between 1 and 5" 
      });
    }

    const recommendation = new Recommendation({
      user: req.userId,
      username: req.username,
      bookTitle,
      caption,
      rating: Number(rating),
      image: image || "https://via.placeholder.com/150",
    });
    
    await recommendation.save();
    
    res.status(201).json({
      success: true,
      message: "Recommendation created successfully",
      recommendation,
    });
  } catch (err) {
    console.error("Error creating recommendation:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete a recommendation (protected)
router.delete("/:id", auth, async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id);
    
    if (!recommendation) {
      return res.status(404).json({ 
        success: false, 
        message: "Recommendation not found" 
      });
    }
    
    // Check ownership
    if (recommendation.user.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized to delete this recommendation" 
      });
    }
    
    await recommendation.deleteOne();
    
    res.status(200).json({ 
      success: true, 
      message: "Recommendation deleted successfully" 
    });
  } catch (err) {
    console.error("Error deleting recommendation:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update a recommendation (optional - if you need it later)
router.put("/:id", auth, async (req, res) => {
  try {
    const { bookTitle, caption, rating, image } = req.body;
    const recommendation = await Recommendation.findById(req.params.id);
    
    if (!recommendation) {
      return res.status(404).json({ 
        success: false, 
        message: "Recommendation not found" 
      });
    }
    
    if (recommendation.user.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized to update this recommendation" 
      });
    }
    
    recommendation.bookTitle = bookTitle || recommendation.bookTitle;
    recommendation.caption = caption || recommendation.caption;
    recommendation.rating = rating || recommendation.rating;
    recommendation.image = image || recommendation.image;
    
    await recommendation.save();
    
    res.status(200).json({
      success: true,
      message: "Recommendation updated successfully",
      recommendation,
    });
  } catch (err) {
    console.error("Error updating recommendation:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;