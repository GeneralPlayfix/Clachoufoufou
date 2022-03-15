const { Client, MessageEmbed, Message, MessageAttachment, Role, RoleManager } = require("discord.js");
prefix = require("../json/prefix.json");
// const malScraper = require("mal-scraper");
const axios = require('axios');

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
  //https://api.mangadex.org/manga?title=Overlord
  let formatedArgument = commandArguments.toString().replace(/,/g, "+");

  let formatedUrl = `https://api.mangadex.org/manga?title=${formatedArgument}&limit=1`
  let mangaState = true;
  let manga = [];
  await axios.get(formatedUrl)
    .then(response => {
      //variable
      let id, title, description, status, originalLanguage, type, publicationDemographic, coverId;
      let tags = [];
      //je check si l'api a bien renvoyé une réponse positive
      if (!(response.status == 200)) { msg.reply("l'api n'a pas fonctionnée "); return; }
      //je check si y a un résultat
      if (response.data.total == 0) { mangaState = false; return; };
      let attributes = response.data.data[0].attributes;
      id = response.data.data[0].id;

      if (attributes.title.hasOwnProperty("en")) {
        title = attributes.title.en;
      }
      if (attributes.description.hasOwnProperty("fr")) {
        description = attributes.description.fr
      } else if (attributes.description.hasOwnProperty("en")) {
        description = attributes.description.en
      }
      if (response.data.data[0].hasOwnProperty("type")) {
        type = response.data.data[0].type
      }
      if (attributes.hasOwnProperty("publicationDemographic")) {
        publicationDemographic = attributes.publicationDemographic;
      }
      for (tag of attributes.tags) {
        tags.push(tag.attributes.name.en)
      }
      for (relation of response.data.data[0].relationships) {
        if (relation.type == "cover_art") {
          coverId = relation.id;
        }
      }
      status = attributes.status;
      originalLanguage = attributes.originalLanguage;
      manga.push({
        id: id,
        title: title,
        description: description,
        tags: tags,
        originalLanguage: originalLanguage,
        status: status,
        type: type,
        publicationDemographic,
        cover: coverId
      })
    })
    .catch(error => {
      console.log(error);
    });
  if (mangaState == true) {

    let formatedUrl = `https://api.mangadex.org/cover/${manga[0].cover}`
    let imgCode;
    await axios.get(formatedUrl)
      .then(response => {
        imgCode = response.data.data.attributes.fileName;
      });
    if (imgCode == undefined) reply("Erreur : cover introuvable");
    let imgLink = `https://uploads.mangadex.org/covers/${manga[0].id}/${imgCode}`
    manga[0].cover = imgLink;
    const mangaEmbed = new MessageEmbed();
    mangaEmbed.setColor('#0099ff');
    mangaEmbed.setTitle(`${manga[0].title}`);
    if (manga[0].cover != "") {
      mangaEmbed.setThumbnail(`${manga[0].cover}`);
    }
    if (manga[0].description != "") {
      mangaEmbed.addField('Synopsis : ', `${manga[0].description}`);
    }
    mangaEmbed.addField('\u200B', '\u200B');
    if (manga[0].status != "") {
      mangaEmbed.addField('📢 Statut : ', `${manga[0].status}`, true);
    }
    if (manga[0].type != "") {
      mangaEmbed.addField('🏷 Type :', `${manga[0].type}`, true)
    }

    if (manga[0].tags.length != 0) {
      mangaEmbed.addField('📒 Genres :', `${manga[0].tags.join(',')}`)
    }
    if (manga[0].publicationDemographic != "") {
      mangaEmbed.addField('🧧 Démographie :', `${manga[0].publicationDemographic}`, true)
    }
    if (manga[0].originalLanguage != "") {
      mangaEmbed.addField('🏳 Langue d\'origine :', `${manga[0].originalLanguage}`, true)
    }
    //.setDescription(`Synopsis : \n ${manga[0].description}`);
    msg.channel.send(mangaEmbed);
  } else {
    msg.reply("Manga non trouvé")
  }
  // var cron = require("node-cron");/

  // async function getAnime(msg) {
  //   if (msg.content.includes(`${prefix.prefix}anime `)) {
  //     const waitEmbed = new MessageEmbed();
  //     waitEmbed.setTitle("Chargement...");
  //     waitEmbed.setImage("https://www.gif-maniac.com/gifs/54/54389.gif");
  //     var waitMsg = await msg.channel.send(waitEmbed);
  //     // console.log(waitMsg);

  //     let messageWithoutCommand = msg.content;
  //     messageWithoutCommand = messageWithoutCommand.substr(7);

  //     malScraper
  //       .getInfoFromName(messageWithoutCommand, true)
  //       .then((data) => {
  //         // console.log(data.title);
  //         // console.log(data.synopsis);
  //         // console.log(data.picture);
  //         // console.log(data.episodes);
  //         // console.log(data.genres);
  //         // console.log(data.episodes);
  //         // console.log(data.score);
  //         // console.log(data.popularity);
  //           const MALembed = new MessageEmbed();
  //           // Set the title of the field
  //           if(data.title != ""){
  //             MALembed.setTitle(data.title);
  //           }

  //           if(data.picture != ""){
  //             MALembed.setThumbnail(data.picture);
  //           }
  //           if(data.synopsis != ""){
  //             MALembed.setDescription(`Synopsis : \n ${data.synopsis}`);
  //           }
  //           if(data.episodes != ""){
  //             MALembed.addFields({
  //               name: "Nombre d'épisodes",
  //               value: data.episodes,
  //               inline: false,
  //             });
  //           }

  //             if(data.genres.toString != ""){
  //               MALembed.addFields({
  //                 name: "Genres : ",
  //                 value: data.genres.toString(),
  //                 inline: false,
  //               });

  //             }
  //           // Set the color of the embed
  //           MALembed.setColor("8a2be2");
  //           // Set the main content of the embed

  //           //.setImage(``);
  //           // console.log(rand);
  //             msg.channel.send(MALembed);
  //           waitMsg.delete();
  //       })
  //       .catch((err) =>{
  //         console.log(err)
  //         msg.channel.send("Pas de résultat !")
  //         waitMsg.delete();

  //       } 

  //       );
  //   }
  // }
}
module.exports = { onCommand }