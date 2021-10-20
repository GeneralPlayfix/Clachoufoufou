const {
  Client,
  MessageEmbed,
  Message,
  MessageAttachment,
  Role,
  RoleManager,
} = require("discord.js");
const fs = require("fs");
prefix = require("../json/prefix.json");

function onCommand(msg, allCommandInformations) {
  var path = require("path");
  var scriptName = path.basename(__filename).replace(".js", "");
  let confFile = path.basename(__filename).replace(".js", "") + ".json";
  let configuration = require(`../config/${confFile}`);
  if (scriptName != allCommandInformations[0]) return;
  if (
    !(
      configuration.requireRoles == true ||
      msg.member.roles.cache.some((r) =>
        configuration.requiredRoles.includes(r.id)
      )
    )
  )
    return;
  if (
    !(
      configuration.whitelistEnabled == false ||
      configuration.whitelist.includes(msg.author.id)
    )
  )
    return;
  if (
    !(
      configuration.blacklistEnabled == false ||
      !configuration.blacklist.includes(msg.author.id)
    )
  )
    return;
  executeCommand(msg);
}

function executeCommand(msg) {
let configFolder = "./config/"
let configFile = [];
let commands = []  
fs.readdirSync(configFolder).forEach((file) => {
  configFile.push(file);
});
for(file of configFile){
  console.log(file)
  fs.readFile("./config/addsw.json", 'utf-8', (err, jsonString)=>{
    if(err){
      console.log(err);
    }else{
    const data = JSON.parse(jsonString)
    if (!(data.requireRoles == true || msg.member.roles.cache.some((r) =>data.requiredRoles.includes(r.id)))) return;
    if (!(data.whitelistEnabled == false || data.whitelist.includes(msg.author.id))) return;
    if (!(data.blacklistEnabled == false || !data.blacklist.includes(msg.author.id))) return;
    delete require.cache[require.resolve('../json/commands.json')]
    const commandsFile = require("../json/commands.json");       
    // for(test of commandsFile){
      
    // }
  }
  })
} 


  // const helpEmbed = new MessageEmbed();
  // Set the title of the field
  // helpEmbed.setTitle(`Commandes du Bot`);

  // helpEmbed.setThumbnail("https://i.ibb.co/njxVf93/Clachoufoufou.webp");
  // for (command of commands) {
  //   let nameWithText = "";
  //   if (command.nameWithText != "none") {
  //     nameWithText = " " + command.nameWithText;
  //   }
  //   if (command.prefix == true) {
  //     var name = prefix.prefix + command.name + nameWithText;
  //   } else {
  //     var name = command.name + nameWithText;
  //   }
  //   helpEmbed.addFields({
  //     name: name,
  //     value: command.description,
  //     inline: false,
  //   });
  // }
  // // Set the color of the embed
  // helpEmbed.setColor("8a2be2");
  // // Set the main content of the embed
  // helpEmbed.setDescription(``);

  // //.setImage(``);
  // // console.log(rand);
  // msg.channel.send(helpEmbed).catch((e) => console.log(e));
}

module.exports = { onCommand };
