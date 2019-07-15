/* Author: Mirai-Miki
 * Verson: 1.5.0
 */

const Discord = require("discord.js");
const fs = require("fs");
const config = require("./config.json");
const client = new Discord.Client();

////////////////////////////////// Constants //////////////////////////////////

const Error = {
    REASON: 1,
    INIT: 2,
}

////////////////////////////// Functions //////////////////////////////////////

// Explains how to use the bot
function usage(receivedMessage, error=0) {
    switch (error) {
        case 0:
            receivedMessage.channel.send(receivedMessage.author.toString() + 
                ' Bot Usage: `/d dice@diff+mod(spec) "reason"` \nExamples: ' +
                '`3@2+1s Auspex`, `3@2+1 Auspex`, `3@2+s Auspex`, `3@2 Auspex`');
            break;
        case Error.REASON:
            receivedMessage.channel.send(receivedMessage.author.toString() + 
                " Please add the reason you rolled." +
                " For example: `/d 3@2 Auspex`");
            break;
        case Error.INIT:
            receivedMessage.channel.send(receivedMessage.author.toString() + 
                " Bot Usage: `/i (dex+wits)`\nExample: `/i 7`");
            break;
    }    
}

/*
 * It takes an initiative message and rolls one 10 sided dice. The result will
 * be added to the number received by the bot send the total back to the player
 *
 * recv_mess: message received by the player must be a positive int between 0
 *            and 30
 */
function initiative(recv_mess) {
    let input = recv_mess.content.substring(3);
    let dice;
    let message;

    if (!parse_init(input)) {
        usage(recv_mess, Error.INIT);
        return;
    }

    dice = roll_dice();
    message = construct_mess(dice, input, recv_mess.author.toString());
    send_message(recv_mess, message);
}

/*
 * Takes an input and if the input is valid returns true
 *
 * input: the message to be parsed
 * return: Returns true if the input is a valid int between 0 and 30
 */
function parse_init(input) {
    if (input.length != 1 && input.length != 2) {
        return false;
    }

    for (let i = 0; i < input.length; i++) {
        if (input[i] < "0" || input[i] > "9") {
            return false;
        }
    }
    return true;
}

/*
 * Rolls an n sided dice and returns the number
 *
 * sides: number of sides the dice contains. Default is 10.
 *
 * return: returns an int 1<=int<=10
 */
function roll_dice(sides=10) {
    return Math.floor(Math.random() * sides)+1;
}

/* 
 * Rolls n number of dice with n number of sides and returns the results
 *
 * dice: number of dice to be rolled
 * sides: the number of sides each dice contains. Default is 10.
 *
 * return: Returns an array of n number of results.
 */
function roll_many(dice, sides=10) {
    let dicePool = [];
    for (let i = 0; i < dice; i++) {
        dicePool.push(roll_dice(sides));
    }
    return dicePool;
}

/*
 * Constructs the initiative roll using the dice roll and input provided
 *
 * dice: the result of a single 10 sided dice roll
 * input: the valid int that the player provided
 * author: The user who send the command to start
 *
 * return: returns the message to be sent back to the player.
 */
function construct_mess(dice, input, author) {
    return (author + " Rolling for initiative" +
        "\n[" + dice + "] + " + input + "\n```css\nTotal: " + 
        (dice + Number(input)) + "\n```");
}

/*
 * Sends a message to the same channel that the original message was received.
 *
 * recvMess: Message that was received to prompt a return message
 * message: message to be sent to the user
 */
function send_message(recvMess, message) {
    recvMess.channel.send(message);
}

/*
 * executes the "/d " command for the bot
 *
 * recvMess: Message that was received
 */
 function dice(recvMess) {
    var msg = recvMess.content.substring(3);
    var arg; 
    const diceMsg = new DiceMessage(msg);

    if (!diceMsg.valid) {
        usage(recvMess);
        return;
    }
    if (diceMsg.diffMess) {
        if (config.reqDiffReason && diceMsg.reason == undefined) {
            usage(recvMess, Error.REASON);
            return;
        }
        let diffRoll = new DiffRoll(diceMsg);
        var msg = recvMess.author.toString() + " `" + diceMsg.dice + "@" +
                diceMsg.diff;
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
        msg += "\n" + diffRoll.result();       

    } else if (diceMsg.rollMess) {
        if (config.reqRollReason && diceMsg.reason == undefined) {
            usage(recvMess, Error.REASON);
            return;
        }
        let dicePool = roll_many(diceMsg.dice, diceMsg.sides);
        var msg = recvMess.author.toString() + ' `' + diceMsg.dice + 'd' +
                diceMsg.sides + '` ';
        if (diceMsg.reason != undefined) {
            msg += " Rolling for: " + diceMsg.reason;
        }
        msg += "\n```css\nRolled: " + dice_toString(dicePool) + "\n```"
    }
    send_message(recvMess, msg);
}

function dice_toString(dicePool) {
    let msg = "[";
    for (let i = 0; i < dicePool.length; i++) {
        msg += dicePool[i];
        if (dicePool.length == (i+1)) {
            msg += "]";
        } else {
            msg += ",";
        }
    }
    return msg;
}

/////////////////////////////////// Classes ///////////////////////////////////

class DiceMessage {
    constructor(message) {
        var arg = message;
        this.diffMess = false;
        this.rollMess = false;
        this.valid = false;
        this.dice = "";
        this.sides = 10;
        this.diff = "";
        this.mod = "";
        this.spec = false;
        this.reason = undefined;
        this.parse_message(arg);
        this.is_valid();
    }

    /* 
     * Checks that all parameters of the message are within accepted
     * values to prevent crashes from large or unexpected integers
     */
    is_valid() {
        if (this.diffMess && 
                (Number(this.dice) > 100 || Number(this.dice) <= 0 ||
                Number(this.diff) <= 0 || Number(this.diff) > 10 ||
                Number(this.sides) <= 0 || Number(this.sides) > 100 ||
                Number(this.mod) < 0 || Number(this.mod) > 100)) {
            this.valid = false;
        } else if (this.rollMess && 
                (Number(this.dice) > 100 || Number(this.dice) <= 0 ||
                Number(this.sides) > 100 || Number(this.sides) <= 0)) {
            this.valid = false;
        }
    }

    /*
     * Parses the arguments from the message received and if it is a valid
     * message assigns each variable with the associated argument.
     *
     * arg: message received less the command "/d "
     */
    parse_message(arg) {
        if (arg.includes("@")){
            this.diffMess = true;
            let difSwap = false;
            let modSwap = false;
            let count = 0;
            for (let i = 0; i < arg.length; i++) { // Start Parse
                if (!difSwap && !modSwap) { // Dice side
                    if (arg[i] == '@') { // We hit the @             
                        if (!count || arg.length == (i+1) || arg[i+1] == " ") {
                            // Cannot be the end and must have at least 1 dice
                            return;
                        } else {
                            difSwap = true;
                            count = 0;
                        }
                    } else if (arg[i] < '0' || arg[i] > '9') { 
                        // needs to be a digit
                        return;
                    } else { // it is a digit
                        this.dice += arg[i];
                        count++;                    
                    }         
                } else if (difSwap && !modSwap) { // Difficulty side
                    if (arg[i] == '+') {
                        if (!count || arg.length == (i+1) || arg[i+1] == ' ') {
                            // cannot be the end and must have at least 1 diff
                            return;
                        } else {
                            modSwap = true;
                            count = 0;
                        }
                    } else if (arg[i] == ' ') {
                        // end of parse with reason
                        if (arg.length == (i+1)) { // no reason but valid
                            break;
                        } else {
                            this.reason = arg.substring(i+1);
                            break;
                        }
                    } else if (arg[i] < '0' || arg[i] > '9') { 
                        // needs to be a digit
                        return;
                    } else { // it is a digit
                        this.diff += arg[i];
                        count++;                    
                    }
                } else if (difSwap && modSwap) {
                    // add mod
                    if (arg[i] == 's' && (arg.length == (i+1) || arg[i+1] == ' ')) {
                        this.spec = true;
                        if (!count) {
                            this.mod = "0";
                        }
                    } else if (arg[i] == ' ') {
                        // end of parse with reason
                        if (arg.length == (i+1)) { // no reason but valid
                            break;
                        } else {
                            this.reason = arg.substring(i+1);
                            break;
                        }
                    } else if (arg[i] < '0' || arg[i] > '9') { 
                        // needs to be a digit
                        return;
                    } else {
                        this.mod += arg[i];
                        count++;           
                    }                                 
                } else {
                    return;
                }
            } // End Arg Parse            
            if (!modSwap) { // If no mod was added
                this.mod = "0";
            }
            this.valid = true;
        } else {
            this.rollMess = true;
            let changeSide = false;
            let count = 0;

            for (let i = 0; i < arg.length; i++) {
                if (!changeSide) { // dice side
                    if (arg[i] == 'd') {
                        if (!count || arg.length == (i+1) || arg[i+1] == ' ') {
                            return;
                        } else {
                            changeSide = true;
                            count = 0;
                        }
                    } else if (arg[i] == ' ' && count) {
                        if (arg.length == (i+1)) { // no reason but valid
                            break;
                        } else {
                            this.reason = arg.substring(i+1);
                            break;
                        }
                    } else if (arg[i] < '0' || arg[i] > '9') {
                        return;
                    } else {
                        this.dice += arg[i];
                        count++;
                    }
                } else if (changeSide) { // Change side side
                    if (arg[i] == " ") {
                        if (arg.length == (i+1)) { // no reason but valid
                            break;
                        } else {
                            this.reason = arg.substring(i+1);
                            break;
                        }
                    } else if (arg[i] < '0' || arg[i] > '9') {
                        return;
                    } else {
                        if (!count) {
                            this.sides = arg[i];
                        } else {
                            this.sides += arg[i];
                        }
                        count++;
                    }
                }
            }
            this.valid = true;
        }
    }
}

class DiffRoll {
    constructor(diceMessage) {
        this.diceMsg = diceMessage;
        this.suxx = 0;
        this.specSuxx = 0;
        this.fail = 0;
        this.total = 0;
        this.failed = false;
        this.botch = false;
        this.dicePool;
        this.calculate_roll();
    }

    /*
     * Calculates the total suxx from the dice pool and stores the values
     * in the object
     */
    calculate_roll() {
        this.dicePool = roll_many(this.diceMsg.dice);
        for (let i = 0; i < this.dicePool.length; i++) {
            if (this.dicePool[i] == 1) {
                this.fail++;
            } else if (this.diceMsg.spec && this.dicePool[i] == 10) {
                this.specSuxx++;
            } else if (this.dicePool[i] >= this.diceMsg.diff) {
                this.suxx++;
            }
        }

        if (this.suxx == 0 && this.fail > 0 && this.specSuxx == 0 && 
                Number(this.diceMsg.mod) == 0) {
            this.botched = true;
        } else if (this.fail >= (this.suxx + this.specSuxx) && 
                Number(this.diceMsg.mod) == 0) {
            this.failed = true;
        } else {
            this.suxx -= this.fail;
            if (this.suxx < 0) {
                this.specSuxx += this.suxx;
                this.suxx = 0;
                if (this.specSuxx < 0) {
                    this.specSuxx = 0;
                }
            }
            this.total = (this.suxx + Number(this.diceMsg.mod) + 
                    (this.specSuxx * 2));
        }
    }

    /* 
     * Returns a string detailing the results of the roll
     *
     * return: message returned as a string
     */
    result() {
        let msg = "["
        for (let i = 0; i < this.dicePool.length; i++) {
            switch (this.dicePool[i]) {
                case 1:
                    msg += config.failEmote;
                    break;
                case 10:
                    if (this.diceMsg.spec) {
                        msg += config.specEmote;
                        break;
                    }
                default:
                    if (this.dicePool[i] < Number(this.diceMsg.diff)) {
                        msg += "~~" + this.dicePool[i] + "~~";
                    } else {
                        msg += "**" + this.dicePool[i] + "**";
                    }
            }
            if (this.dicePool.length == (i+1)) {
                msg += "]\n";
            } else {
                msg += ",";
            }
        }

        if (this.botched) {
            return (msg + "```diff\n- Botched!!\n```");
        } else if (this.failed) {
            return (msg + "```fix\nFailed!\n```");
        } else {
            return (msg + "```css\nRolled: " + this.total + " suxx\n```");
        }
    }
}

class Database {
    constructor() {
        this.path;
        this.db = {};
    }

    open(name) {
        this.path = name+".json";
        let contents;
        if(fs.existsSync(this.path)) { // Guild database exists
            contents = fs.readFileSync(this.path, "utf-8");
            this.db = JSON.parse(contents);
        } else { // Init database
            this.db["Active"] = [];
            this.db["Inactive"] = [];
        }
    }

    /*
     * Searches the database for a key and returns its value.
     * if no such key exists nothing will be returned.
     *
     * name: Name of the key to be searched.
     *
     * return: Returns the value of the key if it exists else returns undefined.
     */
    find(key) {
        return this.db[key];
    }

    delete_db() {
        if(fs.existsSync(this.path)) { // Guild database exists
            fs.unlinkSync(this.path);
        }        
    }

    close() {
        let contents = JSON.stringify(this.db);
        fs.writeFileSync(this.path, contents, "utf-8", (err) => {
            if (err) throw err;
        });
    }
}

////////////////////////////////// Main Loop //////////////////////////////////

client.on("ready", () => {
        console.log("Connected as: " + client.user.tag);
        client.user.setActivity('World of Darkness', { type: 'PLAYING' });
});

client.on("guildCreate", (guild) => {
    let db = new Database();
    db.open("guilds");
    db.find("Active").push(guild.name);
    if (db.find("Inactive").indexOf(guild.name) != -1) {
        db.find("Inactive").splice((db.find("Inactive").indexOf(guild.name)), 1);
    }
    db.close();
});

client.on("guildDelete", (guild) => {
    let db = new Database();
    db.open("guilds");
    db.find("Inactive").push(guild.name);
    if (db.find("Active").indexOf(guild.name) != -1) {
        db.find("Active").splice((db.find("Active").indexOf(guild.name)), 1);
    }
    db.close();
});

client.on('message', (receivedMessage) => {
    // Prevent bot from responding to its own messages
    if (receivedMessage.author.bot) {
        return
    }

    // checks if a message is a command to start the bot
    if (receivedMessage.content.substring(0, 3) == "/i ") {
        initiative(receivedMessage);

    } else if (receivedMessage.content.substring(0, 3) == "/d ") {
        dice(receivedMessage);
    }
    
});

// Logs into the server using the secret token
botToken = config.token;
client.login(botToken);