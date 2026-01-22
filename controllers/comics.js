const express = require("express");
const router = express.Router({ mergeParams: true });

const Comic = require("../models/comic");

// INDEX - My Shelf (signed-in user's comics) + optional search by title/author
router.get("/", async (req, res) => {
  try {
    const userId = req.session.user._id;

    const q = (req.query.q || "").trim();

    const filter = { user: userId };

    if (q) {
      // case-insensitive partial match on title OR author
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { author: { $regex: q, $options: "i" } },
      ];
    }

    const comics = await Comic.find(filter).sort({ createdAt: -1 });

    // pass q back so your input can stay filled after searching
    res.render("comics/index.ejs", { comics, q });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// FAVORITES - Show user's favorited comics
router.get("/favorites", async (req, res) => {
  try {
    const Favorite = require("../models/favorite");


    console.log("FAVORITES route - User ID:", req.session.user._id);
    
    
    const favorites = await Favorite.find({ user: req.session.user._id })
      .populate('comic')
      .sort({ createdAt: -1 });

    res.render("comics/favorites.ejs", { favorites });
  } catch (err) {
    console.error("Error in FAVORITES route:", err);
    res.redirect("/");
  }
});

// NEW
router.get("/new", (req, res) => {
  res.render("comics/new.ejs");
});

// SHOW - View single comic details
router.get("/:comicId", async (req, res) => {
  try {
    const comic = await Comic.findById(req.params.comicId);
    
    if (!comic) return res.status(404).send("Comic not found");

    res.render("comics/show.ejs", { comic });
  } catch (err) {
    console.error("Error in SHOW route:", err);
    res.redirect("/");
  }
});

// CREATE
router.post("/", async (req, res) => {
  try {
    console.log("Creating comic with data:", req.body);
    console.log("User ID:", req.session.user._id);
    
    const comic = await Comic.create({
      user: req.session.user._id,
      title: req.body.title,
      author: req.body.author,
      issueNumber: req.body.issueNumber,
      imageUrl: req.body.imageUrl,
      condition: req.body.condition,
      estimatedValue: req.body.estimatedValue,
      notes: req.body.notes,
    });

    console.log("Comic created successfully:", comic._id);
    res.redirect(`/users/${req.session.user._id}/comics`);  // <-- This line is critical
  } catch (err) {
    console.error("ERROR creating comic:", err);
    res.status(500).send(`Error: ${err.message}`);
  }
});

// EDIT
router.get("/:comicId/edit", async (req, res) => {
  try {
    const comic = await Comic.findOne({
      _id: req.params.comicId,
      user: req.session.user._id,
    });

    if (!comic) return res.status(404).send("Comic item not found");

    res.render("comics/edit.ejs", { comic });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// UPDATE
router.put("/:comicId", async (req, res) => {
  try {
    const comic = await Comic.findOne({
      _id: req.params.comicId,
      user: req.session.user._id,
    });

    if (!comic) return res.status(404).send("Comic item not found");

    comic.set({
      title: req.body.title,
      author: req.body.author,
      issueNumber: req.body.issueNumber,
      imageUrl: req.body.imageUrl,
      condition: req.body.condition,
      estimatedValue: req.body.estimatedValue,
      notes: req.body.notes,
    });

    await comic.save();

    res.redirect(`/users/${req.session.user._id}/comics`);
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// DELETE
router.delete("/:comicId", async (req, res) => {
  try {
    const deleted = await Comic.findOneAndDelete({
      _id: req.params.comicId,
      user: req.session.user._id,
    });

    if (!deleted) return res.status(404).send("Comic item not found");

    res.redirect(`/users/${req.session.user._id}/comics`);
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

// FAVORITE - Add comic to favorites
router.post("/:comicId/favorite", async (req, res) => {
  try {
    const Favorite = require("../models/favorite");
    
    console.log("FAVORITE route hit");
    console.log("User ID:", req.session.user._id);
    console.log("Comic ID:", req.params.comicId);
    
    const favorite = await Favorite.create({
      user: req.session.user._id,
      comic: req.params.comicId
    });

    console.log("Favorite created:", favorite);

    res.redirect(`/users/${req.session.user._id}/comics/${req.params.comicId}`);
  } catch (err) {
    console.error("Error favoriting comic:", err);
    res.redirect("/");
  }
});

// UNFAVORITE - Remove comic from favorites
router.delete("/:comicId/unfavorite", async (req, res) => {
  try {
    const Favorite = require("../models/favorite");
    
    await Favorite.findOneAndDelete({
      user: req.session.user._id,
      comic: req.params.comicId
    });

    res.redirect(`/users/${req.session.user._id}/comics/${req.params.comicId}`);
  } catch (err) {
    console.error("Error unfavoriting comic:", err);
    res.redirect("/");
  }
});


module.exports = router;
