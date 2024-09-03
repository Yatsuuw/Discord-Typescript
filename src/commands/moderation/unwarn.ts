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

interface ServersSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder()
    .setName('unwarn')
    .setDescription('Delete a user\'s warn')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addUserOption((option) =>
        option
            .setName('target')
            .setDescription('User to delete a warning from')
            .setRequired(true)
    )
    .addIntegerOption((option) =>
        option
            .setName('warnid')
            .setDescription('ID of the warn to be deleted')
            .setRequired(true)
    )

export default command(meta, async ({ interaction }) => {
    const guildId = interaction.guild?.id;
    const guildName = interaction.guild?.name;
    const target = interaction.options.getMember('target') as GuildMember;
    const warnId = interaction.options.getInteger('warnid');

    db.get('SELECT * from servers_users_warns WHERE guildId = ? AND user = ? AND warnId = ?', [guildId, target.user.id, warnId], async (err, row: UserSettings) => {
        if (err) {
            console.error(`Error retrieving warnId, date, moderateur, moderateurName and raison parameters from the database for the server ${guildName} (${guildId}).\nError :\n`, err);
            return;
        }

        const warnId = row?.warnId;
        const date = row?.date;
        const moderateur = row?.moderateur;
        const moderateurName = row?.moderateurName;
        const raison = row?.raison;

        db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServersSettings) => {
            if (err) {
                console.error(`Error when retrieving the "logChannelId" parameter from the database for the ${guildName} server (${guildId}).\nError :\n`, err);
                return;
            }

            const logChannelId = row?.logChannelId;

            if (logChannelId) {
                try {
                    const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;

                    if (logChannel) {
                        try {
                            if (!row) {
                                return interaction.reply({ content: "No warnings found with this ID for this user." });
                            }
                    
                            db.run('DELETE FROM servers_users_warns WHERE guildId = ? AND user = ? AND warnId = ?', [guildId, target.user.id, warnId], (deletedErr) => {
                                if (deletedErr) {
                                    console.error(`Error deleting warning from database for server ${guildName} (${guildId}).\nError :\n`, deletedErr);
                                    return interaction.reply({ content: `An error occurred when deleting the warning from the database. Error :\n${deletedErr}` });
                                }
                    
                                const unwarn = new EmbedBuilder()
                                    .setTitle('Warning removed')
                                    .setColor('Green')
                                    .setDescription(`${target.user.tag} has just had a warning removed.`)
                                    .setThumbnail(target.displayAvatarURL())
                                    .addFields([
                                        { name: 'Warning concerned', value: `**ID :** #${warnId}\n**Author of the warning :** ${moderateurName} (${moderateur})\n**Date of warning :** ${date}\n**Reason :** ${raison}` },
                                        { name: 'User concerned', value: `<@${target.user.id}>` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })
                    
                                const unwarnDm = new EmbedBuilder()
                                    .setTitle('Warning concerned')
                                    .setColor('Green')
                                    .setDescription(`You've just lost a warning.`)
                                    .addFields([
                                        { name: 'Warning concerned', value: `**ID :** #${warnId}\n**Author of the warning :** ${moderateurName} (${moderateur})\n**Date of warning :** ${date}\n**Reason :** ${raison}` },
                                        { name: 'Server concerned', value: `${interaction.guild?.name}` },
                                        { name: 'Moderator', value: `<@${interaction.user.id}>` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })
                    
                                interaction.reply({ embeds: [unwarn] });
                                target.send({ embeds: [unwarnDm] })
                            })
                        } catch (error) {
                            await interaction.reply({ content: `An error occurred when sending the message containing the warnings for ${target.user.tag}. Error :\n${error}` });
                        }

                        const logUnwarn = new EmbedBuilder()
                            .setTitle('Unwarn command log')
                            .setColor('DarkGold')
                            .setDescription(`${interaction.user.tag} used the \`/warnslist\` command on the user ${target.user.tag}.`)
                            .addFields([
                                { name: 'User', value: `<@${interaction.user.id}>` },
                                { name: 'Target user', value: `<@${target.user.id}>` },
                                { name: 'Warning concerned', value: `**ID :** #${warnId}\n**Author of the warning :** ${moderateurName} (${moderateur})\n**Date of warning :** ${date}\n**Reason :** ${raison}` },
                            ])
                            .setTimestamp()
                            .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })

                        return await logChannel.send({ embeds: [logUnwarn] })
                    } else {
                        console.error(`The log channel with ID ${logChannelId} was not found for server ${guildName} (${guildId}).`);
                    }
                } catch (error) {
                    console.error(`Error retrieving the log room for server ${guildName} (${guildId}). Error : `, error);
                }
            } else {
                console.error(`The log channel ID is empty in the database for the ${guildName} server (${guildId}).`);
            }
        });
    });
});
