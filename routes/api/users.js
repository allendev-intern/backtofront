const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator/check");

const User = require("../../models/User");

// @route   POST api/users
// @desc    Register User
// @access  Public

router.post(
  "/",
  [
    check("name", "Name is required.")
      .not()
      .isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // First we check if the user exists

      let user = User.findOne({ email })
        .then(result => {
          if (result) {
            console.log("Found");
          } else {
            console.log("None found");
          }
          return result;
        })
        .catch(err => console.error(err.message));

      console.log("Checked if email already exists");
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
        // console.log("User exists");
      } else {
        // Get user's gravatar
        console.log("Getting user's gravatar");
        const avatar = gravatar.url(email, {
          s: "200",
          r: "pg",
          d: "mm"
        });

        console.log("Made a new user");
        user = new User({
          name,
          email,
          avatar,
          password
        });

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Return jsonwebtoken

        res.send("User registered");
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
