const { Client, MessageEmbed, Message, MessageAttachment, Role, RoleManager } = require("discord.js");
prefix = require("../json/prefix.json");
const fs = require("fs");
const { title } = require("process");

function onCommand(msg, allCommandInformations) {
  var path = require("path");
  var scriptName = path.basename(__filename).replace(".js", "");
  let confFile = path.basename(__filename).replace(".js", "") + ".json";
  delete require.cache[require.resolve(`../config/${confFile}`)]
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


async function multiStepOrderGenerator(message, thumbnail, msg, filter) {
  let embed = new MessageEmbed();
  embed.setColor('#0099ff');
  embed.setImage(thumbnail)
  embed.setTitle(message);
  let msgtoSupp = await msg.channel.send(embed)
  let getMessage = await msg.channel.awaitMessages(filter, { max: 1, time: 60000 });
  let messageContent = getMessage.first();
  let isOk = true;
  if (messageContent == undefined) {
    let newEmbed = new MessageEmbed();
    newEmbed.setColor('#0099ff');
    newEmbed.setTitle("Temps écoulé, dommage");
    newEmbed.setImage("https://media.giphy.com/media/Qyt7QGmJ68EpsEHaLu/giphy.gif")
    let undefined = await msg.channel.send(newEmbed)
    isOk = false;
    setTimeout(function(){
      undefined.delete();
  },10000); 
  }
  let giveup = "ANNULER";
  if (isOk && messageContent.content.toUpperCase() == giveup) {
    let AnnulationEmbed = new MessageEmbed();
    AnnulationEmbed.setColor('#0099ff');
    AnnulationEmbed.setTitle("Annulation effectuée");
    AnnulationEmbed.setImage("https://media.giphy.com/media/bC2UBFPjAgyv3zoMoC/giphy.gif")
    let annulation = await msg.channel.send(AnnulationEmbed)
    isOk = false;
    setTimeout(function () {
      annulation.delete();
    }, 10000);
  }
  await msgtoSupp.delete()
  await messageContent.delete();
  return {
    isOK: isOk,
    message: messageContent
  }
}

async function executeCommand(msg, commandArguments) {
  const filter = (m) => m.author.id === msg.author.id;
  await msg.delete();

  let title = await multiStepOrderGenerator("Copie colle le nom japanread exact du manga que tu veux ajouter (dans une minute, le message sera supprimé) !", "https://c.tenor.com/iF7Xi18vGxUAAAAC/knocked-up-we-need-a-name.gif", msg, filter);
  if (!title.isOK) return;
  title = title.message.content;

  let img = await multiStepOrderGenerator("Copie colle le lien de l'image du manga (pas celle de japanread car elle ne fonctionnera pas), le message se supprimera dans une minute", "https://c.tenor.com/6AqT16xotmsAAAAd/photographer-camera.gif", msg, filter);
  if (!img.isOK) return;
  if (!(img.message.content.startsWith("http") && img.message.content.endsWith(".png") || img.message.content.endsWith(".jpg"))) {
    let embed = new MessageEmbed()
    embed.setTitle("Lien de l'image invalide, méchant 😡")
    embed.setImage("https://media.giphy.com/media/JT7Td5xRqkvHQvTdEu/giphy.gif")
    embed.setColor("#FF0000");
    let troll = await msg.channel.send(embed);
    setTimeout(function () {
      troll.delete();
    }, 60000);
    return;
  }

  img = img.message.content;

  let role = await multiStepOrderGenerator("Ping le role du manga que tu veux ajouter ex : @ojousama no shimobe (le message va se supprimer dans une minute)", "https://c.tenor.com/4joxsCs4VZ8AAAAC/make-a-choice-jigsaw.gif", msg, filter);
  if(!role.isOK) return;
  let roleId = role.message.content.replace("<@&", "").replace(">", "");
  if(isNaN(roleId)) return msg.reply("Le role n'est pas valide");
  let roleName = msg.guild.roles.cache.find(r => r.id === roleId);


  console.log(title)
  console.log(img)
  console.log(roleName.name)
  

  // const tempEmbed = new MessageEmbed();
  // tempEmbed.setTitle("Le manga que vous voulez ajouter : ");
  // tempEmbed.setColor('#0099ff');
  // tempEmbed.setImage(img);
  // tempEmbed.addField('Nom : ', `${title}`);
  // tempEmbed.addField('Role : ', `${roleName}`);
  // msg.channel.send(tempEmbed)

  let mangaPath = "./json/img.json";
  delete require.cache[require.resolve(`../commands/module.js`)]
  let moduleFile = require(`../commands/module.js`)
  moduleFile.jsonReader(`${mangaPath}`, (err, data) => {
    if(err){
      console.log(err)
    }else{
      let mangaName = roleName.name;
      let isNotExist = true;
      for(let manga of data){
        if(manga.role.toUpperCase() == mangaName.toUpperCase()){
          isNotExist = false;
          break;
        }
      }
      if(!isNotExist) return msg.reply("Le manga a déjà été ajouté");
      data.push({
        name: title,
        img: img,
        role: roleName.name
      })
      fs.writeFile(`${mangaPath}`, JSON.stringify(data, null, 2), err =>{
        if(err){
          console.log(err)
        }
      })
    }
  });
}




module.exports = { onCommand }