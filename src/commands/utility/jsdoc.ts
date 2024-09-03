import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { command } from '../../utils'

const meta = new SlashCommandBuilder ()
    .setName('jsdoc')
    .setDescription('Sends the documentation for the Discord.JS library')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setDMPermission(true)

export default command(meta, async ({ interaction }) => {
    const jsdoc = new EmbedBuilder()
        .setTitle("Discord.JS documentation")
        .addFields([{ name: 'Link', value: '[Click here](https://discord.js.org/#/)' }])
        .setTimestamp()
        .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })

    return interaction.reply({
        ephemeral: true,
        embeds: [jsdoc]
    })
})
