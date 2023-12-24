const { ZenviaInstanceDAO } = require("../models/ZenviaInstanceDAO");
const { ZenviaStateDAO } = require("../models/ZenviaStateDAO");
const { performDeEscalation } = require("../services/Inchat");
const { ZenviaBotService } = require("../services/ZenviaBotService");

class InchatController {
    async messageReceived(req, res) {
        const zenviaStateDAO = new ZenviaStateDAO();
        const zenviaInstanceDAO = new ZenviaInstanceDAO()
        const zenviaBotService = new ZenviaBotService()
        let state = [];

        const params = { ...req.query, ...req.params, ...req.body };
        console.log(`Params: ${JSON.stringify(params)}`)
        let _userState = await zenviaStateDAO.getStateBySessionId(params.sessionId);
        const _instance = await zenviaInstanceDAO.getInstanceByBotID(params.from);
        let userState = _userState[0];
        const instance = _instance[0];

        if (!params.escalation) {
            console.log(new Date(), `InchatAPI: Inchat fazendo deescalation para ${params.to}`);
            state = {
                send_to_inchat: params.escalation,
                user_id: params.to,
                recipient_id: params.from,
                channel_id: "instagram_zenvia",
                session_id: params.session_id,
                escalation: params.escalation,
                url_webhook: `https://webhooks.inbot.com.br/zenvia/v1/gateway/inchat`,
                message: params.message,
                bot_id: instance.bot_id
            };
            await performDeEscalation(state);
        }

        _userState = await zenviaStateDAO.getStateBySessionId(params.sessionId);        
        userState = _userState[0];

        if (params.message) {
            await zenviaStateDAO.updateState(params.to, params.from, userState.send_to_inchat);
            const resp = { resp: [{ message: params.message }] }
            const payload = {
                message: {
                    "to": instance.channel_id,
                    "from": params.to
                }
            }
            console.log(`Payload: ${JSON.stringify(payload)}`)
            zenviaBotService.postMessage(payload, resp);
            res.end("sent with result ");
        } else {
            res.end("inchatAPI: nenhuma mensagem para enviar");
        }

        return;
    };
}

module.exports = { InchatController }