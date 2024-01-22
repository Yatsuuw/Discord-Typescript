import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

interface ServerSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder ()
    .setName('channel')
    .setDescription('Administrer les paramètres d\'un salon')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false)
    .addChannelOption((option) => 
        option
            .setName('salon')
            .setDescription('Salon où l\'on veut modifier le statut.')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("statut")
            .setDescription("Choisissez la modification de statut que vous souhaitez.")
            .setRequired(true)
            .addChoices({ name: 'Lock', value: 'Lock' }, { name: 'Unlock', value: 'Unlock' }, { name: 'Slowmode', value: 'Slowmode' })
    )
    .addNumberOption((option) =>
        option
            .setName("cooldown")
            .setDescription("Temps du mode lent en secondes.")
            .setRequired(false)
    )

export default command(meta, async ({ interaction }) => {
    const guildId = interaction.guild?.id;

    db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
        if (err) {
            console.error('Erreur lors de la récupération du paramètre "logChannelId" dans la base de données.\nErreur :\n', err);
            return;
        }

        //const channel = (interaction.options.getChannel('message') || interaction.channel) as TextChannel;
        const channel_modify = interaction.options.getChannel("salon") as TextChannel;
        const key = interaction.options.getString('statut');
        //const value = interaction.options.getString('value');
        const cooldown = interaction.options.getNumber('cooldown') || 0;
        const logChannelId = row?.logChannelId;

        const lockMessage = new EmbedBuilder()
            .setTitle("Statut du salon")
            .setDescription("Le statut du salon vient d'être modifié")
            .setColor("Red")
            .addFields([
                { name: `État`, value: `Vérouillé` },
                { name: `Salon`, value: `${channel_modify}` },
            ])
            .setFooter({ text: 'Par yatsuuw @ Discord' })
            .setTimestamp()


        const unlockMessage = new EmbedBuilder()
            .setTitle("Statut du salon")
            .setDescription("Le statut du salon vient d'être modifié")
            .setColor("Green")
            .addFields([
                { name: `État`, value: `Dévérouillé` },
                { name: `Salon`, value: `${channel_modify}` },
            ])
            .setFooter({ text: 'Par yatsuuw @ Discord' })
            .setTimestamp()

        const cooldownMessageOn = new EmbedBuilder()
            .setTitle("Mode lent")
            .setDescription("Le mode lent vient d'être activé ! ✅")
            .setColor("Red")
            .addFields([
                { name: 'Temps du mode lent', value: `${cooldown} secondes` },
                { name: `Salon`, value: `${channel_modify}` },
            ])
            .setFooter({ text: "Par yatsuuw @ Discord" })
            .setTimestamp()

        const cooldownMessageOff = new EmbedBuilder()
            .setTitle("Mode lent")
            .setDescription("Le mode lent vient d'être désactivé ! ❌")
            .setColor("Green")
            .addFields([
                { name: 'Temps du mode lent', value: `${cooldown} secondes` },
                { name: `Salon`, value: `${channel_modify}` },
            ])
            .setFooter({ text: "Par yatsuuw @ Discord" })
            .setTimestamp()

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;
                //console.log(logChannel)

                if (logChannel) {
                    if (key == 'Lock') {
                        try {
                            await channel_modify.permissionOverwrites.edit(channel_modify.guild.id, { SendMessages: false });
                            await interaction.reply({
                                ephemeral: false,
                                embeds: [lockMessage]
                            })
                            const logLock = new EmbedBuilder()
                                .setTitle('Log de la commande Channel-Lock')
                                .setColor('White')
                                .setDescription(`${interaction.user.tag} a utilisé la commande \`/channel <salon> <lock>\` pour le salon ${channel_modify}`)
                                .addFields([
                                    { name: 'Utilisateur', value: `<@${interaction.user.id}>` }
                                ])
                                .setTimestamp()
                                .setFooter({ text: "Par yatsuuw @ Discord" })

                            return logChannel.send({ embeds: [logLock] })
                        } catch (error) {
                            await interaction.reply({ content: `Une erreur est survenue lors du changement d'état du salon. Erreur :\n${error}`, ephemeral: true });
                        }
                    }
                    if (key == 'Unlock') {
                        try {
                            await channel_modify.permissionOverwrites.edit(channel_modify.guild.id, { SendMessages: true });
                            await interaction.reply({
                                ephemeral: false,
                                embeds: [unlockMessage]
                            })
                            const logUnlock = new EmbedBuilder()
                                .setTitle('Log de la commande Channel-Unlock')
                                .setColor('White')
                                .setDescription(`${interaction.user.tag} a utilisé la commande \`/channel <salon> <unlock>\` pour le salon ${channel_modify}`)
                                .addFields([
                                    { name: 'Utilisateur', value: `<@${interaction.user.id}>` }
                                ])
                                .setTimestamp()
                                .setFooter({ text: "Par yatsuuw @ Discord" })

                            return logChannel.send({ embeds: [logUnlock] })
                        } catch (error) {
                            await interaction.reply({ content: `Une erreur est survelue lors du changement d'état du salon. Erreur :\n${error}`, ephemeral: true });
                        }
                    }
                    if (key == 'Slowmode') {
                        try {
                            if (cooldown == 0) {
                                await channel_modify.setRateLimitPerUser(0)
                                await interaction.reply({
                                    ephemeral: false,
                                    embeds: [cooldownMessageOff]
                                })
                                const logSlowmode = new EmbedBuilder()
                                    .setTitle('Log de la commande Channel-Slowmode')
                                    .setColor('White')
                                    .setDescription(`${interaction.user.tag} a utilisé la commande \`/channel <salon> <slowmode>\` pour le salon ${channel_modify}`)
                                    .addFields([
                                        { name: 'Utilisateur', value: `<@${interaction.user.id}>` },
                                        { name: 'Mode lent', value: `${cooldown} secondes` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "Par yatsuuw @ Discord" })

                                return logChannel.send({ embeds: [logSlowmode] })
                            } if (cooldown > 0) {
                                await channel_modify.setRateLimitPerUser(cooldown)
                                await interaction.reply({
                                    ephemeral: false,
                                    embeds: [cooldownMessageOn]
                                })
                                const logSlowmode = new EmbedBuilder()
                                    .setTitle('Log de la commande Channel-Slowmode')
                                    .setColor('White')
                                    .setDescription(`${interaction.user.tag} a utilisé la commande \`/channel <salon> <slowmode>\` pour le salon ${channel_modify}`)
                                    .addFields([
                                        { name: 'Utilisateur', value: `<@${interaction.user.id}>` },
                                        { name: 'Mode lent', value: `${cooldown} secondes` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "Par yatsuuw @ Discord" })

                                return logChannel.send({ embeds: [logSlowmode] })
                            }
                        } catch (error) {
                            await interaction.reply({ content: `Une erreur est survenue lors de l'application du cooldown. Erreur :\n${error}`, ephemeral: true });
                        }
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
