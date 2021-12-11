const {
  Client,
  MessageEmbed,
  Message,
  MessageAttachment,
} = require("discord.js");
const puppeteer = require("puppeteer");
const fs = require("fs");
// var cron = require("node-cron");/

const client = new Client();

const configFolder = "./config/";
const commandsFolder = "./commands/";
const prefix = require("./json/prefix.json");
const json = require("./json/img.json");
const token = require("./json/token.json");
const clachouxRef = require("./json/clachouxRef.json");
const maatTroll = ["troll", "trolltou", "flemmme", ":eyes:"];

let arrayOfSentences = require("./json/readingSentence.json");

let overallTableOfExits = [];
fileGenerator();
main();
function main() {
  client.login(token.token);
  client.on("ready", () => {
    console.log(`${client.user.tag} is online!`);
    setTimeout(japanreadScraper, 0);
    setTimeout(normalBotCommands, 0);
    // setTimeout(test, 150);
  });
}
var mangas = [];
function getKusoCatEmoji() {
  return client.emojis.cache.find((emoji) => emoji.name === "kuso_cat");
}
async function japanreadScraper() {
  var tempMangas = [];
  // setTimeout(() => {
  //   message("japanreadScraper")
  // }, 0);
  mangas = [];
  const browser = await puppeteer.launch({ headless: true }); //headless false permet de démarer une instance visible de chromium
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);
  // se faire passer pour un navigateur
  page.setUserAgent("Mozilla/5.0 (Windows NT 6.1; WOW64; rv:25.0) Gecko/20100101 Firefox/25.0");
  await page.goto(`https://www.japanread.cc`, {
    waitUntil: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
  }); //se rendre sur une page
  // await page.screenshot({ path: "buddy-screenshot.png" });
  tempMangas = await page.evaluate(() => {
    let tbody = document.querySelector("body > section > div > div > div.col-lg-9 > div.table-responsive > table > tbody");
    let trs = [];

    trs = tbody.querySelectorAll("tr");
    let hugeArray = [];
    let title = "";
    let page = 0;
    // huge = tbody.innerHTML;
    for (tr of trs) {
      let tempTitle = "";
      if (tr.className == "manga") {
        tempTitle = tr.querySelector("tr > td  > span > a").innerText.replaceAll("\\t", "");
        title = tempTitle;
        page++;
      } else {
        let chaps = [];
        try {
          chaps = tr.querySelectorAll("tr > td:nth-child(2) > a");
        } catch (error) {
          test = error;
        }
        let timer = tr.querySelectorAll("tr > td:nth-child(7) > time");
        let teams = tr.querySelectorAll("tr > td.d-none.d-sm-table-cell.text-truncate > a");
        trueTeam = "";
        if (teams[0]?.innerText == null) {
          trueTeam = "not";
        } else {
          if (teams.length > 1) {
            for (team of teams) {
              if (trueTeam.length > 1) {
                trueTeam += "/" + team.innerText;
              } else {
                trueTeam = team.innerText;
              }
            }
          } else {
            trueTeam = teams[0]?.innerText;
          }
        }
        if (trueTeam.includes("team clachoufoufou")) {
          let timerArray = timer[0].innerText.replace(/[\s-]+$/, "").split(/[\s-]/);
          if (timerArray[1] === "h" || timer[0].innerText.includes("min")) {
            if ((timerArray[1] == "min" && timerArray[0] <= 45) || timerArray[1] == "h") {
              hugeArray.push({
                chapTitle: title,
                chap: chaps[0].innerText,
                chapLinks: chaps[0].href,
                chapTimer: timer[0].innerText,
                chapTeam: trueTeam,
              });
            }
          }
        }
      }
    }
    return hugeArray;
  });
  // console.log("");
  // console.log("Manga que je récupère");
  // console.log(tempMangas);
  // console.log("");

  if (tempMangas.length != 0) {
    for (manga of tempMangas) {
      if (!(overallTableOfExits.find((Title) => Title.chapTitle === manga.chapTitle) && overallTableOfExits.find((chap) => chap.chap === manga.chap) && overallTableOfExits.find((link) => link.chapLinks === manga.chapLinks))) {
        mangas.push({
          chapTitle: manga.chapTitle,
          chap: manga.chap,
          chapLinks: manga.chapLinks,
        });
      }
    }
  }
  if (mangas.length >= 1) {
    for (manga of mangas) {
      if (!(overallTableOfExits.find((Title) => Title.chapTitle === manga.chapTitle) && overallTableOfExits.find((chap) => chap.chap === manga.chap) && overallTableOfExits.find((link) => link.chapLinks === manga.chapLinks))) {
        //j'ajoute le manga récupéré dans le tableau qui contient tous les mangas postés
        overallTableOfExits.push({
          chapTitle: manga.chapTitle,
          chap: manga.chap,
          chapLinks: manga.chapLinks,
        });
      }
    }
    //je crée un "thread", ou une exécution "parallèle" pour généré mon embed discord avec le/les manga(s) récupéré(s) 
    setTimeout(generateEmbedForMangas, 0);
  } else {
    console.log("Pas de nouveauté de la team clachoufoufou");
  }
  //je ferme le navigateur
  await browser.close();
  // setTimeout(infoSiteWeb, 15 * 60 * 1000);
  //je relance la fonction toutes les x minutes parallèllement au reste du script
  setTimeout(japanreadScraper, 2 * 60 * 1000);
}

async function generateEmbedForMangas() {
  // setTimeout(() => {
  //   message("discordEmbed")
  // }, 0);
  // console.log(`${client.user.tag} is online!`);
  // Checking if the channel exists.
  const Channel = client.channels.cache.get("754418579839123507");
  if (!Channel) return console.error("Couldn't find the channel.");
  // console.log(mangas)
  for (let i = mangas.length - 1; i >= 0; i--) {
    let title = mangas[i].chapTitle.toLowerCase();
    let chap = mangas[i].chap.toLowerCase();
    let img = "";
    let jRole = "";
    for (j of json) {
      if (j.name.toLowerCase() == mangas[i].chapTitle.toLowerCase()) {
        img = j.img;
        jRole = j.role;
      }
    }
    // console.log(mangas[i].chapTitle);
    const guild = client.guilds.cache.get("748823235969286144");
    var role = "";
    let shortTitle = "";
    if (jRole == "empty") {
      shortTitle = "@" + title;
    } else {
      shortTitle = jRole;
    }

    // console.log(shortTitle);
    role = guild.roles.cache.find((r) => r.name.includes(shortTitle));
    if (role == undefined) {
      role = "@" + title;
    }
    var rand = arrayOfSentences[~~(Math.random() * arrayOfSentences.length)];
    const embed = new MessageEmbed()
      .setTitle(`${mangas[i].chapTitle}`)
      .setColor("3996CE")
      .setDescription(`[${rand.sentence} ${chap}](${mangas[i].chapLinks})`)
      .setImage(`${img}`);
    Channel.send(`${role}`, embed).then((response) => response.crosspost()).catch((e) => console.log(e));
  }
}

function normalBotCommands() {
  // setTimeout(() => {
  // message("botNormal")
  // }, 0);
  client.on("message", gotMessage);

  function gotMessage(msg) {
    callAllModules(msg);

    clachoux(msg);
    let googleSearch = require("./Chachoufoufou_recherche.js")
    googleSearch.Chachoufoufou_recherche(msg);
    // maatouTroll(msg);
  }
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
function clachoux(msg) {
  for (var clachoux of clachouxRef) {
    if (msg.content.toLowerCase().includes(clachoux.name.toLowerCase())) {
      msg.react(`${getKusoCatEmoji()}`);
      break;
    }
  }
}
function maatouTroll(msg) {
  var user = msg.author.id;
  for (var i in maatTroll) {
    if (
      msg.content.toLocaleLowerCase().includes(maatTroll[i].toLowerCase()) &&
      user == "374867949330104321"
    )
      msg.react(`${emoji}`);
  }
}

function callAllModules(msg) {
  if (msg.content.startsWith(prefix.prefix)) {
    if (!msg.guild.id == "748823235969286144") { msg.reply("Vous n'êtes pas sur un serveur autorisé"); return;}
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
