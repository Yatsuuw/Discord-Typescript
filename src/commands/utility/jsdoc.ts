import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { command } from '../../utils'

const meta = new SlashCommandBuilder ()
    .setName('jsdoc')
    .setDescription('Envoie la documentation de la librairie Discord.JS')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setDMPermission(false)

export default command(meta, async ({ interaction }) => {
    const jsdoc = new EmbedBuilder()
        .setTitle("Documentation de Discord.JS")
        .addFields([{ name: 'Lien', value: '[Clique ici](https://discord.js.org/#/)' }])
        .setTimestamp()
        .setFooter({ text: "Par yatsuuw @ Discord" })

    return interaction.reply({
        ephemeral: true,
        embeds: [jsdoc]
    })
})
