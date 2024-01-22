import { GuildMember, SlashCommandBuilder, Collection, Message, TextChannel, EmbedBuilder, PermissionFlagsBits } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

interface ServerSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder ()
    .setName('clear')
    .setDescription('Supprimer un nombre de messages déterminé')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addChannelOption((option) => 
        option
            .setName('channel')
            .setDescription('Salon où les messages seront supprimés')
            .setRequired(true)
    )
    .addIntegerOption((option) => 
        option
            .setName('number')
            .setDescription('Nombre de messages à supprimer')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(50)
    )
    .addUserOption((option) =>
        option
            .setName('target')
            .setDescription('Utilisateur qui verra ses messages être supprimés')
            .setRequired(false)
    )

export default command(meta, async ({ interaction }) => {
    const guildId = interaction.guild?.id;

    db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
        if (err) {
            console.error('Erreur lors de la récupération du paramètre "logChannelId" dans la base de données.\nErreur :\n', err);
            return;
        }

        //console.log("Commande clear exécutée");
        const amount = interaction.options.getInteger("number")!;
        //console.log('Amount:', amount);
        const channel = (interaction.options.getChannel("channel") || interaction.channel) as TextChannel;
        const target = interaction.options.getMember("target") as GuildMember;
        const logChannelId = row?.logChannelId;

        if (amount < 1 || amount > 100)
            return interaction.reply("Vous ne pouvez pas renseigner un nombre inférieur à 1 ou supérieur à 100.");

        const messages: Collection<string, Message<true>> = await channel.messages.fetch();

        var filterMessages = target ? messages.filter(m => m.author.id === target.id) : messages;
        let deleted = 0

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;
                //console.log(logChannel)

                if (logChannel) {
                    try {
                        try {
                            deleted = (await channel.bulkDelete(Array.from(filterMessages.keys()).slice(0, amount), true)).size;
                        } catch (error) {
                            return interaction.reply({ content: `Une erreur s'est produite lors de la suppression des messages !\n${error}`, ephemeral: true });
                        }
                
                        if (deleted > 1) {
                            let deletedMessages = `${deleted} messages`;
                            const clearMessage = new EmbedBuilder()
                                .setTitle("Clear")
                                .setColor("Green")
                                .setDescription(`Des messages ont été effacés dans le salon.`)
                                .addFields([
                                    { name: 'Nombre', value: `${deletedMessages}` }
                                ])
                                .setTimestamp()
                                .setFooter({ text: "Par yatsuuw @ Discord" })
                    
                            await interaction.reply({ embeds: [clearMessage], ephemeral: true });
                        }
                        if (deleted < 2) {
                            let deletedMessages = `${deleted} message`;
                            const clearMessage = new EmbedBuilder()
                                .setTitle("Clear")
                                .setColor("Green")
                                .setDescription(`Des messages ont été effacés dans le salon.`)
                                .addFields([
                                    { name: 'Nombre', value: `${deletedMessages}` }
                                ])
                                .setTimestamp()
                                .setFooter({ text: "Par yatsuuw @ Discord" })
                    
                            await interaction.reply({ embeds: [clearMessage], ephemeral: true });
                        }
                    } catch (error) {
                        await interaction.reply({ content: `Une erreur est survenue lors de la suppression du contenu. Erreur :\n${error}` });
                    }

                    if (amount > 1 && deleted > 1 || deleted === 0) {
                        const logClear = new EmbedBuilder()
                            .setTitle("Log de la commande Clear")
                            .setColor('DarkOrange')
                            .setDescription(`${interaction.user.tag} a utilisé la commande \`/clear\` dans le salon <#${interaction.channel?.id}>`)
                            .addFields([
                                { name: 'Utilisateur', value: `<@${interaction.user.id}>` },
                                { name: 'Nombre de messages', value: `${amount} messages à supprimer, ${deleted} ont été supprimés` }
                            ])
                            .setTimestamp()
                            .setFooter({ text: "Par yatsuuw @ Discord" })

                        return logChannel.send({ embeds: [logClear] })
                    }
                    if (amount > 1 && deleted < 2 && deleted > 0) {
                        const logClear = new EmbedBuilder()
                            .setTitle("Log de la commande Clear")
                            .setColor('DarkOrange')
                            .setDescription(`${interaction.user.tag} a utilisé la commande \`/clear\` dans le salon <#${interaction.channel?.id}>`)
                            .addFields([
                                { name: 'Utilisateur', value: `<@${interaction.user.id}>` },
                                { name: 'Nombre de messages', value: `${amount} messages à supprimer, ${deleted} a été supprimé` }
                            ])
                            .setTimestamp()
                            .setFooter({ text: "Par yatsuuw @ Discord" })

                        return logChannel.send({ embeds: [logClear] })
                    }
                    if (amount < 2 && deleted < 2) {
                        const logClear = new EmbedBuilder()
                            .setTitle("Log de la commande Clear")
                            .setColor('DarkOrange')
                            .setDescription(`${interaction.user.tag} a utilisé la commande \`/clear\` dans le salon <#${interaction.channel?.id}>`)
                            .addFields([
                                { name: 'Utilisateur', value: `<@${interaction.user.id}>` },
                                { name: 'Nombre de messages', value: `${amount} message à supprimer, ${deleted} a été supprimé` }
                            ])
                            .setTimestamp()
                            .setFooter({ text: "Par yatsuuw @ Discord" })

                        return logChannel.send({ embeds: [logClear] })
                    }
                } else {
                    console.error(`Le salon des logs avec l'ID ${logChannelId} n'a pas été trouvé.`);
                }
            } catch (error) {
                console.error(`Erreur de la récupération du salon des logs : `, error);
            }
        } else {
            console.error(`L'ID du salon des logs est vide dans la base de données.`)
        }
    });
});
