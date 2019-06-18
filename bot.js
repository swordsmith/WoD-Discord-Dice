/* Author: Mirai-Miki
 * Verson: 1.3
 */

const Discord = require("discord.js")
const config = require("./config.json")
const client = new Discord.Client()

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
 * Rolls a 10 sided dice and returns the number
 *
 * return: returns an int 1<=int<=10
 */
function roll_dice() {
    return Math.floor(Math.random() * 10)+1;
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
 * recv_mess: Message that was received to prompt a return message
 * message: message to be sent to the user
 */
function send_message(recv_mess, message) {
    recv_mess.channel.send(message);
}

////////////////////////////////// Main Loop //////////////////////////////////

client.on("ready", () => {
        console.log("Connected as: " + client.user.tag)})

client.on('message', (receivedMessage) => {
    // Prevent bot from responding to its own messages
    if (receivedMessage.author == client.user) {
        return
    }

    // checks if a message is a command to start the bot
    if (receivedMessage.content.substring(0, 3) == "/i ") {
        initiative(receivedMessage);

    } else if (receivedMessage.content.substring(0, 3) == "/d ") {
        var msg = receivedMessage.content.substring(3);
        var arg;
        // A valid message must include " " and a reason
        if (msg.length < 3) {
            usage(receivedMessage);
            return;
        } else if (!msg.includes(" ")) {
            usage(receivedMessage, Error.REASON);
            return;
        }

        // break the note and the roll apart and put them into an array
        // Roll is at index 0 and note is at index 1
        for (var i = 0;;i++) {
            if (i == msg.length) {
                usage(receivedMessage)
                return;
            } else if (msg[i] == ' ' && (i + 1) == msg.length) {
                usage(receivedMessage, Error.REASON);
                return;
            } else if (msg[i] == ' ') {
                arg = [msg.substring(0, i), msg.substring(i+1)];
                break;
            }
        }

        // We need to parse the roll
        var dice = '';
        var diff = '';
        var mod = '';
        var spec = false;
        var difswap = false;
        var modswap = false;
        var count = 0;
        if (!arg[0].includes("@")) { // The roll must include "@"
                usage(receivedMessage);
                return;
        }
        for (var i = 0; i < arg[0].length; i++) { // Start Parse
            if (!difswap && !modswap) { // Dice side
                if (arg[0][i] == '@') { // We hit the @             
                    if (!count || arg[0].length == (i+1)) {
                        // Cannot be the end and must have at least 1 dice
                        usage(receivedMessage);
                        return;
                    } else {
                        difswap = true;
                        count = 0;
                    }
                } else if (arg[0][i] < '0' || arg[0][i] > '9') { 
                    // needs to be a digit
                    usage(receivedMessage);
                    return;
                } else { // it is a digit
                    dice += arg[0][i];
                    count++;                    
                }         
            } else if (difswap && !modswap) { // Difficulty side
                if (arg[0][i] == '+') {
                    if (!count || arg[0].length == (i+1)) {
                        // cannot be the end and must have at least 1 diff
                        usage(receivedMessage);
                        return;
                    } else {
                        modswap = true;
                        count = 0;
                    }
                } else if (arg[0][i] < '0' || arg[0][i] > '9') { 
                    // needs to be a digit
                    usage(receivedMessage);
                    return;
                } else { // it is a digit
                    diff += arg[0][i];
                    count++;                    
                }
            } else if (difswap && modswap) {
                // add mod
                if (arg[0][i] == 's' && arg[0].length == (i+1)) {
                    spec = true;
                    if (!count) {
                        mod = "0";
                    }
                } else if (arg[0][i] < '0' || arg[0][i] > '9') { 
                    // needs to be a digit
                    usage(receivedMessage);
                    return;
                } else {
                    mod += arg[0][i];
                    count++;           
                }
            } else {
                usage(receivedMessage)
                return;
            }
        } // End Arg Parse

        // If no mod was added
        if (!modswap) {
            mod = "0";
        }

        // Difficulty must between 1 and 10
        // Dice must be between 1 and 30
        // Mod must not be more than 30
        if ((Number(diff) > 10 || Number(diff) < 1) ||
            (Number(dice) > 30 || Number(dice) < 1) ||
            Number(mod) > 30) {
            usage(receivedMessage);
            return;
        }

        // Rolling the Dice
        var d_pool = [];
        var suxx = 0;
        var fail = 0;
        var spec_suxx = 0;
        for (var i = 0; i < Number(dice); i++) {
            // RNG Roller
            var temp = Math.floor(Math.random() * 10)+1
            
            if (temp == 1) {
                fail++;
            } else if (temp == 10 && spec) {
                spec_suxx++;
            } else if (temp >= Number(diff)) {
                suxx++;
            }
            d_pool.push(temp);
        }
        // Constructing the message to send
        var new_mess = receivedMessage.author.toString() + " `" + arg[0] +
            "` Rolling for: " + arg[1] + "\n[";

        // Adding the dice pool
        for (var i = 0; i < d_pool.length; i++) {
            switch (d_pool[i]) {
                case 1:
                    new_mess += ":skull_crossbones:";
                    break;
                case 10:
                    if (spec) {
                        new_mess += ":trophy:";
                        break;
                    }
                default:
                    if (d_pool[i] < Number(diff)) {
                        new_mess += "~~" + d_pool[i] + "~~";
                    } else {
                        new_mess += "**" + d_pool[i] + "**";
                    }
            }
            if ((d_pool.length - 1) == i) {
                new_mess += "]\n";
            } else {
                new_mess += ",";
            }
        }

        // Adding the outcome
        if (suxx == 0 && fail > 0 && spec_suxx == 0 && Number(mod) == 0) { 
            // botched
            new_mess += "```diff\n- Botched!!\n```";
        } else if (fail >= (suxx + spec_suxx) && Number(mod) == 0) { // failed
            new_mess += "```fix\nFailed!\n```";
        } else { // suxx
            suxx -= fail;
            if (suxx < 0) {
                spec_suxx += suxx;
                suxx = 0;
                if (spec_suxx < 0) {
                    spec_suxx = 0;
                }
            }
            var total = (suxx + Number(mod) + (spec_suxx * 2));
            new_mess += "```css\nRolled: " + total + " suxx\n```";
        }

        receivedMessage.channel.send(new_mess);
    }
    
})

// Logs into the server using the secret token
bot_secret_token = config.token;
client.login(bot_secret_token)