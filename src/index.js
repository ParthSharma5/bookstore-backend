import express from "express";
import "dotenv/config";
import authRoutes from './routes/authRoutes.js'
import booksRoutes from './routes/booksRoutes.js';
import { connectDB } from "./lib/db.js";
import cors from "cors"
const app = express();

// const PORT = 3000;
const PORT = process.env.PORT || 3000;
// middleware
app.use(express.json()) // ✅
app.use(cors());
// middleware
app.use('/api/auth',authRoutes)
// books routes middlewaare
app.use('/api/books',booksRoutes)

app.get("/", (req, res) => {
  res.send("Server is  rUNNING");
});

app.listen(PORT, (req, res) => {
  console.log(`Server is listening at Port:${PORT}`);
  connectDB()
});
