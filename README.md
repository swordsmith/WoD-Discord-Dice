WoD-Discord-Dice
A dice rolling discord bot for the World of Darkness v20 game.

Commands
"/d " - is the command to roll the dice

"dice@difficulty+willpower(spec) reason" :
    dice       = the amount of dice that are to be rolled. Must be greater than 
                 0 and less than 30
    difficulty = the difficulty of the roll. The number the dice needs to be 
	         equal to or greater than to succeed. must be between 1 and 10
    willpower  = (optional) the amount of willpower to be added to the roll. 
                 willpower is counted as automatic successes. if applied must 
                 be between 0 and 30
    (spec)     = (optional) If a player has a specialty applied for the roll 
                 added as the character "s". Any dice that faces the 
                 number 10 will be counted as 2 successes
    reason     = The reason the roll is being made. Must be included.

Example rolls
    "/d 3@6+2s reason"
    "/d 5@8+1 reason"
    "/d 1@10+s reason"
    "/d 4@9 reason"

"/i " - is the command to roll for initiative

"/i (wits+dexterity)"
    wits      = Number of dots you have in wits
    dexterity = Number of dots you have in dexterity

    note: Only the total should be entered so do not enter 4+3 but instead just enter 7

Example rolls
   "/i 7"
   "/i 3"
   "/i 12"