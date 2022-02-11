import dotenv from "dotenv";
dotenv.config();

import { pool } from "../app.js";

const db = {};

db.createPost = (desc, user_id) => {
  return new Promise((resolve, reject) => {
    pool.query(`INSERT INTO posts (description, user_Id) values(?,?)`, [desc, user_id], (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};

db.deletePost = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(`DELETE  FROM posts WHERE id=?`, [id], (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};

db.getPostById = (description, user_id) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM posts WHERE description=? AND user_Id=? ORDER BY created_at DESC`, [description, user_id], (err, res) => {
      if (err) return reject(err);
      resolve(res[0]);
    });
  });
};

db.getAllPostsByUser = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM posts WHERE user_id=? ORDER BY created_at DESC`, [id], (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};

db.getAllPosts = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT id, description, created_at, username, profilePic FROM (
                SELECT p.id as id, p.description, p.created_at, u.username, p.user_Id, u.profilePic FROM posts p 
                JOIN user u ON p.user_Id = u.id
              ) as d ORDER BY created_at DESC`,
      (err, res) => {
        if (err) return reject(err);
        resolve(res);
      }
    );
  });
};

export { db };
