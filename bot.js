/* Author: Mirai-Miki
 * Verson: 1.6.0
 */

const fs = require("fs");

const Discord = require("discord.js");
const Database = require("./modules/Database.js");
const Initiative = require("./modules/Initiative.js");
const Settings = require("./modules/Settings.js");
const Util = require("./modules/Util.js");
const Dice = require("./modules/Dice.js");
const DiffRoll = require("./modules/DiffRoll.js");
const IncomingDiceMessage = require("./modules/IncomingDiceMessage");
const config = require("./config.json");

const client = new Discord.Client();

////////////////////////////////// Constants //////////////////////////////////

const REASON = 1;

////////////////////////////// Functions //////////////////////////////////////

// Explains how to use the bot
function usage(receivedMessage, error=0) {
    switch (error) {
        case 0:
            receivedMessage.channel.send(receivedMessage.author.toString() + 
                ' Bot Usage: `/d dice@diff+mod(spec) "reason"` \nExamples: ' +
                '`3@2+1s Auspex`, `3@2+1 Auspex`, `3@2+s Auspex`, `3@2 Auspex`');
            break;
        case REASON:
            receivedMessage.channel.send(receivedMessage.author.toString() + 
                " Please add the reason you rolled." +
                " For example: `/d 3@2 Auspex`");
            break;
    }    
}

/*
 * executes the "/d " command for the bot
 *
 * recvMess: Message that was received
 */
 function dice(recvMess) {
    const setting = new Database();
    setting.open(recvMess.guild.name, config.path);
    if (setting.is_empty()) { // No guild database created
        Util.init_settings(setting);
    }
    var msg = recvMess.content.substring(3);
    var arg; 
    const diceMsg = new IncomingDiceMessage(msg, setting.find("diff"));    

    if (!diceMsg.valid) {
        usage(recvMess);
        return;
    }
    if (diceMsg.diffMess) {
        if (setting.find("requireDiffReason") && diceMsg.reason == undefined) {
            usage(recvMess, REASON);
            return;
        }
        let diffRoll = new DiffRoll(diceMsg);
        var msg = recvMess.author.toString() + " `" + diceMsg.dice + 
                setting.find("diff") + diceMsg.diff;
        if (diceMsg.mod != "0" || diceMsg.spec) {
            msg += "+";
            if (diceMsg.mod != "0") {
                msg += diceMsg.mod;
            }
            if (diceMsg.spec) {
                msg += "s";
            }
        }
        msg += "`";
        if (diceMsg.reason != undefined) {
            msg += " Rolling for: " + diceMsg.reason;
        }                
        msg += "\n" + diffRoll.result(setting);       

    } else if (diceMsg.rollMess) {
        if (setting.find("requireRollReason") && diceMsg.reason == undefined) {
            usage(recvMess, REASON);
            return;
        }
        let dicePool = Dice.roll_many(diceMsg.dice, diceMsg.sides);
        var msg = recvMess.author.toString() + ' `' + diceMsg.dice + 'd' +
                diceMsg.sides + '` ';
        if (diceMsg.reason != undefined) {
            msg += " Rolling for: " + diceMsg.reason;
        }
        msg += "\n```css\nRolled: " + Dice.dice_toString(dicePool) + "\n```"
    }
    Util.send_message(recvMess, msg);
}

////////////////////////////////// Main Loop //////////////////////////////////

client.on("ready", () => {
        console.log("Connected as: " + client.user.tag);
        client.user.setActivity('World of Darkness', { type: 'PLAYING' });
});

client.on("guildCreate", (guild) => {
    let db = new Database();
    db.open("guilds", config.path);
    if (!db.find("Active") || !db.find("Inactive")) { // Database is empty
        db.new("Active", []);
        db.new("Inactive", []);
    }
    if (!db.find("Active").includes(guild.name)) {
        db.find("Active").push(guild.name);
    }
    if (db.find("Inactive").indexOf(guild.name) != -1) {
        db.find("Inactive").splice((db.find("Inactive").indexOf(guild.name)), 1);
    }
    db.close();
});

client.on("guildDelete", (guild) => {
    let db = new Database();
    db.open("guilds", config.path);
    if (!db.find("Active") || !db.find("Inactive")) { // Database is empty
        db.new("Active", []);
        db.new("Inactive", []);
    }
    if (!db.find("Inactive").includes(guild.name)) {
        db.find("Inactive").push(guild.name);
    }
    if (db.find("Active").indexOf(guild.name) != -1) {
        db.find("Active").splice((db.find("Active").indexOf(guild.name)), 1);
    }
    db.close();
});

client.on('message', (recvMess) => {
    // Prevent bot from responding to other bots
    if (recvMess.author.bot) {
        return;
    } else if (!recvMess.guild) {
        recvMess.author.send("Commands must be sent from a server.");
        return;
    }

    // checks if a message is a command to start the bot
    if (recvMess.content.substring(0, 3).toLowerCase() == "/i ") {
        new Initiative(recvMess);
    } else if (recvMess.content.substring(0, 7).toLowerCase() == "/d set ") {
        new Settings(recvMess);
    } else if (recvMess.content.substring(0, 3).toLowerCase() == "/d ") {
        dice(recvMess);
    }
    
});

// Logs into the server using the secret token
botToken = config.token;
client.login(botToken);