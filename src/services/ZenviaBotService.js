const axios = require("axios");
const utils = require("../utils");
const Promise = require("bluebird");
const { ZenviaInstanceDAO } = require("../models/ZenviaInstanceDAO");

class ZenviaBotService {
    async sendMessage(payloadZenvia) {

        const url_zenvia = "https://api.zenvia.com/v2/channels/instagram/messages";
        const headers = {
            headers: {
                'X-API-TOKEN': 'qaqdeagjXK55b9Unv03iNGMNJ8BU9UWZzv8w'
            }
        };
        try {
            axios
                .post(url_zenvia, payloadZenvia, headers)
                .then((response) => {
                    console.log(response.data);
                    return 200;
                })
                .catch((err) => {
                    console.log(err.response.data);
                    return err;
                });
            console.log(body);
        } catch (error) {
            console.error(error.response);
            return error;
        }
    }

    async postMessage(body, respInbot) {
        const zenviaInstanceDAO = new ZenviaInstanceDAO();
        const channelID = body.message.to;
        let instance = await zenviaInstanceDAO.getInstanceByChannelID(channelID); //dados retorno do banco
        instance = instance[0];
        console.log(`retorno instance ${JSON.stringify(respInbot.resp)}`);

        for (const bloco of respInbot.resp) {
            const payloadZenvia = {
                "from": body.message.to,
                "to": body.message.from,
                "contents": [
                    {
                        "type": "text",
                        "text": bloco.message
                    }
                ],
                "conversation": {
                    "solution": "conversion"
                }
            }

            const quickReply = utils.extractQuickReplies(bloco.message);
            console.log(quickReply[1].length)
            if (quickReply[1].length > 0) {
                payloadZenvia.contents[0].type = "replyable_text";
                payloadZenvia.contents[0].text = quickReply[0]
                let quickReplies = [];
                quickReply[1].forEach(resp => {
                    quickReplies.push({
                        type: 'text',
                        text: resp.title,
                        payload: resp.value
                    })
                })
                payloadZenvia.contents[0].quickReplyButtons = quickReplies
            }
            if (bloco.delay > 0) await Promise.delay(bloco.delay * 1000);
            console.log(JSON.stringify(payloadZenvia))
            this.sendMessage(payloadZenvia);
        }
    }

}

module.exports = {
    ZenviaBotService,
};
