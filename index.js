const {
  Client,
  MessageEmbed,
  Message,
  MessageAttachment,
  WebhookClient
} = require("discord.js");
const puppeteer = require("puppeteer");
const fs = require("fs");
// var cron = require("node-cron");/
var axios = require('axios');
var FormData = require('form-data');

const client = new Client();
const configFolder = "./config/";

const commandsFolder = "./commands/";
const prefix = require("./json/prefix.json");
const token = require("./json/token.json");
let arrayOfSentences = require("./json/readingSentence.json");

fileGenerator();
main();
// fuck()

function main() {
  client.login(token.token);
  client.on("ready", () => {
    console.log(`${client.user.tag} is online!`);
    setTimeout(japanreadScraper, 0);
    setTimeout(normalBotCommands, 0);
    // setTimeout(test, 150);
  });
}
//#region scraper
let allPostedMangas = [];
// fuck()
async function fuck() {
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
async function japanreadScraper() {
  var allMangasOfTheWebPage = [];
  const browser = await puppeteer.launch({ headless: true }); //headless false permet de démarer une instance visible de chromium
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);
  page.setUserAgent("Mozilla/5.0 (Windows NT 6.1; WOW64; rv:25.0) Gecko/20100101 Firefox/25.0");
  await page.goto(`https://bentomanga.com/team/team-clachoufoufou/projects?order=desc`, {
    waitUntil: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
  });
  allMangasOfTheWebPage = await page.evaluate(() => {
    let mangas = []
    let a = document.querySelectorAll("#projects_content > div > div.div-manga_datas > div.div-manga_datas-header > a")
    for (let manga of a) {
      let link = manga.href
      let title = manga.querySelector("div > div.component-manga-title_main > h1").innerText
      mangas.push({
        title: title,
        mangaLink: link
      })
    }
    return mangas
  });
  await browser.close()
  await getAllChapter(allMangasOfTheWebPage)
  setTimeout(japanreadScraper, 5 * 60 * 1000);
}
async function getAllChapter(allMangasOfTheWebPage) {
  const browser = await puppeteer.launch({ headless: true }); //headless false permet de démarer une instance visible de chromium
  let allChapterInformations = []
  for (let manga of allMangasOfTheWebPage) {
    let chapters = []
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    page.setUserAgent("Mozilla/5.0 (Windows NT 6.1; WOW64; rv:25.0) Gecko/20100101 Firefox/25.0");
    await page.goto(`${manga.mangaLink}`, {
      waitUntil: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
    });
    chapters = await page.evaluate(() => {
      let allAvaibleChapters = document.querySelectorAll("#chapters_content > div > div")
      let chapNum = ""
      let chapToExport = []
      for (let chapter of allAvaibleChapters) {
        let dateArray = chapter.querySelector("div.component-chapter-date").innerText.split(" ")
        let duration = dateArray[0]
        let unity = dateArray[1]
        if (unity == "s" || unity == "min" && duration <= 45) {
          chapNum = chapter.querySelector("div.component-chapter-title > a > span.manga_nb_chapter").innerText
          let chapLink = chapter.querySelector("div.component-chapter-title > a").href
          let title = document.querySelector("#manga > div.manga-infos > div.component-manga-title > div.component-manga-title_main > h1").innerText
          chapToExport.push({
            title: title,
            chapNum: chapNum,
            chapLink: chapLink
          })
        }
      }
      return chapToExport
    });
    for (let chapter of chapters) {
      allChapterInformations.push(chapter)
    }
    await page.close()
  }
  await browser.close()
  let mangaToPost = [];
  if (allChapterInformations.length != 0) {
    mangaToPost = await checkScrapingData(allChapterInformations);
    if (mangaToPost.length != 0) {
      await generateEmbedForMangasToPost(mangaToPost);
    }
  }
  if (mangaToPost.length == 0) console.log("Pas de nouveauté de la team clachoufoufou");
}
async function checkScrapingData(allMangasOfTheWebPage) {
  let mangaToPost = [];
  //je vérifie si les mangas récupérés sont dans un tableau pour les manga postés
  for (let i = 0; i < allMangasOfTheWebPage.length; i++) {
    if (!(allPostedMangas.find((chap) => chap.title == allMangasOfTheWebPage[i].title) && allPostedMangas.find((chap) => chap.chapNum == allMangasOfTheWebPage[i].chapNum) && allPostedMangas.find((chap) => chap.chapLink == allMangasOfTheWebPage[i].chapLink))) {
      //je prépare le post
      mangaToPost.push(allMangasOfTheWebPage[i])
      //je les ajoutes aux mangas postés
      allPostedMangas.push(allMangasOfTheWebPage[i])
    }
  }
  return mangaToPost;
}

async function generateEmbedForMangasToPost(mangaToPost) {
  delete require.cache[require.resolve(`./utils/carousel_function.js`)]
  const carousel_function = require("./utils/carousel_function.js");

  for (let i = mangaToPost.length - 1; i >= 0; i--) {
    let title = mangaToPost[i].title;
    let chapNum = mangaToPost[i].chapNum
    let link = mangaToPost[i].chapLink;
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
    embed.setDescription(`[${sentence} ${chapNum}](${link})`);
    embed.setFooter(`A bot made by GeneralPlayfix`);
    embed.setImage(`${randomImage}`);
    Channel.send(`${role}`, embed).then(async msg => {
      await msg.react("◀️")
      await msg.react("▶️")
      try {
        await msg.crosspost()
      } catch (e) {
      }
    })
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