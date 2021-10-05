const {
  Client,
  MessageEmbed,
  Message,
  MessageAttachment,
} = require("discord.js");
const puppeteer = require("puppeteer");
const fs = require("fs");
const { config } = require("process");
const malScraper = require("mal-scraper");
// var cron = require("node-cron");

const client = new Client();

const prefix = require("./json/prefix.json");
const json = require("./json/img.json");
const commands = require("./json/commands.json");
const clachouxRef = require("./json/clachouxRef.json");

let arrayOfSentences = require("./json/readingSentence.json");

let overallTableOfExits = [];

configFileGenerator();
main();


function main() {
  client.login("ODU2NTM1MjgyODQ5MDIxOTYz.YNCcpQ.jrFniCVbGRDbcXCd7yPdbuWJNr8");
  client.on("ready", () => {
    console.log(`${client.user.tag} is online!`);

    setTimeout(japanreadScraper, 0);
    setTimeout(normalBotCommands, 0);
    // setTimeout(test, 150);
  });
}
var mangas = [];
function getKusoCatEmoji(){
  return client.emojis.cache.find(
    (emoji) => emoji.name === "kuso_cat"
  );
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
  page.setUserAgent(
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:25.0) Gecko/20100101 Firefox/25.0"
  );
  await page.goto(`https://www.japanread.cc`, {
    waitUntil: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
  }); //se rendre sur une page
  await page.screenshot({ path: "buddy-screenshot.png" });
  tempMangas = await page.evaluate(() => {
    let tbody = document.querySelector(
      "body > section > div > div > div.col-lg-9 > div.table-responsive > table > tbody"
    );
    let trs = [];

    trs = tbody.querySelectorAll("tr");

    let hugeArray = [];
    let title = "";
    let page = 0;
    // huge = tbody.innerHTML;
    for (tr of trs) {
      let tempTitle = "";
      if (tr.className == "manga") {
        tempTitle = tr
          .querySelector("tr > td  > span > a")
          .innerText.replaceAll("\\t", "");
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

        let teams = tr.querySelectorAll(
          "tr > td.d-none.d-sm-table-cell.text-truncate > a"
        );
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
          let timerArray = timer[0].innerText
            .replace(/[\s-]+$/, "")
            .split(/[\s-]/);
          if (timerArray[1] === "s" || timer[0].innerText.includes("min")) {
            if (
              (timerArray[1] == "min" && timerArray[0] <= 20) ||
              timerArray[1] == "s"
            ) {
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
      if (
        overallTableOfExits.find(
          (Title) => Title.chapTitle === manga.chapTitle
        ) &&
        overallTableOfExits.find((chap) => chap.chap === manga.chap) &&
        overallTableOfExits.find((link) => link.chapLinks === manga.chapLinks)
      ) {
        // console.log("Le chap y est");
      } else {
        // console.log("le chap y est pas !");
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
      if (
        overallTableOfExits.find(
          (Title) => Title.chapTitle === manga.chapTitle
        ) &&
        overallTableOfExits.find((chap) => chap.chap === manga.chap) &&
        overallTableOfExits.find((link) => link.chapLinks === manga.chapLinks)
      ) {
        // console.log(
        //   "Le manga existe déjà dans le tableau overallTableOfExists"
        // );
      } else {
        overallTableOfExits.push({
          chapTitle: manga.chapTitle,
          chap: manga.chap,
          chapLinks: manga.chapLinks,
        });
      }
    }
    // console.log("Tableau sortie actuelle :");
    // console.log(mangas);
    // console.log("Tableau complet");
    // console.log(overallTableOfExits);
    setTimeout(generateEmbedForMangas, 0);
  } else {
    // console.log("Pas de nouveauté de la team clachoufoufou");
  }
  await browser.close();
  // setTimeout(infoSiteWeb, 15 * 60 * 1000);
  setTimeout(japanreadScraper, 1 * 60 * 1000);
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
    // console.log(i);
    // console.log(mangas[i]);
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
    // let titleWithoutSpaces = ;
    const embed = new MessageEmbed()
      // Set the title of the field
      .setTitle(`${mangas[i].chapTitle}`)
      // Set the color of the embed
      .setColor("3996CE")
      // Set the main content of the embed
      .setDescription(`[${rand.sentence} ${chap}](${mangas[i].chapLinks})`)

      .setImage(`${img}`);
    // console.log(rand);
    Channel.send(`${role}`, embed)
      .then((response) => response.crosspost())
      .catch((e) => console.log(e));
  }
  // Sending "!d bump" to the channel.
}

function normalBotCommands() {
  // setTimeout(() => {
  // message("botNormal")
  // }, 0);

  const repliesSentences = [
    "Tu ne devrais pas insulter les gens",
    "Tu ne dois pas insulter les gens",
    "C'est pas bien d'insulter quelqu'un",
    "C'est pas bien d'insulter les gens",
    "Il ne faut pas insulter les gens",
    "Méchant :rage: ",
  ];

  // const insults = [
  //   "connard",
  //   "salaud",
  //   "pd",
  //   "fdp",
  //   "connart",
  //   "connar",
  //   "con",
  //   "pute",
  //   "salope",
  //   "salop",
  //   "salaud",
  //   "conard, enculé, enculés, anculé, enculée, encullé, encullés",
  // ];
  client.on("message", gotMessage);

  const maatTroll = ["troll", "trolltou", "flemmme", ":eyes:"];

  function gotMessage(msg) {
    // let foundInText = false;
    // //je vérifie si le message contient une insulte
    let firstword = msg.content.split(" ");
    if (msg.content.includes(`${prefix.prefix}anime `)) {
      let messageWithoutCommand = msg.content;
      messageWithoutCommand = messageWithoutCommand.substr(7);

      malScraper
        .getInfoFromName(messageWithoutCommand, true)
        .then((data) => {
          console.log(data.title);
          console.log(data.synopsis);
          console.log(data.picture);
          console.log(data.episodes);
          console.log(data.genres);
          console.log(data.episodes);
          console.log(data.score);
          console.log(data.popularity);
          const MALembed = new MessageEmbed();
          // Set the title of the field
          MALembed.setTitle(data.title);

          MALembed.setThumbnail(data.picture);
          MALembed.setDescription(`Synopsis : \n ${data.synopsis}`);
          MALembed.addFields({
            name: "Nombre d'épisodes",
            value: data.episodes,
            inline: false,
          });
          MALembed.addFields({
            name: "Genres : ",
            value: data.genres.toString(),
            inline: false,
          });
          // Set the color of the embed
          MALembed.setColor("8a2be2");
          // Set the main content of the embed

          //.setImage(``);
          // console.log(rand);
          msg.channel.send(MALembed);
        })
        .catch((err) => console.log(err));
    }
   
    // for(var i in insults){
    //   if(msg.content.toLocaleLowerCase().includes(insults[i].toLowerCase())) foundInText = true;
    // }
    // //si il en contient une j'envoie un message réponse
    // if(foundInText){
    //   const emoji = client.emojis.cache.find(
    //     (emoji) => emoji.name === "kuso_cat"
    //   );
    //   //je donne une valeur aléatoire comprise entre 0 et la longueur totale du tableau repliesSentences
    //   let index = ~~(Math.random() * repliesSentences.length);
    //   let sentence = repliesSentences[index];
    //   //si l'index contient un emoji
    //   if(index == 5 ){
    //     msg.reply(`${sentence}`);
    //   }else{
    //     msg.reply(`${sentence} ${emoji}`);
    //   }
    // }
    let clachouxRefFoundInText = false;
    // let adminRole = msg.guild.roles.cache.find(r => r. id === "771793902331232280");
    // if (msg.content.startsWith(`${prefix.prefix}addsw `) && msg.member.roles.cache.some(role => role.name === 'team clachoufoufou') || msg.member.roles.cache.some(role => role.name === 'foufoufou')) {
    //   let tempMessage = msg.content;
    //   // console.log(commands[0].name.length);
    //   let message = tempMessage.substring(commands[0].name.length+4, tempMessage.length);
    //   var words = [];
    //   fs.readFile("sexWords.txt", "utf8", function (err, data) {
    //     if (err) throw err;
    //     // console.log(data)
    //     // console.log(data);
    //     words = data;
    //     // console.log("Les mots");
    //     // console.log(words);
    //     // console.log(message);
    //     if (words.includes(message)) {
    //       msg.reply("Le mot existe déjà !");
    //     }else{
    //       fs.appendFile("sexwords.txt", '\n', function(err){});
    //       fs.appendFile("sexWords.txt", `${message}`, function (err) {
    //         if (err) return console.log(err);
    //         console.log(`Mot sexuel ${message} ajouté !`);
    //       });
    //       msg.reply("mot ajouté !");
    //     }
    //   });
    // }
      clachoux(msg);

   

    let maatouEnForce = false;
    var user = msg.author.id;
    for (var i in maatTroll) {
      if (
        msg.content.toLocaleLowerCase().includes(maatTroll[i].toLowerCase()) &&
        user == "623938144198197258"
      )
        maatouEnForce = true;
    }
    if (maatouEnForce) {
      msg.react(`${emoji}`);
    }
    let sexWordsFoundInText = false;
    var sexWords = fs.readFileSync("sexWords.txt").toString().split("\n");
    for (word of sexWords) {
      if (msg.content.toLocaleLowerCase().includes(word.toLowerCase()))
        sexWordsFoundInText = true;
    }
    if (sexWordsFoundInText) {
      msg.reply(`Coquin (ne) ${emoji}`);
    }
    if (commands.find((r) => r.name.includes(firstword[0]))) {
    } else {
    }
    if (msg.content == `${prefix.prefix}help`) {
      const helpEmbed = new MessageEmbed();
      // Set the title of the field
      helpEmbed.setTitle(`Commandes du Bot`);

      helpEmbed.setThumbnail("https://i.ibb.co/njxVf93/Clachoufoufou.webp");
      for (command of commands) {
        let nameWithText = "";
        if (command.nameWithText != "none") {
          nameWithText = " " + command.nameWithText;
        }
        helpEmbed.addFields({
          name: prefix.prefix + command.name + nameWithText,
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
    // if(msg.content == "test"){
    //   const emoji = client.emojis.cache.find(
    //     (emoji) => emoji.name === "kuso_cat"
    //   );
    //   msg.react(`${emoji}`);
    // }
  }
}

// async function message(message) {
//return;

//   const Channel = client.channels.cache.get("886235045252173875");
//   if (!Channel) return console.error("Couldn't find the channel.");
//   Channel.send(message).catch((e) => console.log(e));
// }

function configFileGenerator() {
  const configFolder = "./config/";
  const commandsFolder = "./commands/";
  const commandFile = [];
  const configFile = [];
  fs.readdirSync(commandsFolder).forEach((file) => {
    let fileWithoutExtension = file.substring(0, file.length - 3);
    commandFile.push(fileWithoutExtension);
  });
  fs.readdirSync(configFolder).forEach((file) => {
    let fileWithoutExtension = file.substring(0, file.length - 5);
    configFile.push(fileWithoutExtension);
  });
  for (fileCommand of commandFile) {
    //je retire l'extension du nom de fichier
    if (configFile.indexOf(fileCommand) != -1) {
    } else {
      fs.appendFile(
        `${configFolder}${fileCommand}.conf`,
        "requireAdminPerms:false\nrequireRoles:false\nrequiredRoles:[]\nwhitelistEnabled:false\nwhitelist:[]",
        function (err) {
          if (err) throw err;
          console.log(`Fichier ${fileCommand} créé !`);
        }
      );
    }
  }
}

function clachoux(msg){
  
  for (var clachoux of clachouxRef) {
    if (msg.content.toLowerCase().includes(clachoux.name.toLowerCase())) {
      msg.react(`${getKusoCatEmoji()}`);
      break;
    }
  }
}