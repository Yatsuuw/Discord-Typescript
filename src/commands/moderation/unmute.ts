import { EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

interface ServerSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder ()
    .setName('unmute')
    .setDescription('Rendre la parole à un utilisateur')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((option) =>
        option
            .setName('target')
            .setDescription('Utilisateur qui retrouvera la parole')
            .setRequired(true)
    )

export default command(meta, async ({ interaction }) => {
    const guildId = interaction.guild?.id;

    db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
        if (err) {
            console.error('Erreur lors de la récupération du paramètre "logChannelId" dans la base de données.\nErreur :\n', err);
            return;
        }

        const target = (interaction.options.getMember('target') || '') as GuildMember;
        const logChannelId = row?.logChannelId;

        if (!target.isCommunicationDisabled()) return await interaction.reply({ content: 'Cet utilisateur a déjà retrouvé le droit à la parole !', ephemeral: true });

        const unmuteServer = new EmbedBuilder()
            .setTitle('Parole')
            .setDescription('Un nouvel utilisateur vient de retrouver son droit à la parole !')
            .setColor('Green')
            .addFields([
                { name: 'Utilisateur', value: `${target}` },
                { name: 'Staff', value: `${interaction.user.username}` },
            ])
            .setImage(target.displayAvatarURL())
            .setFooter({ text: "Par yatsuuw @ Discord" })
            .setTimestamp()

        const unmuteDm = new EmbedBuilder()
            .setTitle('Parole')
            .setDescription(`Vous venez de retrouver votre droit à la parole sur le serveur \`${target.guild.name}\`.`)
            .setColor('Green')
            .addFields([
                { name: 'Staff', value: `${interaction.user.username}` },
            ])
            .setImage(target.displayAvatarURL())
            .setFooter({ text: "Par yatsuuw @ Discord" })
            .setTimestamp()

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;
                //console.log(logChannel)

                if (logChannel) {
                    try {
                        await target.send({ embeds: [unmuteDm] });
                        await target.timeout(null);
                        await interaction.reply({ embeds: [unmuteServer] });
                    } catch (error) {
                        await interaction.reply({ content: `Une erreur est survenue lors de la remise du droit à la parole. Erreur :\n${error}.`, ephemeral: true });
                    }

                    const logUnmute = new EmbedBuilder()
                        .setTitle('Log de la commande Unmute')
                        .setColor('Fuchsia')
                        .setDescription(`${interaction.user.tag} a utilisé la commande \`/unmute\` sur l'utilisateur ${target.user.tag}`)
                        .addFields([
                            { name: 'Utilisateur', value: `<@${interaction.user.id}>` },
                            { name: 'Utilisateur visé', value: `<@${target.user.id}>` }
                        ])
                        .setTimestamp()
                        .setFooter({ text: "Par yatsuuw @ Discord" })

                    return logChannel.send({ embeds: [logUnmute] })
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
