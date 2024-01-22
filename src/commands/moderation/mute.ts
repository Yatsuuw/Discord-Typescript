import { EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { command } from '../../utils'
import ms from 'ms'
import { db } from '../../utils/database'

interface ServerSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder ()
    .setName('mute')
    .setDescription('Retirer la parole à un utilisateur')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((option) =>
        option
            .setName('target')
            .setDescription('Utilisateur qui va perdre le droit à la parole')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('reason')
            .setDescription('Raison de la perte du droit à la parole')
            .setRequired(false)
    )
    .addStringOption((option) =>
        option
            .setName('duration')
            .setDescription('Durée de la perte du droit à la parole (renseignez les unités temporelles !)')
            .setRequired(false)
    )

export default command(meta, async ({ interaction }) => {
    const guildId = interaction.guild?.id;

    db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
        if (err) {
            console.error('Erreur lors de la récupération du paramètre "logChannelId" dans la base de données.\nErreur :\n', err);
            return;
        }

        const target = (interaction.options.getMember('target') || '') as GuildMember;
        const duration = interaction.options.getString('duration') || '1';
        const convertedTime = ms(duration);
        const reason = interaction.options.getString('reason') || 'No reason';
        const logChannelId = row?.logChannelId;
        console.log(logChannelId);

        if (!target.moderatable) return await interaction.reply({ content: 'Cet utilisateur ne peut pas être rendu muet !', ephemeral: true });
        if (!convertedTime) return await interaction.reply({ content: 'Spécifie une durée valide !', ephemeral: true });

        const muteServer = new EmbedBuilder()
            .setTitle("Parole")
            .setDescription("Malheureusement, un nouvel utilisateur vient de perdre son droit de parole !")
            .setColor("Red")
            .addFields([
                { name: `Utilisateur`, value: `${target}` },
                { name: `Durée`, value: `${duration} `},
                { name: `Raison`, value: `${reason}` }
            ])
            .setImage(target.displayAvatarURL())
            .setFooter({ text: "Par yatsuuw @ Discord" })
            .setTimestamp()

        const muteDm = new EmbedBuilder()
            .setTitle("Parole")
            .setDescription(`Vous venez de perdre la parole sur le serveur \`${target.guild.name}\`.`)
            .setColor("Red")
            .addFields([
                { name: 'Raison :', value: `${reason}` },
                { name: 'Durée', value: `${duration}` }
            ])
            .setImage(target.displayAvatarURL())
            .setFooter({ text: 'Par yatsuuw @ Discord' })
            .setTimestamp()

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;
                //console.log(logChannel)

                if (logChannel) {
                    try {
                        await target.timeout(convertedTime, reason);
                        await target.send({ embeds: [muteDm] });
                        await interaction.reply({ embeds: [muteServer] });
                    } catch (error) {
                        await interaction.reply({ content: `Une erreur est survenue lors du mute. Erreur :\n${error}`, ephemeral: true });
                    }
        
                    const logMute = new EmbedBuilder()
                        .setTitle('Log de la commande Mute')
                        .setColor('Purple')
                        .setDescription(`${interaction.user.tag} a utilisé la commande \`/mute\` sur l'utilisateur ${target.user.tag}`)
                        .addFields([
                            { name: 'Utilisateur', value: `<@${interaction.user.id}>` },
                            { name: 'Utilisateur visé', value: `<@${target.user.id}>` },
                            { name: 'Raison', value: `${reason}` },
                            { name: 'Durée', value: `${duration}` }
                        ])
                        .setTimestamp()
                        .setFooter({ text: "Par yatsuuw @ Discord" })
        
                    return logChannel.send({ embeds: [logMute] })
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
