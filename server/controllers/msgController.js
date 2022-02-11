import dotenv from "dotenv";
dotenv.config();

import { pool } from "../app.js";

const db = {};

db.createConv = (sender, reciever) => {
  const datee = new Date(Date.now());

  return new Promise((resolve, reject) => {
    pool.query(`INSERT INTO convs (sender_id, reciever_id, created_at) values(?,?,?)`, [sender, reciever, datee], (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};

// db.getConvsByUser = (id) => {
//   return new Promise((resolve, reject) => {
//     pool.query(
//       `SELECT f.id, f.sender_id, f.reciever_id, f.created_at, f.sender_username, f.reciever_username, f.sender_profilePic, f.reciever_profilePic, f.last_msg_created_at, text FROM
//       (SELECT d.id, d.sender_id, d.reciever_id, d.created_at, d.sender_username, d.reciever_username, d.sender_profilePic, d.reciever_profilePic, r.last_msg_created_at  FROM
//       (SELECT t.id, t.sender_id, t.reciever_id, t.created_at, sender_username, uu.username as reciever_username, sender_profilePic,
//             uu.profilePic as reciever_profilePic from
//             (SELECT c.id, c.sender_id, c.reciever_id, c.created_at, u.username as sender_username, u.profilePic as sender_profilePic
//              FROM convs c
//            JOIN user u ON u.id  = c.sender_id) t
//            JOIN user uu ON uu.id = t.reciever_id) d
//            JOIN (SELECT max(created_at) as last_msg_created_at, conv_id  FROM msg group by conv_id
//            ) r  ON d.id = r.conv_id) f JOIN msg on f.last_msg_created_at = msg.created_at
//            WHERE sender_id=?  OR reciever_id=?
//            ORDER BY last_msg_created_at DESC `,
//       [id, id],
//       (err, res) => {
//         if (err) return reject(err);
//         resolve(res);
//       }
//     );
//   });
// };

db.getConvsByUser = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `Select id, sender_id, reciever_id, last_msg_created_at, text, 
      if (sender_id =? ,  reciever_username ,sender_username) as real_sender_username,
      if (sender_id =? ,  reciever_profilePic, sender_profilePic) as real_sender_profilePic,
      if (sender_id =? ,  sender_profilePic, reciever_profilePic) as my_profilePic
      FROM (
     SELECT f.id, f.sender_id, f.reciever_id, f.created_at, f.sender_username, f.reciever_username, f.sender_profilePic, f.reciever_profilePic, f.last_msg_created_at, text FROM
           (SELECT d.id, d.sender_id, d.reciever_id, d.created_at, d.sender_username, d.reciever_username, d.sender_profilePic, d.reciever_profilePic, r.last_msg_created_at  FROM
           (SELECT t.id, t.sender_id, t.reciever_id, t.created_at, sender_username, uu.username as reciever_username, sender_profilePic,
                 uu.profilePic as reciever_profilePic from
                 (SELECT c.id, c.sender_id, c.reciever_id, c.created_at, u.username as sender_username, u.profilePic as sender_profilePic
                  FROM convs c
                JOIN user u ON u.id  = c.sender_id) t
                JOIN user uu ON uu.id = t.reciever_id) d
                JOIN (SELECT max(created_at) as last_msg_created_at, conv_id  FROM msg group by conv_id
                ) r  ON d.id = r.conv_id) f JOIN msg on f.last_msg_created_at = msg.created_at
                WHERE (sender_id=?  OR reciever_id=?) 
                ORDER BY last_msg_created_at DESC )m `,
      [id, id, id, id, id],
      (err, res) => {
        if (err) return reject(err);
        resolve(res);
      }
    );
  });
};

db.searchConv = (id, username) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT * FROM (
        SELECT *,
      if (sender_id =? ,  reciever_username ,sender_username) as real_sender_username,
      if (sender_id =? ,  reciever_profilePic, sender_profilePic) as real_sender_profilePic
      FROM (
     SELECT f.id, f.sender_id, f.reciever_id, f.created_at, f.sender_username, f.reciever_username, f.sender_profilePic, f.reciever_profilePic, f.last_msg_created_at, text FROM
           (SELECT d.id, d.sender_id, d.reciever_id, d.created_at, d.sender_username, d.reciever_username, d.sender_profilePic, d.reciever_profilePic, r.last_msg_created_at  FROM
           (SELECT t.id, t.sender_id, t.reciever_id, t.created_at, sender_username, uu.username as reciever_username, sender_profilePic,
                 uu.profilePic as reciever_profilePic from
                 (SELECT c.id, c.sender_id, c.reciever_id, c.created_at, u.username as sender_username, u.profilePic as sender_profilePic
                  FROM convs c
                JOIN user u ON u.id  = c.sender_id) t
                JOIN user uu ON uu.id = t.reciever_id) d
                JOIN (SELECT max(created_at) as last_msg_created_at, conv_id  FROM msg group by conv_id
                ) r  ON d.id = r.conv_id) f JOIN msg on f.last_msg_created_at = msg.created_at
                WHERE (sender_id=?  OR reciever_id=?) 
                ORDER BY last_msg_created_at DESC )m 
      ) k where real_sender_username LIKE ?
      `,
      [id, id, id, id, `${username}%`],
      (err, res) => {
        if (err) return reject(err);
        resolve(res);
      }
    );
  });
};

db.getExistingConv = (userId, sender, reciever) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT if (sender_id =? ,  uu.username ,sender_username) as real_sender_username,
      if (sender_id =? ,  uu.profilePic, sender_profilePic) as real_sender_profilePic,
      if (sender_id =? ,  sender_profilePic, uu.profilePic) as my_profilePic,
      t.id, t.sender_id, t.reciever_id, t.created_at, sender_username, uu.username as reciever_username, sender_profilePic,
      uu.profilePic as reciever_profilePic from
      (SELECT c.id, c.sender_id, c.reciever_id, c.created_at, u.username as sender_username, u.profilePic as sender_profilePic 
       FROM convs c  
     JOIN user u ON u.id  = c.sender_id) t
     JOIN user uu ON uu.id = t.reciever_id
     WHERE sender_id=? AND reciever_id=? OR reciever_id=? AND sender_id=?`,
      [userId, userId, userId, sender, reciever, sender, reciever],
      (err, res) => {
        if (err) return reject(err);
        resolve(res[0]);
      }
    );
  });
};

db.getConvbysenderandreciever = (userId, sender, reciever) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT if (sender_id =? ,  uu.username ,sender_username) as real_sender_username,
      if (sender_id =? ,  uu.profilePic, sender_profilePic) as real_sender_profilePic,
      if (sender_id =? ,  sender_profilePic, uu.profilePic) as my_profilePic,
      t.id, t.sender_id, t.reciever_id, t.created_at, sender_username, uu.username as reciever_username, sender_profilePic,
      uu.profilePic as reciever_profilePic from
      (SELECT c.id, c.sender_id, c.reciever_id, c.created_at, u.username as sender_username, u.profilePic as sender_profilePic 
       FROM convs c  
                JOIN user u ON u.id  = c.sender_id) t
                JOIN user uu ON uu.id = t.reciever_id
                WHERE sender_id=? AND reciever_id=?`,
      [userId, userId, userId, sender, reciever],
      (err, res) => {
        if (err) return reject(err);
        resolve(res[0]);
      }
    );
  });
};

db.createMsg = (convId, sender, text) => {
  const datee = new Date(Date.now());
  return new Promise((resolve, reject) => {
    pool.query(`INSERT INTO msg(conv_id, sender, text, created_at ) VALUES(?,?,?,?)`, [convId, sender, text, datee], (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};

db.getMsgBy = (convId, sender, text) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM msg WHERE conv_id=? AND sender=? AND text=?`, [convId, sender, text], (err, res) => {
      if (err) return reject(err);
      resolve(res[0]);
    });
  });
};

db.getMsgByConvId = (convId) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM msg WHERE conv_id=?`, [convId], (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};

export { db };
