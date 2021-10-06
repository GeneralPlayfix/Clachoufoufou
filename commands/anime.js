const {
  MessageEmbed
} = require("discord.js");
const malScraper = require("mal-scraper");
// var cron = require("node-cron");/

const prefix = require("../json/prefix.json");
async function getAnime(msg) {
  if (msg.content.includes(`${prefix.prefix}anime `)) {
    const waitEmbed = new MessageEmbed();
    waitEmbed.setTitle("Chargement...");
    waitEmbed.setImage("https://www.gif-maniac.com/gifs/54/54389.gif");
    var waitMsg = await msg.channel.send(waitEmbed);
    // console.log(waitMsg);

    let messageWithoutCommand = msg.content;
    messageWithoutCommand = messageWithoutCommand.substr(7);

    malScraper
      .getInfoFromName(messageWithoutCommand, true)
      .then((data) => {
        // console.log(data.title);
        // console.log(data.synopsis);
        // console.log(data.picture);
        // console.log(data.episodes);
        // console.log(data.genres);
        // console.log(data.episodes);
        // console.log(data.score);
        // console.log(data.popularity);
          const MALembed = new MessageEmbed();
          // Set the title of the field
          if(data.title != ""){
            MALembed.setTitle(data.title);
          }
  
          if(data.picture != ""){
            MALembed.setThumbnail(data.picture);
          }
          if(data.synopsis != ""){
            MALembed.setDescription(`Synopsis : \n ${data.synopsis}`);
          }
          if(data.episodes != ""){
            MALembed.addFields({
              name: "Nombre d'épisodes",
              value: data.episodes,
              inline: false,
            });
          }
          
            if(data.genres.toString != ""){
              MALembed.addFields({
                name: "Genres : ",
                value: data.genres.toString(),
                inline: false,
              });

            }
          // Set the color of the embed
          MALembed.setColor("8a2be2");
          // Set the main content of the embed
  
          //.setImage(``);
          // console.log(rand);
            msg.channel.send(MALembed);
          waitMsg.delete();
      })
      .catch((err) =>{
        console.log(err)
        msg.channel.send("Pas de résultat !")
        waitMsg.delete();

      } 

      );
  }
}
module.exports = { getAnime };
