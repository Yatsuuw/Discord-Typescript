import { EmbedBuilder, TextChannel } from 'discord.js';
import { event } from '../../utils';
import { db } from '../../utils/database';

interface ServersSettings {
    welcomeChannelID?: string;
    welcomeGifUrl?: string;
    userId?: string,
    level?: number,
    experience?: number,
}

export default event('guildMemberAdd', async (client, member) => {
    const guildId = member.guild.id;
    const guildName = member.guild?.name;

    db.get('SELECT welcomeChannelID, welcomeGifUrl FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServersSettings) => {
        if (err) {
            console.error(`Error retrieving welcomeChannelId and welcomeGifUrl parameters for server ${guildName} (${guildId}) :`, err);
            return;
        }

        const welcomeChannelId = row?.welcomeChannelID;
        const welcomeGifUrl = row?.welcomeGifUrl;

        if (welcomeChannelId) {
            try {
                const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId) as TextChannel;

                if (welcomeChannel) {
                    const memberJoin = new EmbedBuilder()
                        .setTitle(`${member.user.tag}`)
                        .setColor("Green")
                        .setDescription(`<@${member.user.id}> has just joined the server.\nWe are now \`${member.guild.memberCount}\` on the server.`)
                        .setImage(welcomeGifUrl || "")
                        .setTimestamp()
                        .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' });

                    welcomeChannel.send({ embeds: [memberJoin] });
                } else {
                    console.error(`The welcome channel with ID ${welcomeChannelId} was not found for server ${guildName} (${guildId}).`);
                }
            } catch (error) {
                console.error(`Error retrieving the welcome channel for the ${guildName} server (${guildId}). Error :`, error);
            }
        } else {
            console.error(`The welcome channel ID is empty in the database for the ${guildName} server (${guildId}).`);
        }
    });
});
