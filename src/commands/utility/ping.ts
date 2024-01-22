import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

interface ServerSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder ()
    .setName('ping')
    .setDescription('Ping the bot for a response.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addStringOption((option) => 
        option
            .setName('message')
            .setDescription('Provide the bot a message to respond with.')
            .setMinLength(1)
            .setMaxLength(2000)
            .setRequired(false)
    )

export default command(meta, async ({ interaction }) => {
    const guildId = interaction.guild?.id;

    db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
        if (err) {
            console.error('Erreur lors de la récupération du paramètre "logChannelId" dans la base de données.\nErreur :\n', err);
            return;
        }

        const message = interaction.options.getString('message');
        const logChannelId = row?.logChannelId;

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;
                //console.log(logChannel)

                if (logChannel) {
                    try {
                        await interaction.reply({
                            ephemeral: true,
                            content: message ?? 'Pong! 🏓'
                        })
                    } catch (error) {
                        await interaction.reply({ content: `Une erreur est survenue lors du calcul de la latence du bot. Erreur :\n${error}` });
                    }

                    const logPing = new EmbedBuilder()
                        .setTitle("Log de la commande Ping")
                        .setDescription(`${interaction.user.tag} a utilisé la commande \`/ping\` dans le salon <#${interaction.channel?.id}>`)
                        .setColor('White')
                        .addFields([
                            { name: 'Utilisateur', value: `<@${interaction.user.id}>` },
                            { name: 'Message', value: `${message || "Pas de message"}` }
                        ])
                        .setTimestamp()
                        .setFooter({ text: "Par yatsuuw @ Discord" })

                    return logChannel.send({ embeds: [logPing] })
                } else {
                    console.error(`Le salon des logs avec l'ID ${logChannelId} n'a pas été trouvé.`);
                }
            } catch (error) {
                console.error(`Erreur de la récupération du salon des logs : `, error);
            }
        } else {
            console.error(`L'ID du salon des logs est vide dans la base de données.`)
        }
    });
});
