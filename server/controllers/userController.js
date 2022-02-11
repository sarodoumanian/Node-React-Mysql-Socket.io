import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { v4 as uuidv4 } from "uuid";

import { pool } from "../app.js";

const db = {};

db.getByEmail = (email) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT  * FROM user WHERE email = ?`, [email], (err, res) => {
      //console.log("saro " + JSON.stringify(res));
      if (err) return reject(err);
      return resolve(res);
    });
  });
};

db.getByUsername = (username) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM user WHERE username = ?`, [username], (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    });
  });
};

db.register = (username, email, password, date_of_birth) => {
  return new Promise((resolve, reject) => {
    pool.query(`INSERT INTO user(id, email, username, password, date_of_birth) VALUES (?,?,?,?,?)`, [uuidv4(), email, username, password, date_of_birth], (error, results, fields) => {
      if (error) return reject(error);
      return resolve(results);
    });
  });
};

db.findById = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT   id, email, username, date_of_birth, created_at, profilePic FROM user WHERE id = ?`, [id], (err, result) => {
      if (err) return reject(err);
      return resolve(result[0]);
    });
  });
};

db.findById_pass = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT   id, email, username, password FROM user WHERE id = ?`, [id], (err, result) => {
      if (err) return reject(err);
      return resolve(result[0]);
    });
  });
};

db.findAllUsers = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT id, username, email, date_of_birth, profilePic, created_at FROM user", (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

db.findAllUsersWithoutMe = (id) => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT id, username, email, date_of_birth, profilePic, created_at FROM user WHERE id<>?  order by created_at desc ", [id], (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

db.deleteUser = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(`DELETE  FROM user WHERE id=?`, [id], (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

db.updateUser = (id, username, email, password) => {
  return new Promise((resolve, reject) => {
    pool.query(`UPDATE user SET username=?, email=?, password=? WHERE id=?`, [username, email, password, id], (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

db.updateProfilePicture = (path, id) => {
  return new Promise((resolve, reject) => {
    pool.query(`UPDATE user SET profilePic=? WHERE id=?`, [path, id], (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

db.searchUser = (txt) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT id, username, email, date_of_birth, profilePic, created_at FROM user WHERE username LIKE ? OR email LIKE ?`, [`%${txt}%`, `%${txt}%`], (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

export { db };
