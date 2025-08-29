import mongoose from "mongoose";
import express from "express";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

import cloudinary from "../lib/cloudinary.js";
const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
  const { title, caption, image, rating } = req.body;
  try {
    // check if the booktitle is not there and rating  Book image ,caption so we send a status that all fields are required
    if (!title || !caption || !image || !rating) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // upload the image
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    // save to the database means mongodb

    const newBook = new Book({
      title,
      image: imageUrl,
      caption,
      rating,
      user: req.user._id,
    });
    // newBook is saved to the database
    await newBook.save();
    // now i want to give newBook to the client
    res.status(201).json(newBook);
  } catch (error) {
    console.log("error in Home route", error.message);
    res.status(500).json({ message: error?.message });
  }
});

// pagination means => infinite scrolling
// const response = await fetch("http://localhost:3000/api/books?page=3&limit=5");

router.get("/", protectRoute, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1) * limit;
    const books = await Book.find()
      .sort({ createdAt: -1 }) // descending order
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");
    const totalBooks = await Book.countDocuments();
    res.send({
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.log("Error in get all books route", error);
    res.status(500).json({ message: "Internal server error " });
  }
});

// deleting a book
// router.delete()

router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!Book) {
      return res.status(400).json({ message: "Book not found" });
    }
    // check if the user found the book
    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // deleting image from cloudinary
    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.log(
          "Error in deleting the image from the cloudinary",
          deleteError
        );
      }
    }

    await book.deleteOne();

    res.json({ message: "Books deleted successfully" });
  } catch (error) {
    console.log("Error deleting book", error);
    res.status(500).json({ message: "Internal server error " });
  }
});

// get all the recomended books
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(books);
  } catch (error) {
    console.log("Get user books error", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
