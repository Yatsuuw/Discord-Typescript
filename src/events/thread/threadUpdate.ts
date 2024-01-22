import { EmbedBuilder, TextChannel, ThreadChannel } from 'discord.js';
import { event } from '../../utils';
import { db } from '../../utils/database';

interface ServerSettings {
    logChannelId?: string;
}

export default event('threadUpdate', async (client, oldThread: ThreadChannel<boolean>, newThread: ThreadChannel<boolean>) => {
    const guildId = newThread.guild?.id;
    const ownerId = newThread.ownerId;

    db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
        if (err) {
            console.error('Erreur lors de la récupération des paramètres du serveur :', err);
            return;
        }

        // Vérifier si le thread est désarchivé
        if (oldThread.archived && !newThread.archived) {
            const logChannelId = row?.logChannelId;

            if (logChannelId) {
                try {
                    const logChannel = newThread.guild?.channels.cache.get(logChannelId) as TextChannel;

                    if (logChannel) {
                        const threadUpdateLog = new EmbedBuilder()
                            .setTitle('Thread')
                            .setColor('DarkVividPink')
                            .addFields([
                                {
                                    name: 'Action',
                                    value: `Le thread \`${newThread.name}\` a été désarchivé par <@${ownerId}> (\`${ownerId}\`).\nJe l'ai donc rejoint à nouveau.`
                                }
                            ])
                            .setTimestamp()
                            .setFooter({ text: 'Par yatsuuw @ Discord' });

                        // Rejoindre automatiquement le thread lors de sa désarchivation, puis le log
                        if (newThread.isTextBased()) {
                            newThread.join().then(() => {
                                logChannel.send({ embeds: [threadUpdateLog] });
                                //console.log(`Le bot a rejoint le thread : ${newThread.name}.`);
                            }).catch((error) => {
                                console.error(`Erreur lors de la tentative de rejoindre le thread : ${newThread.name}. Erreur : ${error}`);
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
        }

        // Vérifier si le nom du thread a été modifié
        if (oldThread.name !== newThread.name) {
            const logChannelId = row?.logChannelId;

            if (logChannelId) {
                try {
                    const logChannel = newThread.guild?.channels.cache.get(logChannelId) as TextChannel;

                    if (logChannel) {
                        const threadUpdateLog = new EmbedBuilder()
                            .setTitle('Thread')
                            .setColor('DarkVividPink')
                            .addFields([
                                {
                                    name: 'Action',
                                    value: `Le thread \`${oldThread.name}\` a été renommé en \`${newThread.name}\` par <@${ownerId}> (\`${ownerId}\`).`
                                }
                            ])
                            .setTimestamp()
                            .setFooter({ text: 'Par yatsuuw @ Discord' });

                        logChannel.send({ embeds: [threadUpdateLog] });
                    } else {
                        console.error(`Le salon des logs avec l'ID ${logChannelId} n'a pas été trouvé.`);
                    }
                } catch (error) {
                    console.error(`Erreur de la récupération du salon des logs : `, error);
                }
            } else {
                console.error(`L'ID du salon des logs est vide dans la base de données.`);
            }
        }

        if (oldThread.rateLimitPerUser !== newThread.rateLimitPerUser) {
            const logChannelId = row?.logChannelId;

            if (logChannelId) {
                try {
                    const logChannel = newThread.guild?.channels.cache.get(logChannelId) as TextChannel;

                    if (logChannel) {
                        const threadUpdateLog = new EmbedBuilder()
                            .setTitle('Thread')
                            .setColor('DarkVividPink')
                            .addFields([
                                {
                                    name: 'Action',
                                    value: `Le délai entre les messages dans le thread \`${newThread.name}\` est passé de \`${oldThread.rateLimitPerUser} secondes\` à \`${newThread.rateLimitPerUser} secondes\`.`
                                }
                            ])
                            .setTimestamp()
                            .setFooter({ text: 'Par yatsuuw @ Discord' });

                        logChannel.send({ embeds: [threadUpdateLog] });
                    } else {
                        console.error(`Le salon des logs avec l'ID ${logChannelId} n'a pas été trouvé.`);
                    }
                } catch (error) {
                    console.error(`Erreur de la récupération du salon des logs : `, error);
                }
            } else {
                console.error(`L'ID du salon des logs est vide dans la base de données.`);
            }
        }

        if (oldThread.archiveTimestamp !== newThread.archiveTimestamp) {
            const logChannelId = row?.logChannelId;

            if (logChannelId) {
                try {
                    const logChannel = newThread.guild?.channels.cache.get(logChannelId) as TextChannel;

                    if (logChannel) {

                        const threadUpdateLog = new EmbedBuilder()
                            .setTitle('Thread')
                            .setColor('DarkVividPink')
                            .addFields([
                                {
                                    name: 'Action',
                                    value: `Le délai entre l'archivage et la suppression automatique du thread \`${newThread.name}\` est passé de \`indéfini\` à \`indéfini\`.`
                                }
                            ])
                            .setTimestamp()
                            .setFooter({ text: 'Par yatsuuw @ Discord' });

                        logChannel.send({ embeds: [threadUpdateLog] });
                    } else {
                        console.error(`Le salon des logs avec l'ID ${logChannelId} n'a pas été trouvé.`);
                    }
                } catch (error) {
                    console.error(`Erreur de la récupération du salon des logs : `, error);
                }
            } else {
                console.error(`L'ID du salon des logs est vide dans la base de données.`);
            }
        }
    })
});
