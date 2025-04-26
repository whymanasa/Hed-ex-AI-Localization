import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import translateRoute from "./routes/translateRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/translate", translateRoute);
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
