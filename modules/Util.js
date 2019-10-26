/* Util.js
 * Author: Michael Bossner
 */

const config = require("../config.json");

 /*
 * Sends a message to the same channel that the original message was received.
 *
 * recvMess: Message that was received to prompt a return message
 * message: message to be sent to the user
 */
exports.send_message = (recvMess, message) => {
    recvMess.channel.send(message);
}

exports.init_settings = (setting) => {
    setting.new("requireDiffReason", config.requireDiffReason);
    setting.new("requireRollReason", config.requireRollReason);
    setting.new("failEmote", config.failEmote);
    setting.new("specEmote", config.specEmote);
    setting.new("diff", config.diff);
    setting.new("botchTag", config.botchTag);
    setting.close();
}

exports.is_admin = (member) => {
    return member.hasPermission("ADMINISTRATOR");
}