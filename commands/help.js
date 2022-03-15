const {
  Client,
  MessageEmbed,
  Message,
  MessageAttachment,
  Role,
  RoleManager,
} = require("discord.js");
const fs = require("fs");
const fsSync = require("fs")
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

function executeCommand(msg) {
  let configFolder = "./config/"
  let configFile = [];
  let commands = []
  fs.readdirSync(configFolder).forEach(file => {
    configFile.push(file);
  });
  for (file of configFile) {
    delete require.cache[require.resolve(`../config/${file}`)];
    let data = require(`../${configFolder}${file}`);
    if (data.module == true) {
          if (!(data.requireRoles) || msg.member.roles.cache.some((r) => data.requiredRoles.includes(r.id))) {
            if (!(data.whitelistEnabled) || data.whitelist.includes(msg.author.id)) {
              if (!(data.blacklistEnabled) || !data.blacklist.includes(msg.author.id)) {
                delete require.cache[require.resolve('../json/commands.json')]
                const commandsFile = require("../json/commands.json");
                let tempCommandInformation = commandsFile.find(command => { return command.name === file.replace(".json", "") });
                commands.push(tempCommandInformation);
              }
            }
          }
     
    }
  }

  const helpEmbed = new MessageEmbed();
  // Set the title of the field
  helpEmbed.setTitle(`Commandes du Bot`);

  helpEmbed.setThumbnail("https://i.ibb.co/njxVf93/Clachoufoufou.webp");
  for (command of commands) {
    let nameWithText = "";
    if (command.nameWithText != "none") {
      nameWithText = " " + command.nameWithText;
    }
    if (command.prefix == true) {
      var name = prefix.prefix + command.name + nameWithText;
    } else {
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

module.exports = { onCommand };
