const db = require("../config/db");

class ZenviaInstanceDAO {
  getInstanceByChannelID(channel_id) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM zenvia_bots WHERE channel_id = ?",
        [channel_id],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  }
  getInstanceByBotID(bot_id) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM zenvia_bots WHERE bot_id = ?",
        [bot_id],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  }
}

module.exports = {
    ZenviaInstanceDAO,
};
