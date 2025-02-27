const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const FinanceSchema = new mongoose.Schema({
  student_id: String,
  name_on_file: String,
  card_last4: String,
  expiry_date: String,
  billing_address: {
    street: String,
    city: String,
    province: String,
    postal_code: String,
    country: String,
  },
  payment_provider: String,
  tokenized_card_id: String,
});

const Finance = mongoose.model("Finance", FinanceSchema);

app.post("/add-finance", async (req, res) => {
  try {
    const { student_id, name_on_file, card_number, expiry_date, billing_address, payment_provider } = req.body;

    if (!card_number || card_number.length !== 16) {
      return res.status(400).json({ error: "Invalid card number" });
    }

    const newFinance = new Finance({
      student_id,
      name_on_file,
      card_last4: card_number.slice(-4),
      expiry_date,
      billing_address,
      payment_provider,
      tokenized_card_id: `tok_${Math.random().toString(36).substr(2, 10)}`, 
    });

    await newFinance.save();
    res.status(201).json({ message: "Financial info saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
