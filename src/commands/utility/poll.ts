import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { command } from '../../utils'

const meta = new SlashCommandBuilder ()
    .setName('sondage')
    .setDescription('Démarrer un sondage')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addStringOption((option) => 
        option
            .setName('question')
            .setDescription('Posez votre question')
            .setMinLength(1)
            .setMaxLength(2000)
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('reponses')
            .setDescription('Listez votre réponses en les séparant avec des guillemets ("  ").')
            .setMinLength(1)
            .setMaxLength(2000)
            .setRequired(true)
    )

export default command(meta, async ({ interaction }) => {
    const question = interaction.options.getString('question')
    const reponses = interaction.options.getString('reponses')
    const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
    const regex = /"([^"]*)"/g
    const matches = interaction.options.getString("reponses")?.match(regex)

    const sondageMessage = new EmbedBuilder()
        .setTitle(question)
        .setColor("Orange")
        .setDescription("Veuillez réagir avec l'une des réactions ci-dessous.\nLes réactions sont dans le même ordre que les réponses.")
        .addFields([
            { name: 'Réponses possibles', value: `${matches?.map(res => `-> ${res?.replace("\"", "")}`).join("\n")}` },
        ])
        .setTimestamp()
        .setFooter({ text: `Par yatsuuw @ Discord | Sondage généré par ${interaction.user.username}.` })

        try {
            if (!matches || matches.length < 2) {
                return await interaction.reply({ content: "Il faut minimum deux réponses pour faire un sondage.", ephemeral: true });
            } else {
                const envoieSondage = await interaction.reply({ embeds: [sondageMessage] });

                const sondageMessageSent = await interaction.fetchReply();
        
                for (let i = 0; i < emojis.length && i < matches.length; i++)
                    await sondageMessageSent.react(emojis[i])
            }
        } catch (error) {
            return await interaction.reply({ content: `Une erreur est survenue lors de l'envoi du sondage. Erreur :\n${error}`, ephemeral: true });
        }
        
});