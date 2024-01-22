import { EmbedBuilder, TextChannel, ThreadChannel } from 'discord.js';
import { event } from '../../utils';
import { db } from '../../utils/database';

interface ServerSettings {
    logChannelId?: string;
}

export default event('threadCreate', async (client, thread: ThreadChannel<boolean>) => {
    const guildId = thread.guild?.id;
    const ownerId = thread.ownerId;

    db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
        if (err) {
            console.error('Erreur lors de la récupération des paramètres du serveur :', err);
            return;
        }

        const logChannelId = row?.logChannelId;

        if (logChannelId) {
            try {
                const logChannel = thread.guild?.channels.cache.get(logChannelId) as TextChannel;

                if (logChannel) {
                    const threadCreateLog = new EmbedBuilder()
                        .setTitle('Thread')
                        .setColor('DarkOrange')
                        .setDescription(`Le membre <@${ownerId}> (${ownerId}) a créé le thread \`${thread.name}\`.\nJe l'ai rejoint automatiquement.`)
                        .setTimestamp()
                        .setFooter({ text: "Par yatsuuw @ Discord" });

                    // Rejoindre automatiquement le thread lors de sa création, puis le log
                    if (thread.isTextBased()) {
                        thread.join().then(() => {
                            logChannel.send({ embeds: [threadCreateLog] });
                            console.log(`Le bot a rejoint le thread : ${thread.name}.`);
                        }).catch((error) => {
                            console.error(`Erreur lors de la tentative de rejoindre le thread : ${thread.name}. Erreur : ${error}`);
                        });
                    } else {
                        console.error('Le thread n\'est pas textuel.');
                    }
                } else {
                    console.error(`Le salon des logs avec l'ID ${logChannelId} n'a pas été trouvé.`);
                }
            } catch (error) {
                console.error(`Erreur de la récupération du salon des logs : `, error);
            }
        } else {
            console.error(`L'ID du salon des logs est vide dans la base de données.`);
        }
    });
});
