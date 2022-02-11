import express from "express";
import dotenv from "dotenv";
dotenv.config();
import auth from "../controllers/auth.js";
import { db } from "../controllers/msgController.js";

const router = express.Router();

router.post("/newConv", auth, async (req, res) => {
  const { sender_id, reciever_id } = req.body;
  try {
    const existingConv = await db.getExistingConv(req.user.id, sender_id, reciever_id);
    //console.log("EXISTING CONVVV  " + existingConv);
    if (existingConv) res.json({ msg: "existing conv", conv: existingConv });
    else {
      const newConv = await db.createConv(sender_id, reciever_id);
      console.log(newConv);
      if (newConv) {
        const conv = await db.getConvbysenderandreciever(req.user.id, sender_id, reciever_id);
        if (conv) res.json({ msg: "new conv", conv: conv });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/conv/:userid", auth, async (req, res) => {
  try {
    const conv = await db.getConvsByUser(req.params.userid);
    if (conv && conv.length > 0) res.status(200).json(conv);
    else res.json("no conv");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/newmsg", auth, async (req, res) => {
  const { conv_id, sender, text } = req.body;
  try {
    const newMsg = await db.createMsg(conv_id, sender, text);
    if (newMsg) {
      const msg = await db.getMsgBy(conv_id, sender, text);
      if (msg) res.json(msg);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/msg/:convid", auth, async (req, res) => {
  try {
    const msgs = await db.getMsgByConvId(req.params.convid);
    if (msgs && msgs.length > 0) res.status(200).json(msgs);
    else res.json("no conv");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/searchConv", auth, async (req, res) => {
  try {
    const convs = await db.searchConv(req.user.id, req.body.search);
    res.json(convs);
  } catch (error) {
    console.log(error);

    res.status(500).json(error);
  }
});

export default router;
