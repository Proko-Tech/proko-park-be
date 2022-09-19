const {WebClient} = require('@slack/web-api');

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const token = process.env.SLACK_TOKEN;

const web = new WebClient(token);

/**
 * Send defects notification to channel.
 * @param text
 * @returns {Promise<*>}
 */
async function sendDefectsNotification(text) {
    const response = await web.chat
        .postMessage({channel: process.env.SLACK_CHANNEL, text});
    return response;
}

module.exports={sendDefectsNotification}
