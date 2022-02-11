import jwt from "jsonwebtoken";
import { db } from "./userController.js";

const auth = async (req, res, next) => {
  const token = req.cookies.token;
  //console.log("this is token   " + req.cookies.token);
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT);
    if (decoded) {
      const user = await db.findById(decoded.user_id);
      req.user = user;
    } else {
      res.json("token expired");
    }
  } catch (err) {
    console.log(err);
  }

  return next();
};

export default auth;
