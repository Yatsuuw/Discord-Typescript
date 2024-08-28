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