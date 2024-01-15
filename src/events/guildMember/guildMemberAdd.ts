import { EmbedBuilder, TextChannel } from 'discord.js'
import { event } from '../../utils'

export default event('guildMemberAdd', (client, member) => {
    const channelId = '1193257133542740129';
    const welcomeChannel = member.guild.channels.cache.get(channelId) as TextChannel;

    if (!welcomeChannel) {
        console.error(`Le salon de bienvenue avec l'ID ${welcomeChannel} n'a pas été trouvé.`);
        return;
    }

    const memberJoin = new EmbedBuilder()
        .setTitle(`${member.user.tag}`)
        .setColor("Green")
        .setDescription(`<@${member.user.id}> vient de rejoindre le serveur.`)
        .setImage("https://c.tenor.com/A8bNTOeNznQAAAAC/tenor.gif")
        .setTimestamp()
        .setFooter({ text: "Par yatsuuw @ Discord" })

    welcomeChannel.send({ embeds: [memberJoin] });
    //console.log(`Un utilisateur vient de rejoindre.`)
})
