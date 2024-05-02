import { EmbedBuilder, TextChannel } from 'discord.js'
import { event } from '../../utils'
import { db } from '../../utils/database'

interface ServerSettings {
    leaveChannelID?: string;
    leaveGifUrl: string;
}

export default event('guildMemberRemove', (client, member) => {
    const guildId = member.guild.id;
    const guildName = member.guild?.name;

    db.get('SELECT leaveChannelID, leaveGifUrl FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
        if (err) {
            console.error(`Erreur lors de la récupération des paramètres leaveChannelId et leaveGifUrl pour le serveur ${guildName} (${guildId}) : `, err);
            return;
        }

        const leaveChannelId = row?.leaveChannelID;
        const leaveGifUrl = row?.leaveGifUrl;

        //console.log("ID du salon de départ récupéré depuis la base de données : ", leaveChannelId);

        if (leaveChannelId) {
            try {
                const leaveChannel = member.guild.channels.cache.get(leaveChannelId) as TextChannel;

                if (leaveChannel) {
                    const memberLeave = new EmbedBuilder()
                        .setTitle(`${member.user.tag}`)
                        .setColor("Red")
                        .setDescription(`<@${member.user.id}> (${member.user.id}) has just left the server.\nWe are now \`${member.guild.memberCount}\` on the server.`)
                        .setImage(leaveGifUrl || "")
                        .setTimestamp()
                        .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://yatsuu.fr/wp-content/uploads/2024/04/cropped-logo-50x50.webp' })

                    leaveChannel.send({ embeds: [memberLeave] })
                } else {
                    console.error(`The departure channel with ID ${leaveChannelId} was not found for server ${guildName} (${guildId}).`);
                }
            } catch (error) {
                console.error(`Error retrieving the welcome channel for the ${guildName} server (${guildId}). Error : `, error);
            }
        } else {
            console.error(`The departure channel ID is empty in the database for the ${guildName} server (${guildId}).`);
        }

        //if (leaveGifUrl) {
            //console.log('Lien du GIF pour le message de départ : ', leaveGifUrl);
        //}
    });
});
