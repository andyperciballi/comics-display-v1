const express = require('express');
const router = express.Router();
const User = require('../models/user.js');

// INDEX – list all users (community page)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({});
    res.render('users/index', { users });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// SHOW – view a single user's Shelf
router.get('/:id', async (req, res) => {
  try {
    const Comic = require('../models/comic');
    
    const profileUser = await User.findById(req.params.id);
    if (!profileUser) return res.status(404).send('User not found');

    // Get all comics for this user
    const comics = await Comic.find({ user: req.params.id }).sort({ createdAt: -1 });

    res.render('users/show', { profileUser, comics });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

module.exports = router;