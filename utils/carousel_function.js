  
const { ReactionUserManager,MessageEmbed,  } = require("discord.js");
const reactEmoji = ["◀️", "▶️", "⏪", "⏩"]
const botId = "856535282849021963";

async function getImageLink(folderName) {
  delete require.cache[require.resolve(`../json/images.json`)]
  const jsonOfImages = require("../json/images.json");
  let indexJson = 0;
  for (let i = 0; i < jsonOfImages.length; i++) {
    if (jsonOfImages[i].name.toLowerCase() == folderName.toLowerCase()) {
      indexJson = i;
      break;
    }
  }
  return jsonOfImages[indexJson];
}

async function getMangaFromJson(title) {
  const jsonOfMangas = await getSortedProject();
  for (let i = 0; i < jsonOfMangas.length; i++) {
    if (jsonOfMangas[i].name.toLowerCase() == title.toLowerCase()) {
      indexJson = i;
      break;
    }
  }
  return jsonOfMangas[indexJson]
}

async function getProjectById(id) {
  const jsonOfMangas = await getSortedProject();
  for (let i = 0; i < jsonOfMangas.length; i++) {
    if (jsonOfMangas[i].roleId.toLowerCase() == id.toLowerCase()) {
      indexJson = i;
      break;
    }
  }
  return indexJson;
}


async function getProjectId(title) {
  const jsonOfMangas = await getSortedProject();
  for (let i = 0; i < jsonOfMangas.length; i++) {
    if (jsonOfMangas[i].name.toLowerCase() == title.toLowerCase()) {
      indexJson = i;
      break;
    }
  }
  return indexJson;
}

async function getSortedProject(){
  delete require.cache[require.resolve(`../json/manga.json`)]
  const data = require("../json/manga.json");
  return data.sort(function (a, b) {
    return a.name.localeCompare(b.name);
  });
}

function messageVerification(reaction, user) {
  delete require.cache[require.resolve(`../commands/team_project.js`)]
  let teamProject = require("../commands/team_project.js");
  if (reaction.message.author.id != botId) return;
  if (user.id == botId) return;
  const emoji = reaction.emoji.name;
  if (!reactEmoji.includes(emoji)) return;
  switch (emoji) {
    case "◀️":
      messageReact(reaction, emoji)
      break;
    case "▶️":
      messageReact(reaction, emoji)
      break;
    case "⏪":
      teamProject.changeProject(reaction, emoji)
      break;
    case "⏩":
      teamProject.changeProject(reaction, emoji)
      break;
  }
}

async function messageReact(reaction, emoji) {

  delete require.cache[require.resolve(`../utils/carousel_function.js`)]
  const carousel_function = require("../utils/carousel_function.js");

  //je récupère l'embed

  formerEmbed = reaction.message.reactions.message.embeds[0];
  let footerText = formerEmbed.footer.text
  let description = formerEmbed.description;
  let formerImageUrl = formerEmbed.image.url;
  let title = formerEmbed.title;
  let mangaFromJson = await carousel_function.getMangaFromJson(title);
  let imagesJson = await carousel_function.getImageLink(mangaFromJson.imageFolder);
  let imagesArray = imagesJson.images.split(" ")
  let indexOfImageFolder = imagesArray.indexOf(formerImageUrl);
  switch (emoji) {
    case "◀️":
      if (indexOfImageFolder == 0) {
        index = imagesArray.length - 1;
      } else {
        index = parseInt(indexOfImageFolder) - 1;
      }
      break;
    case "▶️":
      if (indexOfImageFolder == imagesArray.length - 1) {
        index = 0;
      } else {
        index = parseInt(indexOfImageFolder) + 1;
      }
      break;
  }
  const embed2 = new MessageEmbed()
    .setTitle(`${title}`)
    .setColor(formerEmbed.color)
    .setDescription(description)
    .setFooter(footerText)
    .setImage(imagesArray[index])
  reaction.message.edit(embed2)
}

module.exports = { getImageLink, getMangaFromJson, getProjectId, getSortedProject, messageVerification, getProjectById }