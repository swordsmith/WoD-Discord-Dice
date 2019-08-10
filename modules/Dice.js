/* Dice.js
 * Author: Michael Bossner
 */

/*
 * Rolls an n sided dice and returns the number
 *
 * sides: number of sides the dice contains. Default is 10.
 *
 * return: returns an int 1<=int<=10
 */
 exports.roll_dice = (sides=10) => {
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
exports.roll_many = (dice, sides=10) => {
    let dicePool = [];
    for (let i = 0; i < dice; i++) {
        dicePool.push(exports.roll_dice(sides));
    }
    return dicePool;
}

exports.dice_toString = (dicePool) => {
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