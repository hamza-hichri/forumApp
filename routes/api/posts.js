const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

const Post = require("../../models/Post");

const Profile = require("../../models/Profile");
//post validation
const validatePostsInput = require("../../validation/post");
router.get("/test", (req, res) => res.json({ msg: "Posts Works!" }));
//@route Post api/posts
//@desc Create post
//@access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, IsValid } = validatePostsInput(req.body);
    if (!IsValid) {
      return res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.user.name,
      avatar: req.user.avatar,
      user: req.user.id,
    });
    newPost.save().then((post) => res.json(post));
  }
);
//@route Get api/posts
//@desc get posts
//@access public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then((posts) => {
      res.json(posts);
    })
    .catch((err) => {
      res.status(404).json({ NoPosts: "No posts!" });
    });
});

//@route Get api/posts/:id
//@desc get posts by id
//@access public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then((posts) => {
      res.json(posts);
    })
    .catch((err) => {
      res.status(404).json({ noposts: "no post found for this id!" });
    });
});

//@route Delete api/posts/:id
//@desc Delete posts
//@access Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
      Post.findById(req.params.id)
        .then((post) => {
          //check for post owner!
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notAuthorized: "user not authorized!" });
          }
          //delete
          post.remove().then(() => res.json({ success: true }));
        })
        .catch((err) =>
          res.status(404).json({ postnotfound: "No post found!" })
        );
    });
  }
);

//@route Post api/posts/like/:id
//@desc like a post
//@access Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
      Post.findById(req.params.id)
        .then((post) => {
          if (
            post.likes.filter((like) => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyLiked: "user already liked this post!" });
          }
          //add user id to likes array
          post.likes.unshift({ user: req.user.id });
          post.save().then((post) => res.json(post));
        })
        .catch((err) =>
          res.status(404).json({ postnotfound: "No post found!" })
        );
    });
  }
);

//@route Post api/posts/unlike/:id
//@desc unlike a post
//@access Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
      Post.findById(req.params.id)
        .then((post) => {
          if (
            post.likes.filter((like) => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ NotLiked: "You have not liked this post!" });
          }
          //get remove index
          const removeIndex = post.likes
            .map((item) => item.user.toString())
            .indexOf(req.user.id);
          post.likes.splice(removeIndex, 1);

          //save
          post.save().then((post) => res.json(post));
        })
        .catch((err) =>
          res.status(404).json({ postnotfound: "No post found!" })
        );
    });
  }
);

//@route Post api/comment/:id
//@desc add comment to post
//@access Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, IsValid } = validatePostsInput(req.body);
    //check validation
    if (!IsValid) {
      return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
      .then((post) => {
        const newComment = {
          text: req.body.text,
          name: req.user.name,
          avatar: req.user.avatar,
          user: req.user.id,
        };
        //Add to comment array
        post.comments.unshift(newComment);
        //save

        post.save().then((post) => res.json(post));
      })
      .catch((err) => {
        res.status(404).json({ PostNotFound: "no post found" });
      });
  }
);

//@route Delete api/comment/:id/:comment_id
//@desc remove comment from post
//@access Private
router.delete(
  "/uncomment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then((post) => {
        //check to see if comment exist
        if (
          post.comments.filter(
            (comment) => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res.status(404).json({ CommentNotExist: "No comment found!" });
        }
        //remove index
        const removeIndex = post.comments
          .map((item) => item._id.toString())
          .indexOf(req.params.comment_id);
        //splice out of the array
        post.comments.splice(removeIndex, 1);

        post.save().then((post) => res.json(post));
      })
      .catch((err) => {
        res.status(404).json({ PostNotFound: "no post found" });
      });
  }
);
module.exports = router;
