import { EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { command } from '../../utils'

const meta = new SlashCommandBuilder ()
    .setName('unmute')
    .setDescription('Rendre la parole à un utilisateur')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((option) =>
        option
            .setName('target')
            .setDescription('Utilisateur qui retrouvera la parole')
            .setRequired(true)
    )

export default command(meta, async ({ interaction }) => {
    const target = (interaction.options.getMember('target') || '') as GuildMember;

    if (!target.isCommunicationDisabled()) return await interaction.reply({ content: 'Cet utilisateur a déjà retrouvé le droit à la parole !', ephemeral: true });

    const unmuteServer = new EmbedBuilder()
        .setTitle('Parole')
        .setDescription('Un nouvel utilisateur vient de retrouver son droit à la parole !')
        .setColor('Green')
        .addFields([
            { name: 'Utilisateur', value: `${target}` },
            { name: 'Staff', value: `${interaction.user.username}` },
        ])
        .setImage(target.displayAvatarURL())
        .setFooter({ text: "Par yatsuuw @ Discord" })
        .setTimestamp()

    const unmuteDm = new EmbedBuilder()
        .setTitle('Parole')
        .setDescription(`Vous venez de retrouver votre droit à la parole sur le serveur \`${target.guild.name}\`.`)
        .setColor('Green')
        .addFields([
            { name: 'Staff', value: `${interaction.user.username}` },
        ])
        .setImage(target.displayAvatarURL())
        .setFooter({ text: "Par yatsuuw @ Discord" })
        .setTimestamp()

    try {
        await target.send({ embeds: [unmuteDm] });
        await target.timeout(null);
        return await interaction.reply({ embeds: [unmuteServer] });
    } catch (error) {
        return await interaction.reply({ content: `Une erreur est survenue lors de la remise du droit à la parole. Erreur :\n${error}.`, ephemeral: true });
    }

})
