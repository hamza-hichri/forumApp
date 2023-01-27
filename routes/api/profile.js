const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//load validation
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

//load profile model
const Profile = require("../../models/Profile");

//load user profile
const User = require("../../models/Users");

// @route GET api/Profile/test
// @desc Tests profile route
// @access Public
router.get("/test", (req, res) => res.json({ msg: "Profile Works!" }));

// @route GET api/Profile/
// @desc Get current user profile
// @access Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then((profile) => {
        if (!profile) {
          errors.noprofile = "There is no profile found for this user !!";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch((err) => res.status(404).json(err));
  }
);

// @route Get api/Profile/all
// @desc get all profiles
// @access public
router.get("/all", (req, res) => {
  const errors = {};
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then((profiles) => {
      if (!profiles) {
        errors.noprofiles = "There are no profiles";
        return res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch((err) => {
      res.status(404).json({ profile: "there are no profiles!" });
    });
});

// @route Get api/Profile/handle/:handle
// @desc get profile by handle
// @access public
router.get("/handle/:handle", (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then((profile) => {
      if (!profile) {
        errors.profile = "There is no profile for this user";
        res.status(400).json(errors);
      }
      res.json(profile);
    })
    .catch((err) => res.status(400).json(err));
});

// @route Get api/Profile/user/:user
// @desc get profile by handle
// @access public
router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then((profile) => {
      if (!profile) {
        errors.profile = "There is no profile for this user!";
        res.status(400).json(errors);
      }
      res.json(profile);
    })
    .catch((err) =>
      res.status(400).json({ profile: "there is no profile for this user!" })
    );
});

// @route POST api/Profile/
// @desc Create user profile
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, IsValid } = validateProfileInput(req.body);
    if (!IsValid) {
      return res.status(400).json(errors);
    }
    //get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;

    //Skills - Split into array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }
    profileFields.social = {};
    if (req.body.youtube) profileFields.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.facebook = req.body.facebook;
    if (req.body.instagram) profileFields.instagram = req.body.instagram;
    if (req.body.linkedin) profileFields.linkedin = req.body.linkedin;

    Profile.findOne({ user: req.user.id }).then((profile) => {
      if (profile) {
        //update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then((profile) => res.json(profile));
      } else {
        //create

        //check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then((profile) => {
          if (profile) {
            (errors.handle = "that handle already exists! "),
              res.status(400).json(errors);
          }
          //save profile
          new Profile(profileFields)
            .save()
            .then((profile) => res.json(profile));
        });
      }
    });
  }
);

// @route Post api/Profile/Experience/
// @desc add experience to profile
// @access private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, IsValid } = validateExperienceInput(req.body);
    if (!IsValid) {
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id }).then((profile) => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };
      //add to experience array

      profile.experience.unshift(newExp);
      profile.save().then((profile) => res.json(profile));
    });
  }
);

// @route Post api/Profile/Education/
// @desc add education to profile
// @access private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, IsValid } = validateEducationInput(req.body);
    if (!IsValid) {
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id }).then((profile) => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };
      //add to experience array

      profile.education.unshift(newEdu);
      profile.save().then((profile) => res.json(profile));
    });
  }
);

// @route Delete api/Profile/experience/:exp_id
// @desc delete experience from profile
// @access private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        //get remove index

        const removeIndex = profile.experience
          .map((item) => item.id)
          .indexOf(req.params.exp_id);

        //splice out of array
        if (removeIndex != -1) {
          profile.experience.splice(removeIndex, 1);
        } else return res.status(404).json("no experience found!");

        //save

        profile.save().then((profile) => res.json(profile));
      })
      .catch((err) => res.status(404).json(err));
  }
);

// @route Delete api/Profile/education/:edu_id
// @desc delete education from profile
// @access private
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        //get remove index

        const removeIndex = profile.education
          .map((item) => item.id)
          .indexOf(req.params.edu_id);

        //splice out of array
        if (removeIndex != -1) {
          profile.education.splice(removeIndex, 1);
        } else return res.status(404).json("no education found!");

        //save

        profile.save().then((profile) => res.json(profile));
      })
      .catch((err) => res.status(404).json(err));
  }
);

// @route Delete api/Profile/
// @desc delete user and profile
// @access private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() => {
        res.json({ success: true });
      });
    });
  }
);
module.exports = router;
