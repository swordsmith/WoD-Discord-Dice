/* DiffRoll.js
 * Author: Michael Bossner
 */

const Dice = require("./Dice.js");

module.exports = class DiffRoll {
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
        this.dicePool = Dice.roll_many(this.diceMsg.dice);
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
    result(setting) {
        let msg = "["
        for (let i = 0; i < this.dicePool.length; i++) {
            switch (this.dicePool[i]) {
                case 1:
                    msg += setting.find("failEmote");
                    break;
                case 10:
                    if (this.diceMsg.spec) {
                        msg += setting.find("specEmote");
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