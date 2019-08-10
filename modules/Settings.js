/* Settings.js
 * Author: Michael Bossner
 */

const Util = require("./Util.js");
const Database = require("./Database.js");
const config = require("../config.json");

module.exports = class Settings {
    constructor(recvMess) {
        let msg = (recvMess.author + " **Error**: invalid key value pair." +
                "\n/d set diffReason true/false\n" +
                "/d set rollEeason true/false\n" +
                "/d set failEmote string\n" + "/d set specEmote string\n" +
                "/d set diff string");
        if (!Util.is_admin(recvMess.member)) {
            msg = (recvMess.author + " Only admins can change these.");
            Util.send_message(recvMess, msg);
            return;
        }
        let input = recvMess.content.substring(7).toLowerCase().split(" ");
        const setting = new Database();
        setting.open(recvMess.guild.name, config.path);
        if (setting.is_empty()) {
            Util.init_settings(setting);
        }

        if (!input) {
            Util.send_message(recvMess, msg);
            return;
        }
        for (let i = 0; i < input.length; i++) {
            if (input[i] == '') { // Remove extra spaces
                while (input[i] == '') {
                    input.splice(i, 1);
                }                
            }
        }
        if (input.length == 2) { // key value pair
            switch (input[0]) {
                case "diffreason":
                    if (input[1] == "false") {
                        setting.update("requireDiffReason", false);
                    } else if (input[1] == "true") {
                        setting.update("requireDiffReason", true);
                    } else {
                        Util.send_message(recvMess, msg);
                        return;
                    }
                    break;
                case "rollreason":
                    if (input[1] == "false") {
                        setting.update("requireRollReason", false);
                    } else if (input[1] == "true") {
                        setting.update("requireRollReason", true);
                    } else {
                        Util.send_message(recvMess, msg);
                        return;
                    }
                    break;
                case "failemote":
                    setting.update("failEmote", input[1]);
                    break;
                case "specemote":
                    setting.update("specEmote", input[1]);
                    break;
                case "diff":
                    setting.update("diff", input[1]);
                    break;
                default:
                    Util.send_message(recvMess, msg);
                    return;
            }
        } else {
            Util.send_message(recvMess, msg);
            return;
        }
        msg = (recvMess.author + " Settings Changed.");
        Util.send_message(recvMess, msg);
        setting.close();
    }
}