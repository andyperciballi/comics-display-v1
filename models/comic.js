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
      maxlength: 500,
    },
    author: {
      type: String,
      trim: true,
      maxlength: 120,
    },

    issueNumber: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    imageUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    condition: {
      type: String,
      enum: [
        "Poor",
        "Fair",
        "Good",
        "Very Good",
        "Fine",
        "Very Fine",
        "Near Mint",
        "Mint",
      ],
      default: "Good",
    },

    estimatedValue: {
      type: Number,
      min: 0,
      max: 1000000, // arbitrary upper cap to prevent abuse
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 3000, // generous but safe (~½ page of text)
    },
  },
  { timestamps: true }
);

// prevent duplicate issues per user
comicSchema.index(
  { user: 1, title: 1, issueNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model("Comic", comicSchema);
