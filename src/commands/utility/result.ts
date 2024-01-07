import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { command } from '../../utils'

const meta = new SlashCommandBuilder ()
    .setName('result')
    .setDescription('Envoie le résultat d\'une rencontre sportive ou e-sport.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addStringOption((option) => 
        option
            .setName('team-1')
            .setDescription('Nom de la première équipe.')
            .setMinLength(1)
            .setMaxLength(50)
            .setRequired(true)
    )
    .addStringOption((option) => 
        option
            .setName('composition-1')
            .setDescription('Composition de la première équipe.')
            .setMinLength(1)
            .setMaxLength(50)
            .setRequired(true)
    )
    .addStringOption((option) => 
        option
            .setName('team-2')
            .setDescription('Nom de la deuxième équipe.')
            .setMinLength(1)
            .setMaxLength(50)
            .setRequired(true)
    )
    .addStringOption((option) => 
        option
            .setName('composition-2')
            .setDescription('Composition de la deuxième équipe.')
            .setMinLength(1)
            .setMaxLength(50)
            .setRequired(true)
    )
    .addStringOption((option) => 
        option
            .setName('score')
            .setDescription('Résultat final de la rencontre.')
            .setMinLength(1)
            .setMaxLength(50)
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('embed-color')
            .setDescription('Si la victoire est à vous, prenez victoire ! Si la défaite est à vous, prenez défaite :(.')
            .setRequired(true)
            .addChoices({ name: 'Victoire', value: 'Victoire' }, { name: 'Défaite', value: 'Défaite' })
    )
    .addStringOption((option) => 
        option
            .setName('commentaire')
            .setDescription('Ajouter un commentaire à la rencontre (100 caractères maximum)')
            .setMinLength(1)
            .setMaxLength(100)
            .setRequired(false)
    )

export default command(meta, async ({ interaction }) => {
    const team1 = interaction.options.getString('team-1')
    const team2 = interaction.options.getString('team-1')
    const composition1 = interaction.options.getString('team-1')
    const composition2 = interaction.options.getString('team-1')
    const score = interaction.options.getString('team-1')
    const commentaire = interaction.options.getString('commentaire') || 'Pas de commentaire';
    const key = interaction.options.getString('embed-color')

    const mdt = new EmbedBuilder()
        .setTitle("Résultat de la rencontre")
        .addFields([
            { name: 'Team 1 :', value: `${team1}`, inline: true },
            { name: 'Team 2 :', value: `${team2}`, inline: true },
            { name: 'Composition de l\'équipe 1 :', value: `${composition1}`, inline: true },
            { name: 'Composition de l\'équipe 2 : ', value: `${composition2}`, inline: true },
            { name: 'Score de la rencontre :', value: `${score}`, inline: true },
            { name: 'Commentaire :', value: `${commentaire}`, inline: true },
        ])
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: 'Par yatsuuw @ Discord', iconURL: interaction.user.displayAvatarURL() })

    try {
        if (key == "Victoire")
            mdt.setColor("Green")
        if (key == "Défaite")
            mdt.setColor("Red")

        interaction.deferReply();
        setTimeout(() => interaction.deleteReply());
        return await interaction.channel?.send({
            embeds: [mdt]
        })
    } catch (error) {
        return await interaction.reply({ content: `Une erreur est survenue lors de l\'envoi du résultat de la rencontre. Erreur :\n${error}` });
    }
});
