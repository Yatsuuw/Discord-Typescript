import { EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

interface UserSettings {
    warnId?: number,
    date?: string,
    moderateur?: string,
    moderateurName?: string,
    raison?: string,
}

interface ServerSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder()
    .setName('unwarn')
    .setDescription('Supprimer un warn d\'un utilisateur')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addUserOption((option) =>
        option
            .setName('target')
            .setDescription('Utilisateur à qui supprimer un avertissement')
            .setRequired(true)
    )
    .addIntegerOption((option) =>
        option
            .setName('warnid')
            .setDescription('ID du warn à supprimer')
            .setRequired(true)
    )

export default command(meta, async ({ interaction }) => {
    const guildId = interaction.guild?.id;
    const target = interaction.options.getMember('target') as GuildMember;
    const warnId = interaction.options.getInteger('warnid');

    db.get('SELECT * from servers_users_warns WHERE guildId = ? AND user = ? AND warnId = ?', [guildId, target.user.id, warnId], async (err, row: UserSettings) => {
        if (err) {
            console.error('Erreur lors de la récupération des paramètres dans la base de données.\nErreur :\n', err);
            return;
        }

        const warnId = row?.warnId;
        const date = row?.date;
        const moderateur = row?.moderateur;
        const moderateurName = row?.moderateurName;
        const raison = row?.raison;

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
                            if (!row) {
                                return interaction.reply({ content: "Aucun avertissement trouvé avec cet ID pour cet utilisateur." });
                            }
                    
                            db.run('DELETE FROM servers_users_warns WHERE guildId = ? AND user = ? AND warnId = ?', [guildId, target.user.id, warnId], (deletedErr) => {
                                if (deletedErr) {
                                    console.error(`Erreur lors de la suppression de l'avertissement dans la base de données.\nErreur :\n`, deletedErr);
                                    return interaction.reply({ content: `Une erreur s'est produite lors de la suppression de l'avertissement dans la base de données. Erreur :\n${deletedErr}` });
                                }
                    
                                const unwarn = new EmbedBuilder()
                                    .setTitle('Avertissement retiré')
                                    .setColor('Green')
                                    .setDescription(`${target.user.tag} vient de perdre un avertissement.`)
                                    .setImage(target.user.displayAvatarURL())
                                    .addFields([
                                        { name: 'Avertissement concerné', value: `**ID :** #${warnId}\n**Autheur de l'avertissement :** ${moderateurName} (${moderateur})\n**Date de l'avertissement :** ${date}\n**Raison :** ${raison}` },
                                        { name: 'Utilisateur concerné', value: `<@${target.user.id}>` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "Par yatsuuw @ Discord" })
                    
                                const unwarnDm = new EmbedBuilder()
                                    .setTitle('Avertissement retiré')
                                    .setColor('Green')
                                    .setDescription(`Vous venez de perdre un avertissement.`)
                                    .addFields([
                                        { name: 'Avertissement concerné', value: `**ID :** #${warnId}\n**Autheur de l'avertissement :** ${moderateurName} (${moderateur})\n**Date de l'avertissement :** ${date}\n**Raison :** ${raison}` },
                                        { name: 'Serveur concerné', value: `${interaction.guild?.name}` },
                                        { name: 'Modérateur', value: `<@${interaction.user.id}>` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "Par yatsuuw @ Discord" })
                    
                                interaction.reply({ embeds: [unwarn] });
                                target.send({ embeds: [unwarnDm] })
                            })
                        } catch (error) {
                            await interaction.reply({ content: `Une erreur s'est produite lors de l'envoi du message regroupant les avertissements de ${target.user.tag}. Erreur :\n${error}` });
                        }

                        const logUnwarn = new EmbedBuilder()
                            .setTitle('Log de la commande Unwarn')
                            .setColor('DarkGold')
                            .setDescription(`${interaction.user.tag} a utilisé la commande \`/warnslist\` sur l'utilisateur ${target.user.tag}.`)
                            .addFields([
                                { name: 'Utilisateur', value: `<@${interaction.user.id}>` },
                                { name: 'Utilisateur visé', value: `<@${target.user.id}>` },
                                { name: 'Avertissement concerné', value: `**ID :** #${warnId}\n**Autheur de l'avertissement :** ${moderateurName} (${moderateur})\n**Date de l'avertissement :** ${date}\n**Raison :** ${raison}` },
                            ])
                            .setTimestamp()
                            .setFooter({ text: "Par yatsuuw @ Discord" })

                        return await logChannel.send({ embeds: [logUnwarn] })
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
});
