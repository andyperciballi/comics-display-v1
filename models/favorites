const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    comic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comic",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate favorites
favoriteSchema.index({ user: 1, comic: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);