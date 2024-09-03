import { EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { command } from '../../utils'

const meta = new SlashCommandBuilder ()
    .setName('avatar')
    .setDescription('Sends the target user\'s avatar.')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setDMPermission(false)
    .addUserOption((option) => 
        option
            .setName('target')
            .setDescription('The user whose avatar you want to retrieve.')
            .setRequired(true)
    )

export default command(meta, async ({ interaction }) => {
    const target = interaction.options.getMember('target') as GuildMember;

    const avatar = new EmbedBuilder()
        .setAuthor({ name: `${target.user.tag}` })
        .setColor("White")
        .setImage(target.user.displayAvatarURL({ size: 4096 }))
        .setFooter({ text: `By yatsuuw @ Discord`, iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })

    return interaction.reply({
        ephemeral: true,
        embeds: [avatar]
    });
});
