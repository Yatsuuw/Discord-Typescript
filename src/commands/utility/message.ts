import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { command } from '../../utils'

const meta = new SlashCommandBuilder()
    .setName('message')
    .setDescription('Envoyer un message par le bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addStringOption((option) => 
        option
            .setName('message')
            .setDescription('Message à envoyer')
            .setMinLength(1)
            .setMaxLength(2000)
            .setRequired(true)
    )

export default command(meta, ({ interaction }) => {
    const message = interaction.options.getString('message')

    interaction.reply({
        ephemeral: true,
        content: `**Message envoyé :** ${message}`
    })

    return interaction.channel?.send({
        content: message || undefined
    })
})
