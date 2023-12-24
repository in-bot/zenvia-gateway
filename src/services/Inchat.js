const { default: axios } = require("axios");

const circular = require('circular-json');
const { createHash } = require('node:crypto');
const { ZenviaStateDAO } = require("../models/ZenviaStateDAO");
const { ZenviaInstanceDAO } = require("../models/ZenviaInstanceDAO");

/**
 * Faz escalation
 * @param state
 * @returns {Promise<void>}
 */
async function performEscalation(state) {
    const zenviaState = new ZenviaStateDAO();
    await startEscalation(state)
        .then(async () => {
            const out = await zenviaState.updateState(state.user_id,state.bot_id,1);
            return out;
        }).catch((error) => {
            console.log(new Date(), `performEscalation: ${state.user_id}: ERROR: ${error}`);
        })
}

async function performDeEscalation(state) {
    const zenviaState = new ZenviaStateDAO();    
    await (zenviaState.updateState(state.user_id,state.bot_id,0)
        .catch((error) => {
            console.log(new Date(), `performDeEscalation: ${state.user_id}: ERROR: ${error}`);
        }));
}

/**
 * Envia mensagem para o inchat avisando do início do escalation
 * @param state
 * @returns {Promise<void>}
 */
async function startEscalation(state) {
    const zenviaInstance = new ZenviaInstanceDAO();
    let instance = await zenviaInstance.getInstanceByChannelID(state.channel_id);
    instance = instance[0];
    console.log(`Instancia: ${JSON.stringify(instance)}`)
    // call inchat api to start escalation
    const url = 'https://proxy1.in.bot/api';

    const url_webhook = `https://webhooks.inbot.com.br/zenvia/v1/gateway/inchat`;
    console.log(new Date(), 'startEscalation: session_id = ', state.session_id, 'bot_id = ', state.bot_id);
    const data = {
        params: {
            action: 'escalation',
            server_type: instance.bot_server_type,
            bot_id: instance.bot_id,
            user_id: state.user_id,
            escalation_group: state.escalation_group,
            user_name: state.user_name,
            session_id: state.session_id,
            bot_token: instance.bot_token,
            bot_session_id: state.session_id,
            channel: "instagram_zenvia",
            url_webhook: url_webhook
        }
    };
    console.log(new Date(), `startEscalation II: ${circular.stringify(data.params)}`)
    const result = await axios.get(url, data);
    console.log(new Date(), `startEscalation III: ${circular.stringify(data.params)} ----> ${result.status}`, circular.stringify(result.data));
    return result;
}

/**
 * O teams manda ids muito longos. Isto reduz o tamanho, aplicando sha3-256 e truncando em maxLen bytes
 * @param id
 * @param maxLen
 */
function treatLongId(id, maxLen) { return createHash('sha3-256').update(id).digest('hex').substring(0, maxLen); }
function sessionGenerator(maxLen) { return createHash('sha3-256').update(Date()).digest('hex').substring(0, maxLen); }


module.exports = {
    forwardToInchat: async (userState, message) => {
        console.log(new Date(), `forwarding message to inchat: state=`, circular.stringify(userState));       
        const url = 'https://proxy1.in.bot/api';
        const instance = await botInstance;
        const data = {
            server_type: instance.bot_server_type, // status.bot_server_type,
            bot_id: instance.bot_id, // status.bot_id,
            bot_token: instance.bot_token, // status.bot_token,
            BOT_PHONE: userState.bot_id,
            user_phrase: message, // req.body.from.text,
            user_id: userState.user_id, // req.body.user_id,
            user_name: userState.user_name,
            session_id: userState.session_id,
            bot_session_id: userState.session_id, // req.body.bot_session_id
            action: 'client_to_operator',
            channel_id: userState.channel_id,
            url_webhook: `https://webhooks.inbot.com.br/zenvia/v1/gateway/inchat`
        };
        console.log(new Date(), 'Inchat.js: sending to inchat: ', circular.stringify(data));
        const result = axios.post(url, data)
            .then((response) => {
                console.log(new Date(), 'Inchat.js: response from inchat: ', circular.stringify(response.data));
            })
            .catch((error) => {
                console.log(new Date(), 'Inchat.js: error from inchat: ', circular.stringify(error));
            });
        await result;
    },
    async treatEscalation(response, body, instance,dbUser) {
            console.log(new Date(), `treatEscalation: Iniciando o processo de escalation: ${circular.stringify(response.data)}`);
            const state = {
                send_to_inchat: true,
                user_id: body.message.from,
                user_name: body.message.visitor.name,
                escalation_group: response.data.escalation_group,
                channel_id: instance.channel_id,
                url_webhook: instance.url_webhook,
                session_id: dbUser.session_id,
                bot_id: instance.bot_id
            };
            await performEscalation(state);
        return response;
    },
    startEscalation: async (state) => await startEscalation(state),
    performEscalation: async (state) => await performEscalation(state),
    performDeEscalation: async (state) => await performDeEscalation(state),
    treatLongId: treatLongId,
    sessionGenerator: sessionGenerator,
};
