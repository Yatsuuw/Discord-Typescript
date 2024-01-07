import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { command } from '../../utils'

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
            .setDescription("Temps du monde lent en secondes.")
            .setRequired(false)
    )

export default command(meta, async ({ interaction }) => {
    //const channel = (interaction.options.getChannel('message') || interaction.channel) as TextChannel;
    const channel_modify = interaction.options.getChannel("salon") as TextChannel;
    const key = interaction.options.getString('statut');
    //const value = interaction.options.getString('value');
    const cooldown = interaction.options.getNumber('cooldown') || 0;

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

    if (key == 'Lock')
        try {
            await channel_modify.permissionOverwrites.edit(channel_modify.guild.id, { SendMessages: false });
            return await interaction.reply({
                ephemeral: false,
                embeds: [lockMessage]
            })
        } catch (error) {
            return await interaction.reply({ content: `Une erreur est survenue lors du changement d'état du salon. Erreur :\n${error}`, ephemeral: true });
        }
    if (key == 'Unlock')
        try {
            await channel_modify.permissionOverwrites.edit(channel_modify.guild.id, { SendMessages: true });
            return await interaction.reply({
                ephemeral: false,
                embeds: [unlockMessage]
            })
        } catch (error) {
            return await interaction.reply({ content: `Une erreur est survelue lors du changement d'état du salon. Erreur :\n${error}`, ephemeral: true });
        }
    if (key == 'Slowmode')
        try {
            if (cooldown == 0) {
                await channel_modify.setRateLimitPerUser(0)
                return await interaction.reply({
                    ephemeral: false,
                    embeds: [cooldownMessageOff]
                })
            } if (cooldown > 0) {
                await channel_modify.setRateLimitPerUser(cooldown)
                return await interaction.reply({
                    ephemeral: false,
                    embeds: [cooldownMessageOn]
                })
            }
        } catch (error) {
            return await interaction.reply({ content: `Une erreur est survenue lors de l'application du cooldown. Erreur :\n${error}`, ephemeral: true });
        }
})
