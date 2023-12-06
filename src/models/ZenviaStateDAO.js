const db = require("../config/db");

class ZenviaStateDAO {
  createState(sessionId,botId,channelId,userId,sendToInchat,conversationId) {
    const now = new Date();

    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO zenvia_state (bot_id,channel_id,user_name,send_to_inchat,conversation_id,first_interaction,last_interaction,session_id) VALUES(?,?,?,?,?,?,?,?)",
        [botId,channelId,userId,sendToInchat,conversationId,now,now,sessionId],
        (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            console.log(result);
            resolve(result);
          }
        }
      );
    });
  }

  getStateByUserId(userId, instanceId) {

    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM zenvia_state WHERE user_name=? AND bot_id=?",
        [userId, instanceId],
        (err, result) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            console.log(new Date(), `getStateById: ${JSON.stringify(result)}, ${userId} e ${instanceId}`)
            resolve(result[0]);
          }
        }
      );
    });
  }

  updateUserState(userId, botId) {
    const now = new Date();
    console.log("aqui")
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE zenvia_state SET last_interaction = ? WHERE user_name=? AND bot_id=?",
        [now, userId, botId],
        (err, result) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  updateUserSessionState(userId, botId, sessionId) {
    const now = new Date();
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE zenvia_state SET last_interaction = ? AND session_id WHERE user_name=? AND bot_id=?",
        [now, sessionId, userId, botId],
        (err, result) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }
}

module.exports = {
    ZenviaStateDAO,
};
