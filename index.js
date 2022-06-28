const {
  Client,
  MessageEmbed,
  Message,
  MessageAttachment,
  WebhookClient
} = require("discord.js");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const fs = require("fs");
// var cron = require("node-cron");/
const axios = require('axios');
var FormData = require('form-data');
const CLACHOUFOUFOUIDMANGADEX = "ed6dc389-cc4a-49bd-a43d-dcb1416a4f93";
const client = new Client();
const configFolder = "./config/";

const commandsFolder = "./commands/";
const prefix = require("./json/prefix.json");
const token = require("./json/token.json");
let arrayOfSentences = require("./json/readingSentence.json");

fileGenerator();
main();

function main() {
  client.login(token.token);
  client.on("ready", () => {
    console.log(`${client.user.tag} is online!`);
    // setTimeout(japanreadScraper, 0);
    setTimeout(normalBotCommands, 0);
    setInterval(mangadexApiTest, 30 * 60 * 1000)
    // setTimeout(test, 150);
  });
}

async function mangadexApiTest(){
  let mangas = [];
  //=============== Récupération des x derniers mangas de la team (les sorties ne se base pas que sur celles de la team, il faut donc en prendre beaucoup)
  let getMangaOfTeam = `https://api.mangadex.org/manga?group=${CLACHOUFOUFOUIDMANGADEX}&limit=25`
  await axios.get(getMangaOfTeam)
  .then(response => {
      let data =  response.data.data;
      // je cycle sur chaque manga récupéré sur l'api
      for (let truedata of data){
        mangas.push(
          {
            id:truedata.id,
            name:truedata.attributes.title[Object.keys(truedata.attributes.title)[0]]
          }
          )
      } 
    });
  //============== Récupération de tous les chapitres des mangas précédemment récupérés
  let allMangasAndChaptersToPost = []
  for(let manga of mangas){
      const carousel_function = require("./utils/carousel_function.js");
      let project = await carousel_function.getMangaFromJson(manga.name)
      if (project == undefined) {
          console.log(manga.name + " est invalide")
          continue;
      }
      let allChaptersOfManga = []
      let getMangaChapters = `https://api.mangadex.org/chapter?limit=10&groups%5B%5D=${CLACHOUFOUFOUIDMANGADEX}&manga=${manga.id}&contentRating%5B%5D=safe&contentRating%5B%5D=suggestive&contentRating%5B%5D=erotica&includeFutureUpdates=1&order%5Bchapter%5D=desc`
      await axios.get(getMangaChapters).then(response => {
        let responseStatus = response.data;  
        let chapters = responseStatus.data
        for (let chapter of chapters){
          let chapterAttritubes = chapter.attributes 
          let chapterId = chapter.id
          let volume = chapterAttritubes.volume
          let chapterNumber = chapterAttritubes.chapter
          let chapterTitle = chapterAttritubes.title
          let publishDate = chapterAttritubes.publishAt
          let totalPageNumber = chapterAttritubes.pages
          
          let currentDate = new Date();
          let mangadexDate = new Date(`${publishDate}`)
          //je compare ma data actuelle a celle du chapitre sur mangadex
          let difference = currentDate - mangadexDate

          //si la différence est supérieur à 3 h, je ne récupère pas le chapitre
          if(difference > 3600000) continue;
          let chapTitle = ""
          if(volume != null){
              if(chapterTitle != null){
                  chapTitle = `Volume ${volume} - chapitre ${chapterNumber} : ${chapterTitle}`
              }else{
                  chapTitle = `Volume ${volume} - chapitre ${chapterNumber}`
              }
          }else{
              chapTitle = `Chapitre ${chapterNumber}`
          }
          allChaptersOfManga.push({
              title: manga.name, 
              chapNum:chapTitle,
              chapLink: `https://mangadex.org/chapter/${chapterId}`,
              totalPageNumber:totalPageNumber
          })
      }
      });
      //je vérifie s'il y a des nouveaux chapitres 
      if (allChaptersOfManga.length == 0) continue;
      for (manga of allChaptersOfManga){
          allMangasAndChaptersToPost.push(manga)
      }
  }
  let mangaToPost = [];
  if (allMangasAndChaptersToPost.length != 0) {
      mangaToPost = await checkScrapingData(allMangasAndChaptersToPost);
    if (mangaToPost.length != 0) {
      await generateEmbedForMangasToPost(mangaToPost);
    }
  }
  if (mangaToPost.length == 0) console.log("Pas de nouveauté de la team clachoufoufou");
}
//#region scraper
let allPostedMangas = [];
// getImgurImage()
async function getImgurImage() {
  // delete require.cache[require.resolve(`./utils/carousel_function.js`)]
  // const carousel_function = require("./utils/carousel_function.js");

  // let projects = await carousel_function.getSortedProject();
  // let allFormetedProject = ""
  // for(let i = 0; i < projects.length; i++){
  //     allFormetedProject += `[fuck]${projects[i].name}[fuck]\n${projects[i].synopsis}\n\n\n\n`
  // }
  // fs.writeFile(`./fuck.txt`, allFormetedProject, err =>{
  //   if(err){
  //     console.log(err)
  //   }
  // })
  let mangas = []
  delete require.cache[require.resolve(`./imgur.json`)]
  const imgur = require("./imgur.json");
  for (imgurFolder of imgur) {
    let data = new FormData();
    let config = {
      method: 'get',
      url: `https://api.imgur.com/3/album/${imgurFolder.hashCodeImgur}/images`,
      headers: {
        'Authorization': 'Client-ID e119f770c5fb768',
        ...data.getHeaders()
      },
      data: data
    };
    await axios(config)
      .then(function (response) {
        let data = JSON.parse(JSON.stringify(response.data.data))
        let images = "";
        for (let image of data) {
          if (images == "") {
            images = image.link
          } else {
            images += ` ${image.link}`
          }
        }
        mangas.push({
          name: imgurFolder.nameFolder,
          images: images
        })
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  console.log(mangas)
  fs.writeFile(`./json/images.json`, JSON.stringify(mangas, null, 2), err => {
    if (err) {
      console.log(err)
    }
  })
}  
async function checkScrapingData(allMangasToPost) {
  let mangaToPost = [];
  //je vérifie si les mangas récupérés sont dans un tableau pour les manga postés
  for (let i = 0; i < allMangasToPost.length; i++) {
    if (!(allPostedMangas.find((chap) => chap.title == allMangasToPost[i].title) && allPostedMangas.find((chap) => chap.chapNum == allMangasToPost[i].chapNum) && allPostedMangas.find((chap) => chap.chapLink == allMangasToPost[i].chapLink))) {
      //je prépare le post
      mangaToPost.push(allMangasToPost[i])
      //je les ajoutes aux mangas postés
      allPostedMangas.push(allMangasToPost[i])
    }
  }
  return mangaToPost;
}

async function generateEmbedForMangasToPost(mangaToPost) {
  delete require.cache[require.resolve(`./utils/carousel_function.js`)]
  const carousel_function = require("./utils/carousel_function.js");

  for (let i = 0; i < mangaToPost.length; i++) {
    let title = mangaToPost[i].title;
    let chapNum = mangaToPost[i].chapNum
    let link = mangaToPost[i].chapLink;
    let numberOfPage = mangaToPost[i].totalPageNumber;
    //je récupère le json avec tous les informations du manga
    let mangaFromJson = await carousel_function.getMangaFromJson(title)
    //je récupère le json avec tous les liens d'image 
    let imagesJson = await carousel_function.getImageLink(mangaFromJson.imageFolder);

    let imagesArray = imagesJson.images.split(" ")
    let randomImage = imagesArray[~~(Math.random() * imagesArray.length)];
    var sentence = arrayOfSentences[~~(Math.random() * arrayOfSentences.length)].sentence;
    let role = `<@&${mangaFromJson.roleId}>`
    const Channel = client.channels.cache.get("754418579839123507");
    //Génération de l'embed
    const embed = new MessageEmbed();
    embed.setTitle(`${title}`);
    embed.setColor("3996CE");
    embed.setDescription(`[${sentence} ${chapNum}](${link}) \n Un chapitre de ${numberOfPage}`);
    embed.setFooter('A bot made by GeneralPlayfix');
    embed.setImage(`${randomImage}`);
    Channel.send(`${role}`, embed).then((response) => response.crosspost()).catch((e) => console.log(e));
  // Channel.send(`${role}`, embed).then(async msg => {
  //     await msg.react("◀️")
  //     await msg.react("▶️")
  //     try {
  //       await msg.crosspost()
  //     } catch (e) {
  //     }
  //   })
  }
}
//#endregion

async function normalBotCommands() {
  client.on("message", gotMessage);
  async function gotMessage(msg) {
    callAllModules(msg);
  }
  client.on("messageReactionAdd", (reaction, user) => {
    delete require.cache[require.resolve(`./utils/carousel_function.js`)]
    let carousel_function = require("./utils/carousel_function.js");
    carousel_function.messageVerification(reaction, user)
  });
  client.on("messageReactionRemove", (reaction, user) => {
    delete require.cache[require.resolve(`./utils/carousel_function.js`)]
    let carousel_function = require("./utils/carousel_function.js");
    carousel_function.messageVerification(reaction, user)
  });
}


function fileGenerator() {
  const commands = require("./json/commands.json");
  const commandFile = [];
  const configFile = [];
  fs.readdirSync(commandsFolder).forEach((file) => {
    let fileWithoutExtension = file.replace(".js", "");
    commandFile.push(fileWithoutExtension);
  });
  fs.readdirSync(configFolder).forEach((file) => {
    let fileWithoutExtension = file.replace(".json", "");
    configFile.push(fileWithoutExtension);
  });
  for (command of commands) {
    if (configFile.indexOf(command.name) != -1) {
    } else {
      fs.appendFile(
        `${configFolder}${command.name}.json`,
        `{\n   "module":true,\n    "requireAdminPerms":false,\n    "requireRoles":false,\n    "requiredRoles":["761904239034892288", "761905362654855168", "857273472300744746"],\n    "whitelistEnabled":false,\n    "whitelist":[],\n    "blasklistEnabled":false,\n    "blacklist":[]\n}`,
        function (err) {
          if (err) throw err;
          console.log(`Fichier ${command.name} créé !`);
        }
      );
    }
    if (commandFile.indexOf(command.name) != -1) {
    } else {
      fs.appendFile(
        `${commandsFolder}${command.name}.js`,
        `const { Client, MessageEmbed, Message, MessageAttachment, Role, RoleManager} = require("discord.js"); 
  prefix = require("../json/prefix.json");

function onCommand(msg, allCommandInformations){
  var path = require("path");
  var scriptName = path.basename(__filename).replace(".js", "");
  let confFile = path.basename(__filename).replace(".js", "") + ".json";
  delete require.cache[require.resolve(\`../config/\${confFile}\`)]
  let configuration = require(\`../config/\${confFile}\`);
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
  executeCommand(msg, allCommandInformations[1]);
}

function executeCommand(msg, commandArguments){
  
}
module.exports = {onCommand}`,
        function (err) {
          if (err) throw err;
          console.log(`Fichier ${command.name} créé !`);
        }
      );
    }
  }
}
function callAllModules(msg) {
  if (msg.content.startsWith(prefix.prefix)) {
    if (!msg.guild.id == "748823235969286144") { msg.reply("Vous n'êtes pas sur un serveur autorisé"); return; }
    const trimMessage = msg.content.trim().replace(/[\s]{2,}/g, " ").replace(prefix.prefix, ""); //supp les doubles/triples espaces ainsi que les espaces inutiles au début et fin de chaine
    const args = trimMessage.split(" ").slice(1); //je récupère tous les arguments qui sont après le nom de la commande
    let allCommandInformations = [trimMessage.split(" ")[0], args];
    const commandFile = [];
    //je récupère tous les fichiers de la constante "commandsFolder" (chemin vers les dossiers de configuration)
    fs.readdirSync(commandsFolder).forEach((file) => {
      let fileWithoutExtension = file.replace(".js", "");
      commandFile.push(fileWithoutExtension);
    });
    // je cycle sur tous les fichiers et j'appelle leur fonction "oncommand" qui fera le traitement (droit et action si tout est correct)
    for (command of commandFile) {
      delete require.cache[require.resolve(`${commandsFolder}${command}`)];
      let commandFile = require(`${commandsFolder}${command}`);
      commandFile.onCommand(msg, allCommandInformations);
    }

    //je n'accepte que des commandes sur le serveur de la team

  }
}