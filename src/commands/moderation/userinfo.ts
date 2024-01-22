import { EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

interface ServerSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder ()
    .setName('userinfo')
    .setDescription('Envoie les informations du profil d\'un utilisateur.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((option) => 
        option
            .setName('target')
            .setDescription('Utilisateur qui verra les informations de son profil récupérées.')
            .setRequired(true)
    )

export default command(meta, async ({ interaction }) => {
    const guildId = interaction.guild?.id;

    db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
        if (err) {
            console.error('Erreur lors de la récupération du paramètre "logChannelId" dans la base de données.\nErreur :\n', err);
            return;
        }

        const target = interaction.options.getMember('target') as GuildMember;
        const logChannelId = row?.logChannelId;

        const userinfo = new EmbedBuilder()
            .setAuthor({ name: `${target.displayName} (${target.id})` })
            .setColor("DarkPurple")
            .setImage(target.user.displayAvatarURL())
            .addFields([
                { name: 'Nom', value: `${target.displayName}`, inline: true },
                { name: 'Modérateur', value: `${target.kickable ? '❎' : '✅'}`, inline: true },
                { name: 'Bot', value: `${target.user.bot ? '✅' : '❎'}`, inline: true },
                { name: 'Rôles', value: `${target.roles.cache.map((role: any) => role).join(' | ').replace(' | @everyone', ' ')}` },
                { name: 'A créé son compte le', value: `<t:${Math.floor(target.user.createdTimestamp / 1000)}:f>` },
                { name: 'A rejoint le serveur le', value: target.joinedTimestamp ? `<t:${Math.floor(target.joinedTimestamp / 1000)}:f>` : 'N/A' },
            ])

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;
                //console.log(logChannel)

                if (logChannel) {
                    try {
                        await interaction.reply({
                            ephemeral: true,
                            embeds: [userinfo]
                        })
                    } catch (error) {
                        await interaction.reply({ content: `Une erreur s'est produite lors de l'envoi des informations de l'utilisateur !\n${error}`, ephemeral: true });
                    }
                    const logUserinfo = new EmbedBuilder()
                        .setTitle('Log de la commande User-info')
                        .setColor('Gold')
                        .setDescription(`${interaction.user.tag} a utilisé la commande \`/userinfo\` sur l'utilisateur ${target.user.tag}`)
                        .addFields([
                            { name: 'Utilisateur', value: `<@${interaction.user.id}>` },
                            { name: 'Utilisateur visé', value: `<@${target.user.id}>` }
                        ])
                        .setTimestamp()
                        .setFooter({ text: "Par yatsuuw @ Discord" })

                    return logChannel.send({ embeds: [logUserinfo] })
                } else {
                    console.error(`Le salon des logs avec l'ID ${logChannelId} n'a pas été trouvé.`);
                }
            } catch (error) {
                console.error(`Erreur de la récupération du salon des logs : `, error);
            }
        } else {
            console.error(`L'ID du salon des logs est vide dans la base de données.`);
        }
    });
});
