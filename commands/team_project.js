const { Client, MessageEmbed, Message, MessageAttachment, Role, RoleManager } = require("discord.js");
prefix = require("../json/prefix.json");
const reactEmoji = ["⏪", "⏩"]

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

async function executeCommand(msg, commandArguments) {
  delete require.cache[require.resolve(`../utils/carousel_function.js`)]
  let carousel_function = require("../utils/carousel_function.js");
  let allProjects = await carousel_function.getSortedProject();

  let roleId;
  let project;

  if (commandArguments.length != 0) {
    roleId = commandArguments[0].replace("<@&", "").replace(">", "")
    if (isNaN(roleId)) {
      // project = allProjects[~~(Math.random() * allProjects.length)];    
      return msg.reply("Le role n'est pas valide")
    } else {
      let projectId = await carousel_function.getProjectById(roleId)
      project = allProjects[projectId]
    }
  } else {
    project = allProjects[~~(Math.random() * allProjects.length)];
  }
  let randomImage = getRandomImage(project);
  const embed = new MessageEmbed();
  embed.setTitle(`${project.name}`);
  embed.setColor("3996CE");
  embed.setDescription(project.synopsis);
  embed.setFooter(`Made by GeneralPlayfix`);
  embed.setImage(`${randomImage}`);
  msg.channel.send(embed).then(async msg => {
    await msg.react("⏪")
    await msg.react("⏩")
  })
}

function getRandomImage(project) {
  delete require.cache[require.resolve(`../json/images.json`)]
  const jsonOfImages = require("../json/images.json");
  let indexJson = 0;
  for (let i = 0; i < jsonOfImages.length; i++) {
    if (jsonOfImages[i].name.toLowerCase() == project.imageFolder.toLowerCase()) {
      indexJson = i;
      break;
    }
  }
  let arrayOfImages = jsonOfImages[indexJson].images.split(' ');
  return arrayOfImages[~~(Math.random() * arrayOfImages.length)];
}

async function getNextProject(projectIndex, add) {
  delete require.cache[require.resolve(`../utils/carousel_function.js`)]
  let carousel_function = require("../utils/carousel_function.js");

  let allProjects = await carousel_function.getSortedProject();
  let id = -1;
  if (add == true) {
    if (projectIndex == allProjects.length - 1) {
      id = 0;
    } else {
      id = projectIndex + 1;
    }
  } else {
    if (projectIndex == 0) {
      id = allProjects.length - 1;
    } else {
      id = projectIndex - 1;
    }
  }
  return allProjects[id]
}


async function changeProject(reaction, emoji) {
  delete require.cache[require.resolve(`../utils/carousel_function.js`)]
  let carousel_function = require("../utils/carousel_function.js");

  formerEmbed = reaction.message.reactions.message.embeds[0];
  let footerText = formerEmbed.footer.text
  let description = formerEmbed.description;
  let title = formerEmbed.title;
  let formerProjectId = await carousel_function.getProjectId(title)
  let add = false;
  switch (emoji) {
    case "⏩":
      add = true;
      break;
    case "⏪":
      add = false;
      break;
  }
  let newProject = await getNextProject(formerProjectId, add);
  let imagesJson = await carousel_function.getImageLink(newProject.imageFolder);
  let imagesArray = imagesJson.images.split(" ")
  let randomImage = imagesArray[~~(Math.random() * imagesArray.length)]
  const embed2 = new MessageEmbed()
    .setTitle(`${newProject.name}`)
    .setColor(formerEmbed.color)
    .setDescription(newProject.synopsis)
    .setFooter(footerText)
    .setImage(randomImage)
  reaction.message.edit(embed2)
}
module.exports = { onCommand, changeProject }