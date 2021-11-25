const { Client, MessageEmbed, Message, MessageAttachment, Role, RoleManager } = require("discord.js");
prefix = require("../json/prefix.json");

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
      if (configuration.requiredRoles.includes(messages[0])) {
        findRole = true;
        break;
      }
    }
    if (!findRole) return;
  }
  if (!(!configuration.whitelistEnabled || configuration.whitelist.includes(msg.author.id))) return;
  if (!(!configuration.blacklistEnabled || !configuration.blacklist.includes(msg.author.id))) return;
  executeCommand(msg, allCommandInformations[1]);
}
async function executeCommand(msg, commandArguments) {
  if (commandArguments.length == 0) return;

  if (isNaN(commandArguments[0])) return;

  let nbOfMessage = commandArguments[0];

  if (nbOfMessage >= 100) {
    msg.reply("Vous ne pouvez pas supprimer plus de 100 messages à la fois");
  }

  if (commandArguments.length == 1) {
    clearMessages(nbOfMessage, msg);
  }

  let userId = "";

  if (commandArguments.length == 2) {
    userId = commandArguments[1].replace("<@!", "").replace('>', "")
    clearMessagesByName(userId, nbOfMessage, msg)
  }
}




async function clearMessages(nbMessage, msg) {
  nbMessage++;
  await msg.channel.messages.fetch({ limit: nbMessage }).then(messages => {
    try { msg.channel.bulkDelete(messages) } catch (error) { }
  });
}

async function clearMessagesByName(userId, nbMessage, msg) {
  msg.reply("Déso bébé, la commande n'est pas entièrement dev, faudra attendre https://tenor.com/view/dog-doggo-window-goofy-silly-gif-17699758")
  // msg.channel.messages.fetch({
  //   limit: 5// Change `100` to however many messages you want to fetch
  // }).then((messages) => {
  //   const botMessages = [];
  //   messages.filter(m => m.author.id === userId).forEach(msg => botMessages.push(msg))
  //   let userMessage = []; 
  //   console.log(botMessages.length);
  //   if(botMessages.length > nbMessage){
  //     for(let i = 0; i <= nbMessage; i++){
  //       userMessage.push(botMessages[i]);
  //     }
  //   }else{
  //     userMessage = botMessages;
  //   }

  //   console.log(userMessage.length)
  //   // msg.channel.bulkDelete(userMessage).then(() => {
  //   //   msg.channel.send(`${nbMessage} message(s) supprimé(s)`).then(msg => msg.delete({
  //   //     timeout: 3000
  //   //   }))
  //   // });
  // })
}


module.exports = { onCommand }