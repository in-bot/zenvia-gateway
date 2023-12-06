const express = require("express");
const router = express.Router();
const { WebhookController } = require('../controllers/WebhookController')

router.get("/user",);
router.get("/bot",);
router.post("/bot",);
router.get("/webhook",);
router.post("/webhook", new WebhookController().getWebhookMessage);
router.get("/version",(req, res, next) => {
    console.log(new Date(), 'Version request received', version);
    res.send({ version: version.num });
    next();
});

module.exports = router