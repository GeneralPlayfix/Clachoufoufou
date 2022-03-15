const { Client, MessageEmbed, Message, MessageAttachment, } = require("discord.js"); 
const prefix = require("./json/prefix.json");
async function clear(msg){
    if(msg.content.includes(`${prefix.prefix}clear`)){

        const trimMessage = msg.content.trim().replace(/[\s]{2,}/g," ");//supp les doubles/tripes espaces ainsi que les espaces inutiles au début et fin de chaine
        const args = trimMessage.split(' ').slice(1); // All arguments behind the command name with the prefix
        msg.delete();
        if(args.length == 1){
            let amount = args.join(' '); // Amount of messages which should be deleted
            if (isNaN(amount)) return msg.reply('The amount parameter isn`t a number!'); // Checks if the `amount` parameter is a number. If not, the command throws an error
            
            if (amount > 100) return msg.reply('You can`t delete more than 100 messages at once!'); // Checks if the `amount` integer is bigger than 100
            if (amount < 1) return msg.reply('You have to delete at least 1 message!'); // Checks if the `amount` integer is smaller than 1
            await msg.channel.messages.fetch({ limit: amount }).then(messages => { // Fetches the messages
                msg.channel.bulkDelete(messages // Bulk deletes all messages that have been fetched and are not older than 14 days (due to the Discord API)
            )});
        }else if(args.length == 2){
            let user = args[0].substr(3);
            let amount = args[1];
            user = user.substring(0, user.length - 1);
            if (isNaN(amount)) return msg.reply('Vous devez spécifier un nombre de message à supprimer (pas autre chose)');
            
            msg.channel.messages.fetch({
                limit: 100// Change `100` to however many messages you want to fetch
            }).then((messages) => { 
                const botMessages = [];
                messages.filter(m => m.author.id === user).forEach(msg => botMessages.push(msg))
                msg.channel.bulkDelete(botMessages).then(() => {
                    msg.channel.send(`${amount} message(s) supprimé(s)`).then(msg => msg.delete({
                        timeout: 3000
                    }))
                });
            })
        }else if(args.length > 2 ){
            msg.reply("Vous ne pouvez pas mettre plus de 2 paramètres à cette fonctionnalité !")
        }else{
            msg.reply("Vous devez au minimum spécifier le nombre de message à supprimer pour utiliser cette fonctionnalité !")
        }
    }
   
}

function onCommand(msg, allCommandInformations){

}
module.exports = { clear, onCommand };
