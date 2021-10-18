const {
  Client,
  MessageEmbed,
  Message,
  MessageAttachment,
  } = require("discord.js");
  // var cron = require("node-cron");/
const prefix = require("../json/prefix.json");
function generateHelpEmbed(msg, commands) {
  if (msg.content == `${prefix.prefix}help`) {
    const helpEmbed = new MessageEmbed();
    // Set the title of the field
    helpEmbed.setTitle(`Commandes du Bot`);

    helpEmbed.setThumbnail("https://i.ibb.co/njxVf93/Clachoufoufou.webp");
    for (command of commands) {
      let nameWithText = "";
      if (command.nameWithText != "none") {
        nameWithText = " " + command.nameWithText;
      }
      if(command.prefix == true){
        var name = prefix.prefix + command.name + nameWithText;
      }else{
        var name = command.name + nameWithText;
      }
      helpEmbed.addFields({
        name: name,
        value: command.description,
        inline: false,
      });
    }
    // Set the color of the embed
    helpEmbed.setColor("8a2be2");
    // Set the main content of the embed
    helpEmbed.setDescription(``);

    //.setImage(``);
    // console.log(rand);
    msg.channel.send(helpEmbed).catch((e) => console.log(e));
  }
}
function onCommand(msg, allCommandInformations){
  var path = require('path');
  var scriptName = path.basename(__filename).replace(".js","");
  if(scriptName == allCommandInformations[0]){
      console.log("C'est moi");
  }
}
module.exports = { generateHelpEmbed, onCommand };
