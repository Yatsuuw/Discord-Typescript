import { EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { command } from '../../utils'

const meta = new SlashCommandBuilder ()
    .setName('userinfo')
    .setDescription('Envoie les informations du profil d\'un utilisateur.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((option) => 
        option
            .setName('target')
            .setDescription('Utilisateur qui verra les informations de son profil récupérées.')
            .setRequired(true)
    )

export default command(meta, async ({ interaction }) => {
    const target = interaction.options.getMember('target') as GuildMember;

    const userinfo = new EmbedBuilder()
        .setAuthor({ name: `${target.displayName} (${target.id})` })
        .setColor("DarkPurple")
        .setImage(target.user.displayAvatarURL())
        .addFields([
            { name: 'Nom', value: `${target.displayName}`, inline: true },
            { name: 'Modérateur', value: `${target.kickable ? '❎' : '✅'}`, inline: true },
            { name: 'Bot', value: `${target.user.bot ? '✅' : '❎'}`, inline: true },
            { name: 'Rôles', value: `${target.roles.cache.map((role: any) => role).join(' | ').replace(' | @everyone', ' ')}` },
            { name: 'A créé son compte le', value: `<t:${Math.floor(target.user.createdTimestamp / 1000)}:f>` },
            { name: 'A rejoint le serveur le', value: target.joinedTimestamp ? `<t:${Math.floor(target.joinedTimestamp / 1000)}:f>` : 'N/A' },
        ])

    return interaction.reply({
        ephemeral: true,
        embeds: [userinfo]
    })
})
