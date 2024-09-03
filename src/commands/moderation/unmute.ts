import { EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

interface ServersSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder ()
    .setName('unmute')
    .setDescription('Giving users a voice')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((option) =>
        option
            .setName('target')
            .setDescription('User who can speak again')
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

        const target = (interaction.options.getMember('target') || '') as GuildMember;
        const logChannelId = row?.logChannelId;

        if (!target.isCommunicationDisabled()) return await interaction.reply({ content: 'This user has already regained the right to speak!', ephemeral: true });

        const unmuteServer = new EmbedBuilder()
            .setTitle('Speech')
            .setDescription('A new user has just regained his right to speak!')
            .setColor('Green')
            .addFields([
                { name: 'Utilisateur', value: `${target}` },
                { name: 'Staff', value: `${interaction.user.username}` },
            ])
            .setThumbnail(target.displayAvatarURL())
            .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })
            .setTimestamp()

        const unmuteDm = new EmbedBuilder()
            .setTitle('Speech')
            .setDescription(`You've just regained your right to speak on the \`${target.guild.name}\` server.`)
            .setColor('Green')
            .addFields([
                { name: 'Staff', value: `${interaction.user.username}` },
            ])
            .setThumbnail(target.displayAvatarURL())
            .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })
            .setTimestamp()

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;

                if (logChannel) {
                    try {
                        await target.send({ embeds: [unmuteDm] });
                        await target.timeout(null);
                        await interaction.reply({ embeds: [unmuteServer] });
                    } catch (error) {
                        await interaction.reply({ content: `An error has occurred while giving the right to speak. Error :\n${error}.`, ephemeral: true });
                    }

                    const logUnmute = new EmbedBuilder()
                        .setTitle('Unmute command log')
                        .setColor('Fuchsia')
                        .setDescription(`${interaction.user.tag} used the command \`/unmute\` on the user ${target.user.tag}`)
                        .addFields([
                            { name: 'User', value: `<@${interaction.user.id}>` },
                            { name: 'Target user', value: `<@${target.user.id}>` }
                        ])
                        .setTimestamp()
                        .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })

                    return logChannel.send({ embeds: [logUnmute] })
                } else {
                    console.error(`The log channel with ID ${logChannelId} was not found for server ${guildName} (${guildId}).`);
                }
            } catch (error) {
                console.error(`Error retrieving the log room for server ${guildName} (${guildId}). Error : `, error);
            }
        } else {
            console.error(`The log channel ID is empty in the ${guildName} database (${guildId}).`);
        }
    });
});
