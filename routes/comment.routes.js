const isValidToken = require("../middlewares/user.middleware");
const Comment = require("../models/Comment.model");
const MotoRoute = require("../models/MotoRoute.model");
const User = require("../models/User.model");

const router = require("express").Router();

// GET "/api/comment/:commentId => Obtains a comment by id"
router.get("/:commentId", isValidToken, async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const comment = await Comment.findById(commentId);

    if (comment.user == req.payload._id) {
      res.status(200).json({ comment });
    } else {
      res.status(400).json({
        errorMessage: "You cant access this comment",
      });
    }
  } catch (error) {
    next(error);
  }
});

//POST "comment/:routeId/create" => Create a comment in a route
router.post("/:routeId/create", isValidToken, async (req, res, next) => {
  try {
    const routeId = req.params.routeId;
    const userId = req.payload._id;
    const { comment } = req.body;
    if (!comment) {
      res.status(400).json({ errorMessage: "Error creating comment" });
    }
    const route = await MotoRoute.findById(routeId);
    const user = await User.findById(userId);
    await Comment.create({ comment, user, route });
    res.status(200).json("Comment created succesfully");
  } catch (error) {
    next(error);
  }
});

// GET "comment/:routeId/allComments" => Shows all comments in a route
router.get("/:routeId/allComments", async (req, res, next) => {
  try {
    const routeId = req.params.routeId;
    const route = await MotoRoute.findById(routeId);
    const comments = await Comment.find({ route }).populate({
      path: "user",
      select: ["_id", "username", "userPicture"],
    });
    res.status(200).json({ comments });
  } catch (error) {
    next(error);
  }
});

//PUT "comment/:commentId/edit" => Update a comment
router.patch("/:commentId/edit", isValidToken, async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const comment = req.body.comment;
    const thisComment = await Comment.findById(commentId);
    if (thisComment.user == req.payload._id) {
      await Comment.findByIdAndUpdate(commentId, { comment });
      res.status(200).json("Comment updated succesfully");
    } else {
      res.status(400).json({
        errorMessage: "User not owner of this comment",
      });
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /comment/:commentId/delete => Delete a comment
router.delete("/:commentId/delete", isValidToken, async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const comment = await Comment.findById(commentId);
    if (comment.user == req.payload._id) {
      await Comment.findByIdAndDelete(commentId);
      res.status(200).json("Comment deleted succesfully");
    } else {
      res.status(400).json({
        errorMessage: "User not owner of this comment",
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
