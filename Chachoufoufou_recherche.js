const { Client, MessageEmbed, Message, MessageAttachment, } = require("discord.js"); 
const prefix = require("./json/prefix.json");
function Chachoufoufou_recherche(msg){
   if(msg.content.includes('Clachoufoufou') && msg.content.includes("recherche")){
       let msgWithoutCommand = msg.content.replace("Clachoufoufou ", "").replace("recherche ", "");   
       let linkMessage = msgWithoutCommand.replace(/ /g, "+");
       let searchLink = "https://letmegooglethat.com/?q="+linkMessage; 
       msg.reply("Voici le résultat de ta recherche " + searchLink)
   }
}

module.exports = { Chachoufoufou_recherche };
  