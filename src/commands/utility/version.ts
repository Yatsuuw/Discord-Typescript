import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import { command } from '../../utils'
import keys from '../../keys'

const meta = new SlashCommandBuilder()
    .setName('version')
    .setDescription('Development version of the bot.')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setDMPermission(true)

export default command(meta, async({ interaction, client }) => {

    const linkButton = new ButtonBuilder()
        .setLabel('Paper Website')
        .setURL('https://yatsuu.fr/')
        .setStyle(ButtonStyle.Link);

    const topggButton = new ButtonBuilder()
        .setLabel('Top.gg')
        .setURL('https://top.gg/bot/1219725345616564254')
        .setStyle(ButtonStyle.Link)

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(linkButton, topggButton)

    const version = new EmbedBuilder()
        .setTitle("Version")
        .setDescription("Development version of the bot.")
        .setColor('DarkAqua')
        .setThumbnail(client.user?.displayAvatarURL() || null)
        .addFields([
            { name: `Version ${keys.version}`, value: '→ End of the 1.2 version development phase of the bot.\n→ Addition of details about the servers in the console errors.\n→ Voice channels system added.\n→ Tickets system added.\n→ A few optimisations have been made.' },
            { name: 'Note', value: `If you have any comments about the bot, please contact <@${keys.ownerId}>.` }
        ])
        .setTimestamp()
        .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })

    return await interaction.reply({
        ephemeral: true,
        embeds: [version],
        components: [row]
    });

});
