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

// NEW
router.get("/new", (req, res) => {
  res.render("comics/new.ejs");
});

// CREATE
router.post("/", async (req, res) => {
  try {
    await Comic.create({
      user: req.session.user._id,
      title: req.body.title,
      author: req.body.author,
      issueNumber: req.body.issueNumber,
      imageUrl: req.body.imageUrl,
      condition: req.body.condition,
      estimatedValue: req.body.estimatedValue,
      notes: req.body.notes,
    });

    res.redirect("/comics");
  } catch (err) {
    console.error(err);
    res.redirect("/");
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

    res.redirect("/comics");
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

    res.redirect("/comics");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

module.exports = router;
