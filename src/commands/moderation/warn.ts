import { EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js";
import { command } from '../../utils'
import { db } from '../../utils/database'
import { format } from 'date-fns';

interface ServerSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Donner un avertissement à un utilisateur')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addUserOption((option) =>
        option
            .setName('user')
            .setDescription('Utilisateur à avertir')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('reason')
            .setDescription('Raison de l\'avertissement')
            .setRequired(true)
    )

export default command(meta, async ({ interaction }) => {
    const guildId = interaction.guild?.id;
    const guildName = interaction.guild?.name;
    const target = interaction.options.getMember('user') as GuildMember;
    const moderatorId = interaction.user.id;
    const moderatorName = interaction.user.tag;
    const reason = interaction.options.getString('reason')!;

    const currentDate = format(new Date(), 'yyyy-MM-dd | HH:mm:ss');

    db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
        if (err) {
            console.error('Erreur lors de la récupération du paramètre "logChannelId" dans la base de données.\nErreur :\n', err);
            return;
        }

        const logChannelId = row?.logChannelId;

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;
                //console.log(logChannel)

                if (logChannel) {
                    try {
                        if (target.user.id != interaction.user.id) {
                            db.run(`INSERT INTO servers_users_warns (guildId, guildName, user, username, moderateur, moderateurName, date, raison) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [guildId, guildName, target.id, target.user.tag, moderatorId, moderatorName, currentDate, reason], (err) => {
                                if (err) {
                                    console.error('Erreur lors de l\'enregistrement de l\'avertissement dans la base de données :', err);
                                    return interaction.reply('Une erreur s\'est produite lors de l\'enregistrement de l\'avertissement.');
                                }
                        
                                const warn = new EmbedBuilder()
                                    .setTitle("Avertissement")
                                    .setColor('Red')
                                    .setDescription(`${target.user.tag} vient de recevoir un avertissement.`)
                                    .setImage(target.user.displayAvatarURL())
                                    .addFields([
                                        { name: 'Membre du staff', value: `<@${interaction.user.id}>` },
                                        { name: 'Utilisateur averti', value: `<@${target.user.id}>` },
                                        { name: 'Raison', value: `${reason}` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "Par yatsuuw @ Discord" })
                        
                                const warnDm = new EmbedBuilder()
                                    .setTitle("Avertissement")
                                    .setColor('Red')
                                    .setDescription(`Vous venez de recevoir un avertissement.`)
                                    .addFields([
                                        { name: 'Serveur concerné', value: `${guildName}` },
                                        { name: 'Membre du staff', value: `<@${interaction.user.id}>` },
                                        { name: 'Raison', value: `${reason}` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "Par yatsuuw @ Discord" })
                        
                                interaction.reply({ embeds: [warn] });
                                target.send({ embeds: [warnDm] })
                            });
                        } else {
                            await interaction.reply({ content: 'Vous ne pouvez pas vous avertir vous-même.', ephemeral: true });
                        }
                    } catch (error) {
                        await interaction.reply({ content: `Une erreur s'est produite lors de l'enregistrement de l'avertissement de ${target.user.tag}. Erreur :\n${error}` });
                    }

                    const logWarn = new EmbedBuilder()
                        .setTitle('Log de la commande Warn')
                        .setColor('DarkRed')
                        .setDescription(`${interaction.user.tag} a utilisé la commande \`/warn\` sur l'utilisateur ${target.user.tag}.`)
                        .addFields([
                            { name: 'Utilisateur', value: `<@${interaction.user.id}>` },
                            { name: 'Utilisateur visé', value: `<@${target.user.id}>` },
                            { name: 'Raison', value: `${reason}` },
                        ])
                        .setTimestamp()
                        .setFooter({ text: "Par yatsuuw @ Discord" })

                    if (target.user.id != interaction.user.id) {
                        logWarn.addFields([{ name: 'Raison', value: `${reason}` }])
                    } else {
                        logWarn.addFields([{ name: 'Échec', value: `<@${interaction.user.id}> a tenté de s'appliquer un avertissement.` }])
                    }

                    return await logChannel.send({ embeds: [logWarn] })
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
