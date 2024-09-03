import { EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

interface ServersSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder ()
    .setName('userinfo')
    .setDescription('Sends a user\'s profile information.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((option) => 
        option
            .setName('target')
            .setDescription('User whose profile information is retrieved.')
            .setRequired(true)
    )

export default command(meta, async ({ interaction }) => {
    const guildId = interaction.guild?.id;
    const guildName = interaction.guild?.name;

    db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServersSettings) => {
        if (err) {
            console.error(`Error when retrieving the "logChannelId" parameter from the database for the ${guildName} server (${guildId}).\nError :\n`, err);
            return;
        }

        const target = interaction.options.getMember('target') as GuildMember;
        const logChannelId = row?.logChannelId;

        const userinfo = new EmbedBuilder()
            .setAuthor({ name: `${target.displayName} (${target.id})` })
            .setColor("DarkPurple")
            .setThumbnail(target.displayAvatarURL())
            .addFields([
                { name: 'Name', value: `${target.displayName}`, inline: true },
                { name: 'Staff', value: `${target.kickable ? '❎' : '✅'}`, inline: true },
                { name: 'Bot', value: `${target.user.bot ? '✅' : '❎'}`, inline: true },
                { name: 'Roles', value: `${target.roles.cache.map((role: any) => role).join(' | ').replace(' | @everyone', ' ')}` },
                { name: 'Created an account on', value: `<t:${Math.floor(target.user.createdTimestamp / 1000)}:f>` },
                { name: 'Joined the server on', value: target.joinedTimestamp ? `<t:${Math.floor(target.joinedTimestamp / 1000)}:f>` : 'N/A' },
            ])
            .setFooter({ text: 'By yatsuuw @ Discord', iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;

                if (logChannel) {
                    try {
                        await interaction.reply({
                            ephemeral: true,
                            embeds: [userinfo]
                        })
                    } catch (error) {
                        await interaction.reply({ content: `An error has occurred while sending user information !`, ephemeral: true });
                    }
                    const logUserinfo = new EmbedBuilder()
                        .setTitle('User-info command log')
                        .setColor('Gold')
                        .setDescription(`${interaction.user.tag} used the command \`/userinfo\` on the user ${target.user.tag}.`)
                        .addFields([
                            { name: 'User', value: `<@${interaction.user.id}>` },
                            { name: 'Target user', value: `<@${target.user.id}>` }
                        ])
                        .setTimestamp()
                        .setFooter({ text: "By yatsuuw @ Discord" })

                    return logChannel.send({ embeds: [logUserinfo] })
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
