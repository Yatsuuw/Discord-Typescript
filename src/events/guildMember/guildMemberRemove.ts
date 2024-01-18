import { EmbedBuilder, TextChannel } from 'discord.js'
import { event } from '../../utils'
import { db } from '../../utils/database'

interface ServerSettings {
    leaveChannelID?: string;
    leaveGifUrl: string;
}

export default event('guildMemberRemove', (client, member) => {
    const guildId = member.guild.id;

    db.get('SELECT leaveChannelID, leaveGifUrl from servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
        if (err) {
            console.error("Erreur lors de la récupération des paramètres du serveur : ", err);
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
                        .setDescription(`<@${member.user.id}> (${member.user.id}) vient de quitter le serveur.`)
                        .setImage(row?.leaveGifUrl || "")
                        .setTimestamp()
                        .setFooter({ text: "Par yatsuuw @ Discord" })

                    leaveChannel.send({ embeds: [memberLeave] })
                } else {
                    console.error(`Le salon de départ avec l'ID ${leaveChannelId} n'a pas été trouvé.`);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération du salon de bienvenue : ', error);
            }
        } else {
            console.error(`L'ID du salon de départ est vide dans la base de données.`);
        }

        //if (leaveGifUrl) {
            //console.log('Lien du GIF pour le message de départ : ', leaveGifUrl);
        //}
    });
});
