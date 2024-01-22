import { EmbedBuilder, ThreadChannel, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

interface ServerSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder ()
    .setName('thread')
    .setDescription('Permet la gestion des fils de discussion')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addStringOption(option =>
        option
            .setName("event")
            .setDescription("Action à donner à faire au bot")
            .setRequired(true)
            .addChoices(
                { name: 'Rejoindre', value: 'join' },
                { name: 'Quitter', value: 'leave' },
                { name: 'Archiver', value: 'archive' },
                { name: 'Désarchiver', value: 'unarchive' },
                { name: 'Supprimer', value: 'delete' }
            )
    )

export default command(meta, async ({ interaction }) => {
    const guildId = interaction.guild?.id;

    db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
        if (err) {
            console.error('Erreur lors de la récupération du paramètre "logChannelId" dans la base de données.\nErreur :\n', err);
            return;
        }

        const logChannelId = row?.logChannelId;

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;

                if (logChannel) {
                    try {
                        const key = interaction.options.getString('event');
                        const thread = interaction.channel;

                        if (!thread?.isThread()) return interaction.reply({ content: 'Impossible de saisir cette commande. Vous ne vous trouvez pas dans un thread.', ephemeral: true });
                        await thread.join()

                        if (key === "join") {
                            try {
                                const joinThread = new EmbedBuilder()
                                    .setTitle('Thread')
                                    .setColor('Green')
                                    .addFields([
                                        { name: 'Action', value: `Je viens de rejoindre le thread \`${thread.name}\` ! ✅` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "Par yatsuuw @ Discord" })

                                const threadLog = new EmbedBuilder()
                                    .setTitle('Thread')
                                    .setColor('White')
                                    .addFields([
                                        { name: 'Action', value: `Je viens de rejoindre le thread \`${thread.name}\` ! ✅` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "Par yatsuuw @ Discord" })

                                if (thread.joinable) await thread.join();
                                await interaction.reply({ embeds: [joinThread] });
                                // Log l'événement Thread Join
                                logChannel.send({ embeds: [threadLog] })
                            } catch (error) {
                                return await interaction.reply({ content: `Je n'ai pas réussi à rejoindre le thread. Erreur :\n${error}`, ephemeral: true });
                            };
                        };

                        if (key === "leave") {
                            try {
                                const leaveThread = new EmbedBuilder()
                                    .setTitle('Thread')
                                    .setColor('Red')
                                    .addFields([
                                        { name: 'Action', value: `Je viens de quitter le thread \`${thread.name}\` ! ✅` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "Par yatsuuw @ Discord" })

                                const threadLog = new EmbedBuilder()
                                    .setTitle('Thread')
                                    .setColor('DarkRed')
                                    .addFields([
                                        { name: 'Action', value: `Je viens de quitter le thread \`${thread.name}\` ! ✅` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "Par yatsuuw @ Discord" })

                                await interaction.reply({ embeds: [leaveThread] });
                                await thread.leave();
                                // Log l'événement Thread Leave
                                logChannel.send({ embeds: [threadLog] })
                            } catch (error) {
                                interaction.reply({ content: `Je n'ai pas réussi à quitter le thread. Erreur :\n${error}`, ephemeral: true });
                            };
                        };

                        if (key === "archive") {
                            try {
                                const archiveThread = new EmbedBuilder()
                                    .setTitle('Thread')
                                    .setColor('Grey')
                                    .addFields([
                                        { name: 'Action', value: `Je viens d'archiver le thread \`${thread.name}\` ! ✅` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "Par yatsuuw @ Discord" })

                                const threadLog = new EmbedBuilder()
                                    .setTitle('Thread')
                                    .setColor('DarkAqua')
                                    .addFields([
                                        { name: 'Action', value: `Je viens d'archiver le thread \`${thread.name}\` ! ✅` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "Par yatsuuw @ Discord" })

                                await interaction.reply({ embeds: [archiveThread] });
                                await thread.setArchived(true);
                                // Log l'événement Thread Archive
                                logChannel.send({ embeds: [threadLog] })
                            } catch (error) {
                                interaction.reply({ content: `Je n'ai pas réussi à archiver le thread. Erreur :\n${error}`, ephemeral: true });
                            };
                        };

                        if (key === "unarchive") {
                            try {
                                const unarchiveThread = new EmbedBuilder()
                                    .setTitle("Thread")
                                    .setColor('DarkGrey')
                                    .addFields([
                                        { name: 'Action', value: `Je viens de désarchiver le thread \`${thread.name}\` ! ✅` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "Par yatsuuw @ Discord" })

                                const threadLog = new EmbedBuilder()
                                    .setTitle("Thread")
                                    .setColor('Aqua')
                                    .addFields([
                                        { name: 'Action', value: `Je viens de désarchiver le thread \`${thread.name}\` ! ✅` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "Par yatsuuw @ Discord" })

                                await thread.setArchived(false);
                                await interaction.reply({ embeds: [unarchiveThread] });
                                // Log l'événement Thread Unarchive
                                logChannel.send({ embeds: [threadLog] })
                            } catch (error) {
                                interaction.reply({ content: `Je n'ai pas réussi à désarchiver le thread. Erreur :\n${error}`, ephemeral: true });
                            };
                        };

                        if (key === "delete") {
                            try {
                                const deleteThread = new EmbedBuilder()
                                    .setTitle("Thread")
                                    .setColor('DarkGrey')
                                    .addFields([
                                        { name: 'Action', value: `Je viens de supprimer le thread \`${thread.name}\` ! ✅` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "Par yatsuuw @ Discord" })

                                const threadLog = new EmbedBuilder()
                                    .setTitle("Thread")
                                    .setColor('LightGrey')
                                    .addFields([
                                        { name: 'Action', value: `Je viens de supprimer le thread \`${thread.name}\` ! ✅` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "Par yatsuuw @ Discord" })

                                await interaction.reply({ embeds: [deleteThread] });
                                await thread.delete();
                                // Log l'événement Thread Delete
                                logChannel.send({ embeds: [threadLog] })
                            } catch (error) {
                                interaction.reply({ content: `Je n'ai pas réussi à supprimer le thread. Erreur :\n${error}`, ephemeral: true });
                            };
                        };
                    } catch (error) {
                        await interaction.reply({ content: `Une erreur s'est produite lors de l'exécution de la commande.\n${error}`, ephemeral: true });
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