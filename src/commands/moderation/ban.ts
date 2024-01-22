import { EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

interface ServerSettings {
    logChannelId?: string;
}

const meta = new SlashCommandBuilder ()
    .setName('ban')
    .setDescription('Bannir un utilisateur')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addUserOption((option) => 
        option
            .setName('target')
            .setDescription('Utilisateur à bannir')
            .setRequired(true)
    )
    .addStringOption((option) => 
        option
            .setName('reason')
            .setDescription('Raison du bannissement')
            .setRequired(false)
    )

export default command(meta, async ({ interaction }) => {
    const guildId = interaction.guild?.id;

    db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServerSettings) => {
        if (err) {
            console.error('Erreur lors de la récupération du paramètre "logChannelId" dans la base de données.\nErreur :\n', err);
            return;
        }

        const target = interaction.options.getMember('target') as GuildMember;
        const reason = interaction.options.getString('reason') || 'No reason.';
        const logChannelId = row?.logChannelId;

        if (!target.bannable) return await interaction.reply({ content: 'Ce membre ne peut pas être banni.', ephemeral: true });
        //if (!target.kickable) console.log(`${target.user.username} ne peut pas être banni`);
        //if (target.kickable) console.log(`${target.user.username} a été banni`)

        const banServer = new EmbedBuilder()
            .setTitle("Bannissement")
            .setColor("Red")
            .setDescription("Malheureusement, un nouvel utilisateur vient d'être banni !")
            .addFields([
                { name: `Utilisateur`, value: `${target.user.username}` },
                { name: `Raison`, value: `${reason}` }
            ])
            .setImage(target.displayAvatarURL())
            .setFooter({ text: "Par yatsuuw @ Discord", iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()

        const banDm = new EmbedBuilder()
            .setTitle("Bannissement")
            .setDescription(`Vous venez d'être banni(e) du serveur \`${target.guild.name}\`.`)
            .setColor("Red")
            .addFields([
                { name: 'Raison :', value: `${reason}` },
                { name: 'Staff', value: `${interaction.user.username}` }
            ])
            .setImage(target.displayAvatarURL())
            .setFooter({ text: 'Par yatsuuw @ Discord' })
            .setTimestamp()

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;
                //console.log(logChannel)

                if (logChannel) {
                    // Try pour bannir et envoyer le message dans le salon d'exécution et en message privé.
                    try {
                        await target.send({ embeds: [banDm] });
                        const targetBan = "Y"
                        await target.ban({ reason });
                        await interaction.reply({ embeds: [banServer] });
                    } catch (error) {
                        await interaction.reply({ content: `Une erreur est survenue lors du bannissement de l'utilisateur !\n${error}`, ephemeral: true });
                    }

                    const logBan = new EmbedBuilder()
                        .setTitle('Log de la commande Ban')
                        .setColor('Red')
                        .setDescription(`${interaction.user.tag} a utilisé la commande \`/ban\` sur l'utilisateur ${target.user.tag}`)
                        .addFields([
                            { name: 'Utilisateur', value: `<@${interaction.user.id}>` },
                            { name: 'Utilisateur visé', value: `<@${target.user.id}>` },
                            { name: 'Raison', value: `${reason}` }
                        ])
                        .setTimestamp()
                        .setFooter({ text: "Par yatsuuw @ Discord" })

                    return logChannel.send({ embeds: [logBan] })
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
