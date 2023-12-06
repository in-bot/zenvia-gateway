const { WebhookService } = require("../services/WebhookService");

class WebhookController {
    async getWebhookMessage(req, res) {
        const webhookService = new WebhookService();
        console.log(req.body);
        webhookService.getUserMessage(req.body);
        res.sendStatus(200);
    }
}

module.exports = {
    WebhookController,
};