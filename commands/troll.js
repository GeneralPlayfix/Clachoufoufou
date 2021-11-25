const { Client, MessageEmbed, Message, MessageAttachment, Role, RoleManager} = require("discord.js"); 
  prefix = require("../json/prefix.json");
const gifArray = ['https://tenor.com/view/cat-cat-stare-cat-staring-staring-cat-daladada-gif-23650468','https://tenor.com/view/dog-husky-cute-sleepy-gif-14570909','https://tenor.com/view/dog-doggo-window-goofy-silly-gif-17699758','https://tenor.com/view/glare-dog-mad-animal-husky-gif-17818725','https://tenor.com/view/disappointment-dog-really-omg-pup-gif-17650756','https://tenor.com/view/smile-doggy-dog-smile-pet-happy-gif-17804041','https://tenor.com/view/pogled-pas-hm-zloban-gif-19623936','https://tenor.com/view/awkward-shocked-shookt-omg-dog-gif-17246548','https://tenor.com/view/scared-dog-speechless-omg-what-did-i-just-witness-mind-blown-gif-16367858','https://tenor.com/view/what-huh-dumbfounded-shocked-no-way-gif-14029475','https://tenor.com/view/cat-gato-shock-cat-shock-trans-gif-15271457','https://tenor.com/view/smiling-cat-creepy-cat-cat-zoom-kitty-gif-12199043','https://tenor.com/view/dog-agree-yes-uh-huh-gif-13653977','https://tenor.com/view/farted-blushing-dog-cute-doge-gif-5971288','flemme','chui fatigué','méchant']
function onCommand(msg, allCommandInformations) {
  var path = require("path");
  var scriptName = path.basename(__filename).replace(".js", "");
  let confFile = path.basename(__filename).replace(".js", "") + ".json";
  delete require.cache[require.resolve(`../config/${confFile}`)];
  let configuration = require(`../config/${confFile}`);
  if (scriptName != allCommandInformations[0]) return;
  if (!configuration.module) return;
  if (configuration.requireRoles) {
    let findRole = false;
    for (let messages of msg.member.roles.cache) {
      if (configuration.requiredRoles.includes(messages[0])){
        findRole = true;
        break;
      }
    }
    if (!findRole) return;
  }
  if (!(!configuration.whitelistEnabled || configuration.whitelist.includes(msg.author.id))) return;
  if (!(!configuration.blacklistEnabled || !configuration.blacklist.includes(msg.author.id))) return;
  executeCommand(msg); 
}
function executeCommand(msg){
  troll = getTrollGif();
  if(troll == "méchant"){
    troll = troll +"\n"+ getTrollGif();
  }  
  msg.channel.send(troll);
}

function getTrollGif(){
  var troll = gifArray[Math.floor(Math.random()*gifArray.length)];
  return troll;
}
module.exports = {onCommand}