import { EmbedBuilder, TextChannel } from 'discord.js';
import { event } from '../../utils';
import { db } from '../../utils/database';

interface ServerSettings {
    welcomeChannelID?: string;
    welcomeGifUrl?: string;
}

export default event('guildMemberAdd', async (client, member) => {
    const guildId = member.guild.id;

    db.get('SELECT welcomeChannelID, welcomeGifUrl FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
        if (err) {
            console.error('Erreur lors de la récupération des paramètres du serveur :', err);
            return;
        }

        const welcomeChannelId = row?.welcomeChannelID;
        const welcomeGifUrl = row?.welcomeGifUrl;

        //console.log('ID du salon de bienvenue récupéré depuis la base de données :', welcomeChannelId);

        if (welcomeChannelId) {
            try {
                const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId) as TextChannel;

                if (welcomeChannel) {
                    const memberJoin = new EmbedBuilder()
                        .setTitle(`${member.user.tag}`)
                        .setColor("Green")
                        .setDescription(`<@${member.user.id}> vient de rejoindre le serveur.`)
                        .setImage(row?.welcomeGifUrl || "")
                        .setTimestamp()
                        .setFooter({ text: "Par yatsuuw @ Discord" });

                    welcomeChannel.send({ embeds: [memberJoin] });
                } else {
                    console.error(`Le salon de bienvenue avec l'ID ${welcomeChannelId} n'a pas été trouvé.`);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération du salon de bienvenue :', error);
            }
        } else {
            console.error(`L'ID du salon de bienvenue est vide dans la base de données.`);
        }

        //if (welcomeGifUrl) {
            //console.log('Lien du GIF pour le message de d\'arrivée : ', welcomeGifUrl);
        //}
    });
});
