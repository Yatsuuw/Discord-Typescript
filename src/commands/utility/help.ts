import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { command } from '../../utils'
import { getCategoryRoot } from '../../pages/help'

const meta = new SlashCommandBuilder ()
    .setName('help')
    .setDescription('Obtenir une liste des commandes du bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setDMPermission(false)

export default command(meta, ({ interaction }) => {
    return interaction.reply(getCategoryRoot(true))
})
