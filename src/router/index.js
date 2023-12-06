const express = require("express");
const router = express.Router();
const { WebhookController } = require('../controllers/WebhookController')

router.get("/user",);
router.get("/bot",);
router.post("/bot",);
router.get("/webhook",);
router.post("/webhook", new WebhookController().getWebhookMessage);

module.exports = router