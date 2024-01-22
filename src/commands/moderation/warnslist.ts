import { GuildMember, PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder, TextChannel } from "discord.js";
import { command } from '../../utils'
import { db } from '../../utils/database'

interface UserSettings {
    length: number;
    warnId?: number;
    guildName?: string,
    username?: string,
    user?: string,
    moderateur?: string,
    moderateurName?: string,
    date?: string,
    raison?: string,
}

interface ServerSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder()
    .setName('warnslist')
    .setDescription('Affiche la liste des avertissements d\'un utilisateur')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addUserOption((option) =>
        option
            .setName('target')
            .setDescription('Utilisateur à qui on veut voir les avertissements')
            .setRequired(true)
    )

export default command(meta, async ({ interaction }) => {
    const target = interaction.options.getMember('target') as GuildMember;
    const guildId = interaction.guild?.id;
    
    db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
        if (err) {
            console.error('Erreur lors de la récupération du paramètre "logChannelId" dans la base de données.\nErreur :\n', err);
            return;
        }

        const logChannelId = row?.logChannelId;

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;
                //console.error(logChannel)

                if (logChannel) {
                    try {
                        db.all('SELECT * FROM servers_users_warns WHERE guildId = ? AND user = ?', [guildId, target.user.id], async (err, rows: UserSettings[]) => {
                            if (err) {
                                console.error('Erreur lors de la récupération des paramètres dans la base de données.\nErreur :\n', err);
                                return;
                            }
                        
                            if (rows.length === 0) {
                                return interaction.reply("Aucun avertissement trouvé pour cet utilisateur.");
                            }
                        
                            const warnsEmbed = new EmbedBuilder()
                                .setTitle(`Liste des warns`)
                                .setDescription(`Cette liste de warns appartient à l'utilisateur \`${target.user.tag}\`.`)
                                .setImage(target.user.displayAvatarURL())
                                .setColor("DarkBlue");
                        
                            rows.forEach((row) => {
                                warnsEmbed.addFields([{name: `Warn #${row.warnId}`, value:`**Modérateur:** ${row.moderateurName} (${row.moderateur})\n**Date:** ${row.date}\n**Raison:** ${row.raison}`}]);
                            });
                        
                            warnsEmbed.setTimestamp()
                                .setFooter({ text: "Par yatsuuw @ Discord" });
                        
                            interaction.reply({ embeds: [warnsEmbed] });
                        });
                    } catch (error) {
                        await interaction.reply({ content: `Une erreur s'est produite lors de l'envoi du message regroupant les avertissements de ${target.user.tag}. Erreur :\n${error}` });
                    }

                    const logWarnslist = new EmbedBuilder()
                        .setTitle('Log de la commande Warnslist')
                        .setColor('DarkGreen')
                        .setDescription(`${interaction.user.tag} a utilisé la commande \`/warnslist\` sur l'utilisateur ${target.user.tag}.`)
                        .addFields([
                            { name: 'Utilisateur', value: `<@${interaction.user.id}>` },
                            { name: 'Utilisateur visé', value: `<@${target.user.id}>` },
                        ])
                        .setTimestamp()
                        .setFooter({ text: "Par yatsuuw @ Discord" })

                    return await logChannel.send({ embeds: [logWarnslist] })
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
