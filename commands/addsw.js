const { Client, MessageEmbed, Message, MessageAttachment, Role, RoleManager} = require("discord.js"); 
  prefix = require("../json/prefix.json");

function onCommand(msg, allCommandInformations){
    var path = require('path');
    var scriptName = path.basename(__filename).replace(".js","");
    let confFile =  path.basename(__filename).replace(".js", "") + ".json";
    let configuration = require (`../config/${confFile}`);
    if(scriptName != allCommandInformations[0]) return;
    if(!(configuration.requireRoles == false || msg.member.roles.cache.some(r=>configuration.requiredRoles.includes(r.id)))) return;
    if(!(configuration.whitelistEnabled == false || configuration.whitelist.includes(msg.author.id))) return;
    if(!(configuration.blacklistEnabled== false || !(configuration.blacklist.includes(msg.author.id)))) return;
    executeCommand(msg, allCommandInformations[1]); 
}
function executeCommand(msg, commandArguments){
  
}

module.exports = {onCommand}