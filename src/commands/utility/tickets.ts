import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { command } from '../../utils/command';

const meta = new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Create a message to open tickets.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)

export default command(meta, async ({ interaction }) => {
    const embed = new EmbedBuilder()
        .setTitle('Ticket System')
        .setDescription('Click on one of the buttons below to open a ticket.')
        .setColor('Blue')
        .setTimestamp()
        .setFooter({ text: 'By yatsuuw @ Discord', iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })

    const buttons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_ticket')
                .setLabel('Open a help ticket')
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId('suggestion_ticket')
                .setLabel('Open a suggestion ticket')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.channel?.send({ embeds: [embed], components: [buttons] });
    await interaction.reply({ content: 'The message to open the tickets has been sent successfully.', ephemeral: true });
});