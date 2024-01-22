import { EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { command } from '../../utils'

const meta = new SlashCommandBuilder ()
    .setName('avatar')
    .setDescription('Envoie l\'avatar de l\'utilisateur visé.')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setDMPermission(false)
    .addUserOption((option) => 
        option
            .setName('target')
            .setDescription('Utilisateur à qui vous voulez récupérer l\'avatar.')
            .setRequired(true)
    )

export default command(meta, async ({ interaction }) => {
    const target = interaction.options.getMember('target') as GuildMember;

    const avatar = new EmbedBuilder()
        .setAuthor({ name: `${target.user.tag}` })
        .setColor("White")
        .setImage(target.user.displayAvatarURL({ size: 256 }))
        .setFooter({ text: `Par yatsuuw @ Discord` })

    return interaction.reply({
        ephemeral: true,
        embeds: [avatar]
    })
})
