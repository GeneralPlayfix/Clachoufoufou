const { Client, MessageEmbed, Message, MessageAttachment, Role, RoleManager } = require("discord.js");
prefix = require("../json/prefix.json");
const commandFolder = "./commands/"
const fs = require("fs");
const { config } = require("process");

function onCommand(msg, allCommandInformations) {
  var path = require("path");
  var scriptName = path.basename(__filename).replace(".js", "");
  let confFile = path.basename(__filename).replace(".js", "") + ".json";
  delete require.cache[require.resolve(`../config/${confFile}`)]
  let configuration = require(`../config/${confFile}`);
  if (scriptName != allCommandInformations[0]) return;
  if (!(configuration.module == true)) return;
  if (!(configuration.requireRoles == true || msg.member.roles.cache.some((r) => configuration.requiredRoles.includes(r.id)))) return;
  if (!(configuration.whitelistEnabled == false || configuration.whitelist.includes(msg.author.id))) return;
  if (!(configuration.blacklistEnabled == false || !configuration.blacklist.includes(msg.author.id))) return;
  executeCommand(msg, allCommandInformations[1]);
}
function executeCommand(msg, commandArguments) {
  if (commandArguments.length == 0) return;
  if (commandArguments.length == 1 && commandArguments.toString() == "list") {
    getAllModule(msg, commandArguments)
    return;
  }
  let moduleName = commandArguments['0']
  let boolModule = checkModuleName(moduleName);
  if (boolModule != true) {
    msg.reply("Nom de module invalide");
    return;
  }
  let command = commandArguments['1']
  if (command == undefined || command == "") {
    msg.reply("Action à exécuter invalide !")
    return;
  }
  switch (command) {
    case ("config"):
      subCommandConfig(moduleName, msg)
      break;
    case ("toggle"):
      subCommandActivity(moduleName, msg)
      break;
    default:
      msg.reply(`La sous commande "${command}" n'existe pas !`)
      return;
  }
}

function getAllModule(msg, commandArguments) {
  let listOfModule = "";
  fs.readdirSync(commandFolder).forEach((file) => {
    let fileWithoutExtension = file.replace(".js", "");
    let config = getConfig(fileWithoutExtension)
    let state = "";
    if (config.module == true) {
      state = "✅"
    } else {
      state = "❌"
    }
    if (listOfModule == "") {
      listOfModule += `${state} ${fileWithoutExtension}`;
    } else {
      listOfModule += `\n${state} ${fileWithoutExtension}`;
    }
  });
  const allModuleEmbed = new MessageEmbed();
  allModuleEmbed.setColor("#0099ff")
  allModuleEmbed.setTitle(`Tous les modules du bot`);
  allModuleEmbed.setDescription(listOfModule)
  msg.channel.send(allModuleEmbed).catch((e) => console.log(e));
}
function checkModuleName(moduleName) {
  if (moduleName == "") return false;
  if (moduleName == undefined) return false;
  let isFile;
  fs.readdirSync(commandFolder).forEach((file) => {
    let fileWithoutExtension = file.replace(".js", "");
    if (fileWithoutExtension.toLowerCase() == moduleName.toLowerCase()) {
      isFile = true;
      return;
    }
  });
  if (isFile == true) {
    return true;
  }
  return false;
}
function getConfig(name, msg){
  delete require.cache[require.resolve(`../config/${name}.json`)]
  let config = require(`../config/${name}.json`)
  return config;
}

function subCommandConfig(moduleName, msg){
  let config = getConfig(moduleName);
  const configEmbed = new MessageEmbed();
  configEmbed.setColor("#0099ff")
  configEmbed.setTitle(`Configuration du module : ${moduleName}`);
  let moduleConfiguration = "";      
  for(let param in config){
    let active;
    if(config[param] == true){
      active = "✅";
    }else if(config[param] == false){
      active = "❌";
    }else if(Array.isArray(config[param])){
      if(config[param.length] == 0){
        active = "Il n'y a rien ici";
      }else{
        active = config[param].toString();
      }
    }
    if(moduleConfiguration == ""){
        moduleConfiguration = `${param} : ${active}`;
    }else{
      moduleConfiguration +=  `\n${param} : ${active}`
    }
  }
  configEmbed.setDescription(`${moduleConfiguration}`)
  msg.channel.send(configEmbed).catch((e) => console.log(e));
}
function subCommandActivity(moduleName, msg){
  if(moduleName == "module"){
    msg.reply("Vous ne pouvez pas désactiver ce module");
    return;
  }
  let file = `./config/${moduleName}.json`;
  jsonReader(`${file}`, (err, data) => {
    if(err){
      console.log(err)
    }else{
        if(data.module == true){
          data.module = false;
        }else{
          data.module = true
        }
        fs.writeFile(`${file}`, JSON.stringify(data, null, 2), err =>{
          if(err){
            console.log(err)
          }
        })
        if(data.module == false) msg.reply(`Le module ${moduleName} à bien été désactivé !`);
        if(data.module == true) msg.reply(`Le module ${moduleName} à bien été activé !`);
    }
  })
}
function jsonReader(filePath, cb){
  fs.readFile(filePath, 'utf-8', (err, fileData) => {
    if(err){
      return cb && cb(err);
    }
    try{
      const object = JSON.parse(fileData);
      return cb && cb(null, object);
    }catch(err){
      return cb && cb(err);
    }
  })
}

module.exports = { onCommand }