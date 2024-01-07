import { EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { command } from '../../utils'
import ms from 'ms'

const meta = new SlashCommandBuilder ()
    .setName('mute')
    .setDescription('Retirer la parole à un utilisateur')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((option) =>
        option
            .setName('target')
            .setDescription('Utilisateur qui va perdre le droit à la parole')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('reason')
            .setDescription('Raison de la perte du droit à la parole')
            .setRequired(false)
    )
    .addStringOption((option) =>
        option
            .setName('duration')
            .setDescription('Durée de la perte du droit à la parole (renseignez les unités temporelles !)')
            .setRequired(false)
    )

export default command(meta, async ({ interaction }) => {
    const target = (interaction.options.getMember('target') || '') as GuildMember;
    const duration = interaction.options.getString('duration') || '1';
    const convertedTime = ms(duration);
    const reason = interaction.options.getString('reason') || 'No reason';

    if (!target.moderatable) return await interaction.reply({ content: 'Cet utilisateur ne peut pas être rendu muet !', ephemeral: true });
    if (!convertedTime) return await interaction.reply({ content: 'Spécifie une durée valide !', ephemeral: true });

    const muteServer = new EmbedBuilder()
        .setTitle("Parole")
        .setDescription("Malheureusement, un nouvel utilisateur vient de perdre son droit de parole !")
        .setColor("Red")
        .addFields([
            { name: `Utilisateur`, value: `${target}` },
            { name: `Durée`, value: `${duration} `},
            { name: `Raison`, value: `${reason}` }
        ])
        .setImage(target.displayAvatarURL())
        .setFooter({ text: "Par yatsuuw @ Discord" })
        .setTimestamp()

    const muteDm = new EmbedBuilder()
        .setTitle("Parole")
        .setDescription(`Vous venez de perdre la parole sur le serveur \`${target.guild.name}\`.`)
        .setColor("Red")
        .addFields([
            { name: 'Raison :', value: `${reason}` },
            { name: 'Durée', value: `${duration}` }
        ])
        .setImage(target.displayAvatarURL())
        .setFooter({ text: 'Par yatsuuw @ Discord' })
        .setTimestamp()

    try {
        await target.timeout(convertedTime, reason);
        await target.send({ embeds: [muteDm] });
        return await interaction.reply({ embeds: [muteServer] });
    } catch (error) {
        return await interaction.reply({ content: `Une erreur est survenue lors du mute. Erreur :\n${error}`, ephemeral: true });
    }

})
