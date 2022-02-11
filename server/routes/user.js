import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
dotenv.config();
import bcrypt from "bcrypt";
import auth from "../controllers/auth.js";
import { db } from "../controllers/userController.js";

const router = express.Router();

const multerConfig = {
  storage: multer.diskStorage({
    //Setup where the user's file will go
    destination: function (req, file, next) {
      next(null, "public/uploads/");
    },

    //Then give the file a unique name
    filename: function (req, file, next) {
      console.log(file);
      const ext = file.mimetype.split("/")[1];
      next(null, +Date.now() + "." + file.originalname);
    },
  }),

  //A means of ensuring only images are uploaded.
  fileFilter: function (req, file, next) {
    if (!file) {
      next();
    }
    const image = file.mimetype.startsWith("image/");
    if (image) {
      console.log("photo uploaded");
      next(null, true);
    } else {
      console.log("file not supported");

      return next();
    }
  },
};

router.get("/all", async (req, res) => {
  try {
    const users = await db.findAllUsers();
    //console.log(users);
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/allwithoutme", auth, async (req, res) => {
  try {
    const users = await db.findAllUsersWithoutMe(req.user.id);
    //console.log(users);
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/user/:id", auth, async (req, res) => {
  try {
    const user = await db.findById(req.params.id);
    if (user && user.length === 0) {
      return res.json({ msg: "no user" });
    } else {
      //console.log(user);
      res.status(200).json(user);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.getByEmail(email);
    //console.log(user);
    if (!user || user.length === 0) return res.json({ msg: "this email doesnt exist" });
    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) return res.json({ msg: "incorrect password" });
    else {
      const token = jwt.sign({ user_id: user[0].id, email: user[0].email }, process.env.JWT, { expiresIn: "2h" });
      //console.log(token);
      res
        .cookie("token", token, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true })
        .cookie("user", user[0].id, { maxAge: 2 * 60 * 60 * 1000 })
        .status(200)
        .json(user[0]);
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, date_of_birth } = req.body;

    if (username.length < 4 || username.length > 20) return res.json({ msg: "Username should be between 4 and 20 charachters" });
    if (email.length < 10 || username.length > 30) return res.json({ msg: "Email should be between 10 and 30 charachters" });
    if (password.length < 4 || password.length > 20) return res.json({ msg: "Password should be between 4 and 20 charachters" });

    const existsEmail = await db.getByEmail(email);
    if (existsEmail.length !== 0) return res.json({ msg: "This Email is already taken!" });

    const existsUsername = await db.getByUsername(username);
    if (existsUsername.length !== 0) return res.json({ msg: "This Username is already taken!" });

    const hashed = await bcrypt.hash(password, 8);
    const results = await db.register(username, email, hashed, date_of_birth);
    if (results) return res.status(201).json({ msg: "successfully registered user!" });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.delete("/deleteUser/:id", auth, async (req, res) => {
  console.log("111111111");
  const { password } = req.body;
  console.log("paaaaaaaaaaaaaaaaaaaa   " + password);
  try {
    const user = await db.findById_pass(req.params.id);

    //console.log(user);
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      if (req.params.id === req.user.id) {
        await db.deleteUser(req.params.id);
        res.json("user deleted");
      } else {
        res.json("you cannot delete this user");
      }
    } else {
      res.json("wrong password");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.put("/updateUser/:id", auth, async (req, res) => {
  console.log("hos yegank wala");
  const { id } = req.params;
  const { username, email, password } = req.body;
  try {
    if (username.length < 4 || username.length > 20) return res.json({ msg: "Username should be between 4 and 20 charachters" });
    if (email.length < 10 || username.length > 30) return res.json({ msg: "Email should be between 10 and 30 charachters" });
    if (password.length < 4 || password.length > 20) return res.json({ msg: "Password should be between 4 and 20 charachters" });

    const existsEmail = await db.getByEmail(email);
    if (existsEmail.length !== 0) return res.json({ msg: "This Email is already taken!" });

    const existsUsername = await db.getByUsername(username);
    if (existsUsername.length !== 0) return res.json({ msg: "This Username is already taken!" });

    const hashedPassword = await bcrypt.hash(password, 8);
    const updated = await db.updateUser(id, username, email, hashedPassword);
    if (updated) res.json("updated");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/profilePic", auth, multer(multerConfig).single("photo"), async (req, res) => {
  try {
    //console.log(req.file);
    await db.updateProfilePicture(req.file.filename, req.user.id);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/logout", auth, async (req, res) => {
  console.log("LOOOOOOOOOOOG OOUUUUUUUUT");
  req.user = null;
  res.clearCookie("token", { path: "/" }).clearCookie("user", { path: "/" }).json("logged out");
});

router.post("/searchUser", async (req, res) => {
  try {
    const users = await db.searchUser(req.body.search);
    res.json(users);
  } catch (error) {
    console.log(error);

    res.status(500).json(error);
  }
});

export default router;
