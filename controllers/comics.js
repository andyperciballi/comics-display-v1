const express = require("express");
const router = express.Router({ mergeParams: true });

const User = require("../models/user.js");
const Comic = require("../models/comic");

// INDEX - show all shelf items
router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) return res.status(404).send("User not found");

    const shelfItems = user.shelf;

    res.render("comics/index.ejs", { shelf: shelfItems, user });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// NEW - display form to add a new comic item
router.get("/new", (req, res) => {
  res.render("comics/new.ejs", { userId: req.params.userId });
});

// Create - add new comic to Shelf
router.post("/", async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) return res.status(404).send("User not found");

    user.shelf.push({ name: req.body.name });

    await user.save();

    res.redirect(`/users/${req.session.user._id}/comics`);
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// DELETE - remove a comic item from the shelf
router.delete("/:itemId", async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) return res.status(404).send("User not found");

    const comic = user.shelf.id(req.params.itemId);

    comic.deleteOne();

    await user.save();

    res.redirect(`/users/${req.session.user._id}/comics`);
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

// EDIT - show form to edit a shelf item
router.get("/:itemId/edit", async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) return res.status(404).send("User not found");

    const comicItem = user.shelf.id(req.params.itemId);
    if (!comicItem) return res.status(404).send("comic item not found");

    res.render("applications/edit", { comic: comicItem, user });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// UPDATE - update a specific comic item
router.put("/:itemId", async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) return res.status(404).send("User not found");

    const comic = user.shelf.id(req.params.itemId);
    if (!comic) return res.status(404).send("Comic item not found");

    comic.set({ name: req.body.name });

    await user.save();

    res.redirect(`/users/${user._id}/comics`);
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

module.exports = router;