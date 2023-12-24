const express = require("express");
const router = express.Router();
const { WebhookController } = require('../controllers/WebhookController')
const {InchatController} = require('../controllers/InchatController')
const version = require("../services/Version");

router.post('/inchat', new InchatController().messageReceived);
router.get('/inchat', new InchatController().messageReceived);
router.post("/webhook", new WebhookController().getWebhookMessage);
router.get("/version",(req, res, next) => {
    console.log(new Date(), 'Version request received', version);
    res.send({ version: version.num });
    next();
});

module.exports = router