/* Initiative.js
 * Author: Michael Bossner
 */

const Dice = require("./Dice.js");

/*
 * Sends a message to the same channel that the original message was received.
 *
 * recvMess: Message that was received to prompt a return message
 * message: message to be sent to the user
 */
function send_message(recvMess, message) {
    recvMess.channel.send(message);
}

// Explains how to use the bot
function usage(recvMess) {
    recvMess.channel.send(recvMess.author + 
        " Bot Usage: `/i (dex+wits)`\nExample: `/i 7`");
}

/*
 * It takes an initiative message and rolls one 10 sided dice. The result will
 * be added to the number received by the bot send the total back to the player
 *
 * recvMess: message received by the player must be a positive int between 0
 *            and 30
 */
module.exports = class initiative {
    constructor(recvMess) {
        let input = recvMess.content.substring(3);
        let dice;
        let message;

        if (!this.parse_init(input)) {
            usage(recvMess);
            return;
        }

        dice = Dice.roll_dice();
        message = this.construct_mess(dice, input, recvMess.author);
        send_message(recvMess, message);
    }

    /*
     * Takes an input and if the input is valid returns true
     *
     * input: the message to be parsed
     * return: Returns true if the input is a valid int between 0 and 100
     */
    parse_init(input) {
        let args = input.split(" ");
        if (args.length < 1) {
            return false;
        } else if (isNaN(args[0])) {
            return false;
        } else if (args[0] > 100) {
            return false;
        } else {
            return true;
        }
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
    construct_mess(dice, input, author) {
        let args = input.split(" ");
        let reason = "";
        let msg;
        
        for (let i = 1; i < args.length; i++) {
            reason += (args[i] + " ");
        }

        if (args.length > 1) {
            msg = (author + " Rolling for initiative || " + reason +
            "\n[" + dice + "] + " + args[0] + "\n```css\nTotal: " + 
            (dice + Number(args[0])) + "\n```");
        } else {
            msg = (author + " Rolling for initiative" +
            "\n[" + dice + "] + " + args[0] + "\n```css\nTotal: " + 
            (dice + Number(args[0])) + "\n```");
        }
        return msg;
    }
}