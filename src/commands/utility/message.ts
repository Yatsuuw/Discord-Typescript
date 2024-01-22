import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

interface ServerSettings {
    logChannelId?: string,
}

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
    const guildId = interaction.guild?.id;

    db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
        if (err) {
            console.error('Erreur lors de la récupération du paramètre "logChannelId" dans la base de données.\nErreur :\n', err);
            return;
        }

        const message = interaction.options.getString('message')
        const logChannelId = row?.logChannelId;

        await interaction.channel?.send({
            content: message || undefined
        });

        await interaction.reply({
            ephemeral: true,
            content: 'Message envoyé ✅'
        });

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;
                //console.log(logChannel)

                if (logChannel) {
                    const logMessage = new EmbedBuilder()
                        .setTitle('Log de la commande Message')
                        .setColor("White")
                        .setDescription(`${interaction.user.tag} a utilisé la commande \`/message\` dans le salon <#${interaction.channel?.id}>`)
                        .addFields([
                            { name: 'Utilisateur', value: `<@${interaction.user.id}>` },
                            { name: 'Contenu', value: `${message}` }
                        ])
                        .setTimestamp()
                        .setFooter({ text: "Par yatsuuw @ Discord" })

                    return logChannel.send({ embeds: [logMessage] });
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
})
