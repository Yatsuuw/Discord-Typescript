import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

interface ServerSettings {
    logChannelId?: string,
}

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
            .setDescription('Résultat final de la rencontre. Le score est dans le sens Team1 - Team2.')
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
    const guildId = interaction.guild?.id;

    db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
        if (err) {
            console.error('Erreur lors de la récupération du paramètre "logChannelId" dans la base de données.\nErreur :\n', err);
            return;
        }

        const team1 = interaction.options.getString('team-1')
        const team2 = interaction.options.getString('team-2')
        const composition1 = interaction.options.getString('team-1')
        const composition2 = interaction.options.getString('team-2')
        const score = interaction.options.getString('score')
        const commentaire = interaction.options.getString('commentaire') || 'Pas de commentaire';
        const key = interaction.options.getString('embed-color')
        const logChannelId = row?.logChannelId;
        //console.log(logChannelId);

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

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;
                //console.log(logChannel)

                if (logChannel) {
                    try {
                        if (key == "Victoire")
                            mdt.setColor("Green")
                        if (key == "Défaite")
                            mdt.setColor("Red")
            
                        interaction.deferReply();
                        setTimeout(() => interaction.deleteReply());
                        await interaction.channel?.send({
                            embeds: [mdt]
                        })
                    } catch (error) {
                        await interaction.reply({ content: `Une erreur est survenue lors de l\'envoi du résultat de la rencontre. Erreur :\n${error}` });
                    }

                    const logResult = new EmbedBuilder()
                        .setTitle('Log de la commande Result')
                        .setColor('Navy')
                        .setDescription(`${interaction.user.tag} a utilisé la commande \`/result\` dans le salon <#${interaction.channel?.id}>`)
                        .addFields([
                            { name: 'Utilisateur', value: `<@${interaction.user.id}>` },
                            { name: 'Résultat', value: `${score}` },
                            { name: 'Équipes', value: `${team1} - ${team2}` },
                            { name: 'Commentaire', value: `${commentaire}` }
                        ])
                        .setTimestamp()
                        .setFooter({ text: "Par yatsuuw @ Discord" })

                    return logChannel.send({ embeds: [logResult] })
                } else {
                    console.error(`Le salon des logs avec l'ID ${logChannelId} n'a pas été trouvé.`);
                }
            } catch (error) {
                console.error(`Erreur de la récupération du salon des logs : `, error);
            }
        } else {
            console.error(`L'ID du salon des logs est vide dans la base de données.`)
        }
    })
});
