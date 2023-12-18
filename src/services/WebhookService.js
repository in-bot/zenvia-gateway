const axios = require("axios");
const { ZenviaInstanceDAO } = require('../models/ZenviaInstanceDAO');
const { ZenviaStateDAO } = require('../models/ZenviaStateDAO');
const utils = require('../utils');
const { ZenviaBotService } = require('./ZenviaBotService');

class WebhookService {
    async getUserMessage(req, res) {
        const channelId = req.message.to;
        const zenviaInstance = new ZenviaInstanceDAO();
        const zenviaState = new ZenviaStateDAO();
        const zenviaBotService = new ZenviaBotService();
        let instance = await zenviaInstance.getInstanceByChannelID(channelId);
        instance = instance[0];
        console.log(new Date(), `Instance data ${JSON.stringify(instance)}`);
        if (instance === undefined) {
            return 'Bot não cadastrado';
        }

        const dbUserState = await zenviaState.getStateByUserId(req.message.from, instance.bot_id);
        const dbUser = await this.createOrRetrieveState(dbUserState, instance, req)
        console.log(new Date, `dbUser ${JSON.stringify(dbUser)}`);

        let payloadInbot = {
            bot_id: instance.bot_id,
            user_id: req.message.from,
            bot_server_type: instance.bot_server_type,
            bot_token: instance.bot_token,
            channel: "instagram_zenvia",
            setvar: 'setVarStr',
            session_id: dbUser.session_id,
            url_webhook: instance.url_webhook,
        };
        console.log(new Date(), `Contents: ${JSON.stringify(req.message.contents)}`)
        if (req.message.contents[0].type === "text") {
            payloadInbot.user_phrase = req.message.contents[0].text;
        } else {
            // Envio de arquivos
            var data = new FormData()
            data.append("file-upload-anexo", req.message.contents[0].fileUrl);
            data.append("action", "file-upload");
            data.append("bot_id", instance.bot_id);
            data.append("bot_token", instance.bot_token);
            data.append("mime_type", req.message.contents[0].type);
            data.append("folder", "user-files");
            data.append("session_id", sessionId);
            data.append("user_id", req.message.from);
            data.append("channel", "instagram-zenvia");
            data.append("USER_PHONE", req.message.from);
            const uploadFile = await inbotService.postFile(data);
            console.log(new Date(), `UploadFile: ${uploadFile}`)
            payloadInbot.user_phrase = "AFTER_UPLOAD " + uploadFile.url + " mime_type=" + req.message.contents[0].type;
        }

        console.log(new Date(), `Payload: ${JSON.stringify(payloadInbot)}`);
        try {
            await axios.post(instance.url_bot, payloadInbot).then(resp => {
                console.log(resp.data)
                zenviaBotService.postMessage(req, resp.data)
            })
        } catch (error) { console.log(error) }
    }
    async createOrRetrieveState(dbUserState, instance, userData) {
        if (!dbUserState || dbUserState.length === 0) {
            return await this.createNewState(instance, userData);
        } else {
            const resp = await this.recreateSessionIfNecessary(instance, dbUserState);
            console.log(new Date(), `dbUserState: ${JSON.stringify(resp)}`)
            return resp
        }
    }

    async createNewState(instance, userData) {
        const zenviaState = new ZenviaStateDAO();
        const sessionId = utils.sessionGenerator(32);
        const channelId = userData.message.to;
        const userName = userData.message.from;
        const conversationId = userData.message.id;
        try {
            const user = await zenviaState.createState(sessionId, instance.bot_id, channelId, userName, 0, conversationId)
            console.log(new Date(), `Usuario criado: ${JSON.stringify(user)}`)
            return user;
        } catch (error) {
            console.log(error)
        }
    }

    async recreateSessionIfNecessary(instance, dbUserState) {

        const zenviaState = new ZenviaStateDAO()
        const now = new Date();
        let lastInteraction = new Date(dbUserState.last_interaction);
        lastInteraction = lastInteraction.setMinutes(lastInteraction.getMinutes() + 30);
        lastInteraction = new Date(lastInteraction)
        if (now > lastInteraction) {
            const sessionId = utils.sessionGenerator(32);
            try {
                await zenviaState.updateUserSessionState(dbUserState.user_name, instance.bot_id, sessionId);
                const response = await zenviaState.getStateByUserId(dbUserState.user_name, instance.bot_id)
                return response;
            } catch (error) {

            }
        } else {
            await zenviaState.updateUserState(dbUserState.user_name, instance.bot_id)
            const response = await zenviaState.getStateByUserId(dbUserState.user_name, instance.bot_id)
            return response;
        }
    }
}

module.exports = {
    WebhookService
}