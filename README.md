WoD-Discord-Dice
A dice rolling discord bot for the World of Darkness v20 game.

----------------------------------------------------------------
                Important Requires
This bot requires:
   "discord.js" modual
   "nodejs"
   a json file named "config.json" in the same directory as the bot.

config.json
	"token": "Bots Discord token",
	"reqDiffReason": true,
	"reqRollReason": false,
	"failEmote": ":skull_crossbones:",
	"specEmote": ":trophy:"

token = the discord bot token
reqDiffReason = will make any difficulty rolls require the reason to be 
	provided or an error will be sent
reqRollReason = will make any non difficulty rolls require the reason to 
	be provided or an error will be sent
failEmote = the emote that will be displayed whenever a 1 appears on a 
	difficulty roll
specEmote = the emote that will be displayed whenever a 10 appears on a 
	difficulty roll	with spec flagged.
-----------------------------------------------------------------

Commands
"/d " - is the command to roll the dice

"dice@difficulty+willpower(spec) 'reason'" :
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
    reason     = (optional) The reason the roll is being made. Must be included.

Example rolls
    "/d 3@6+2s reason"
    "/d 5@8+1 reason"
    "/d 1@10+s reason"
    "/d 4@9"
=====================================

"dice 'reason'": will role a number of 10 sided dice
    dice = number of 10 sided dice to roll
    reason = (optional) reason for the roll

Example rolls
    "/d 5 reason"
    "/d 7"
=====================================
"'dice'd'sides' 'reason'" : will role a number of x sided dice
    dice = number of x sided dice to roll
    sides = number of sides on each dice being rolled
    reson = (optional) reason for the roll

Example rolls
    "/d 5d5 reason"
    "/d 1d10"

----------------------------------------------------------------------------------------

"/i " - is the command to roll for initiative

"/i (wits+dexterity)"
    wits      = Number of dots you have in wits
    dexterity = Number of dots you have in dexterity

    note: Only the total should be entered so do not enter 4+3 but instead just enter 7

Example rolls
   "/i 7"
   "/i 3"
   "/i 12"

----------------------------------------------------------------------------------------