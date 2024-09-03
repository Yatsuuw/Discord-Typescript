import { EmbedBuilder, TextChannel } from 'discord.js'
import { event } from '../../utils'
import { db } from '../../utils/database'

interface ServersSettings {
    leaveChannelID?: string;
    leaveGifUrl: string;
}

export default event('guildMemberRemove', (client, member) => {
    const guildId = member.guild.id;
    const guildName = member.guild?.name;

    db.get('SELECT leaveChannelID, leaveGifUrl FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServersSettings) => {
        if (err) {
            console.error(`Error retrieving leaveChannelId and leaveGifUrl parameters for server ${guildName} (${guildId}) : `, err);
            return;
        }

        const leaveChannelId = row?.leaveChannelID;
        const leaveGifUrl = row?.leaveGifUrl;

        if (leaveChannelId) {
            try {
                const leaveChannel = member.guild.channels.cache.get(leaveChannelId) as TextChannel;

                if (leaveChannel) {
                    const memberLeave = new EmbedBuilder()
                        .setTitle(`${member.user.tag}`)
                        .setColor("Red")
                        .setDescription(`<@${member.user.id}> (${member.user.id}) has just left the server.\nWe are now \`${member.guild.memberCount}\` on the server.`)
                        .setImage(leaveGifUrl || "")
                        .setTimestamp()
                        .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })

                    leaveChannel.send({ embeds: [memberLeave] })
                } else {
                    console.error(`The departure channel with ID ${leaveChannelId} was not found for server ${guildName} (${guildId}).`);
                }
            } catch (error) {
                console.error(`Error retrieving the welcome channel for the ${guildName} server (${guildId}). Error : `, error);
            }
        } else {
            console.error(`The departure channel ID is empty in the database for the ${guildName} server (${guildId}).`);
        }
    });
});
