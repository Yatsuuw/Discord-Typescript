import { EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

interface ServersSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder ()
    .setName('kick')
    .setDescription('Kick a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addUserOption((option) => 
        option
            .setName('target')
            .setDescription('User to kick')
            .setRequired(true)
    )
    .addStringOption((option) => 
        option
            .setName('reason')
            .setDescription('Reason for the kick')
            .setRequired(false)
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
        const reason = interaction.options.getString('reason') || 'No reason.';
        const logChannelId = row?.logChannelId;

        if (!target.kickable) return await interaction.reply({ content: 'This member cannot be kicked.', ephemeral: true });

        const kickServer = new EmbedBuilder()
            .setTitle("Expulsion")
            .setColor("Red")
            .setDescription("Unfortunately, a new user has just been kicked!")
                .addFields([
                { name: `User`, value: `${target.user.username}` },
                { name: `Reason`, value: `${reason}` }
            ])
            .setThumbnail(target.displayAvatarURL())
            .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })
            .setTimestamp()

        const kickDm = new EmbedBuilder()
            .setTitle("Expulsion")
            .setDescription(`You have just been kicked from the server \${target.guild.name}\`.`)
            .setColor("Red")
            .addFields([
                { name: 'Reason :', value: `${reason}` },
                { name: 'Staff', value: `${interaction.user.username}` }
            ])
            .setThumbnail(target.displayAvatarURL())
            .setFooter({ text: 'By yatsuuw @ Discord', iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })
            .setTimestamp()

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;

                if (logChannel) {
                    try {
                        await target.send({ embeds: [kickDm] });
                        await target.kick(reason)
                        await interaction.reply({ embeds: [kickServer] })
                    } catch (error) {
                        await interaction.reply({ content: `An error has occurred during user expulsion !`, ephemeral: true });
                    }

                    const logKick = new EmbedBuilder()
                        .setTitle('Kick command log')
                        .setColor('Red')
                        .setDescription(`${interaction.user.tag} used the command \`/kick\` on user ${target.user.tag}`)
                        .addFields([
                            { name: 'User', value: `<@${interaction.user.id}>` },
                            { name: 'Target user', value: `<@${target.user.id}>` },
                            { name: 'Reason', value: `${reason}` }
                        ])
                        .setTimestamp()
                        .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })

                    return logChannel.send({ embeds: [logKick] })
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