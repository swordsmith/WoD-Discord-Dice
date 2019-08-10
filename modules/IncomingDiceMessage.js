/* IncomingDiceMessage.js
 * Author: Michael Bossner
 */

module.exports = class IncomingDiceMessage {
    constructor(message, diffChar) {        
        var arg = message;
        this.diffChar = diffChar;
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
        if (arg.includes(this.diffChar)){
            this.diffMess = true;
            let difSwap = false;
            let modSwap = false;
            let count = 0;
            for (let i = 0; i < arg.length; i++) { // Start Parse
                if (!difSwap && !modSwap) { // Dice side
                    if(!count && arg[i] == ' ') {
                        continue;
                    } else if (arg[i] == this.diffChar) { // We hit the @             
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
                    } else if (arg[i] == "s") {
                        if (!count || (arg[i+1] != ' ' && arg.length != (i+1))) {
                            // must have at least 1 diff and be the end.
                            return;
                        } else {
                            this.spec = true;
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
                    if(!count && arg[i] == ' ') {
                        continue;
                    } else if (arg[i] == 'd') {
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