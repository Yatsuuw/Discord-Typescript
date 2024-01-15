import { EmbedBuilder, TextChannel } from 'discord.js'
import { event } from '../../utils'

export default event('guildMemberRemove', (client, member) => {
    const channelId = '1193257133542740129';
    const welcomeChannel = member.guild.channels.cache.get(channelId) as TextChannel;

    if (!welcomeChannel) {
        console.error(`Le salon de départ avec l'ID ${welcomeChannel} n'a pas été trouvé.`);
        return;
    }

    const memberLeave = new EmbedBuilder()
        .setTitle(`${member.user.tag}`)
        .setColor("Red")
        .setDescription(`<@${member.user.id}> (${member.user.id}) vient de quitter le serveur.`)
        .setImage("https://c.tenor.com/A8bNTOeNznQAAAAC/tenor.gif")
        .setTimestamp()
        .setFooter({ text: "Par yatsuuw @ Discord" })

    welcomeChannel.send({ embeds: [memberLeave] });
    //console.log(`Un utilisateur vient de rejoindre.`)
})
