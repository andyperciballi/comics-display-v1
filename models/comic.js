const mongoose = require("mongoose");

const comicSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    issueNumber: {
      type: String,
      trim: true,
    },

    imageUrl: {
      type: String,
      trim: true,
    },

    condition: {
      type: String,
      enum: [
        "Salvage",
        "Poor",
        "Fair",
        "Good",
        "Fine",
        "Near Mint",
        "Mint",
      ],
      default: "Good",
    },

    estimatedValue: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: true }
);

//prevent accidental duplicates per user
comicSchema.index(
  { user: 1, title: 1, issueNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model("Comic", comicSchema);
