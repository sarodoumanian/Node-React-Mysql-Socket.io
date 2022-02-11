import express from "express";
import dotenv from "dotenv";
dotenv.config();
import auth from "../controllers/auth.js";
import { db } from "../controllers/postController.js";

const router = express.Router();

router.post("/createPost", auth, async (req, res) => {
  try {
    await db.createPost(req.body.description, req.user.id);
    const newPost = await db.getPostById(req.body.description, req.user.id);
    res.json(newPost);
  } catch (error) {
    console.log(error);
  }
});

router.delete("/deletePost/:id", auth, async (req, res) => {
  try {
    await db.deletePost(req.params.id);
    console.log("dddddddddeleteddd");
    res.json("deleted");
  } catch (error) {
    console.log(error);
  }
});

router.get("/getAllPostsByUser/:id", auth, async (req, res) => {
  try {
    const posts = await db.getAllPostsByUser(req.params.id);
    if (posts) {
      res.json(posts);
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/getAllPosts", async (req, res) => {
  try {
    const posts = await db.getAllPosts();
    if (posts) {
      console.log(posts);
      res.json(posts);
    }
  } catch (error) {
    console.log(error);
  }
});

export default router;
