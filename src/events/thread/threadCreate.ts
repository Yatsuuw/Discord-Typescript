import { EmbedBuilder, TextChannel, ThreadChannel } from 'discord.js';
import { event } from '../../utils';
import { db } from '../../utils/database';
import keys from '../../keys';

interface ServersSettings {
    logChannelId?: string;
}

export default event('threadCreate', async (client, thread: ThreadChannel<boolean>) => {
    const guildId = thread.guild?.id;
    const guildName = thread.guild?.name;
    const ownerId = thread.ownerId;

    db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServersSettings) => {
        if (err) {
            console.error(`Error retrieving "logChannelId" parameter for server ${guildName} (${guildId}) :`, err);
            return;
        }

        const logChannelId = row?.logChannelId;

        if (logChannelId) {
            try {
                const logChannel = thread.guild?.channels.cache.get(logChannelId) as TextChannel;

                if (logChannel) {
                    const threadCreateLog = new EmbedBuilder()
                        .setTitle('Thread')
                        .setColor('DarkOrange')
                        .setDescription(`The member <@${ownerId}> (${ownerId}) created the thread \`${thread.name}\`.\nI joined it automatically.`)
                        .setTimestamp()
                        .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' });

                    if (ownerId !== keys.botId) {
                        if (thread.isTextBased()) {
                            thread.join().then(async () => {
                                await logChannel.send({ embeds: [threadCreateLog] });
                            }).catch((error) => {
                                console.error(`Error when trying to join the thread: ${thread.name} for the server ${guildName} (${guildId}). Error: ${error}`);
                            });
                        } else {
                            logChannel.send({ content: `The ${thread.name} thread is not textual, so I can't join it.` });
                        }
                    } else {
                        threadCreateLog.addFields([
                            { name: 'Information', value: `The \`Emit Test\` thread was created and then deleted automatically because it came from the \`/emit threadCreate\` command.` }
                        ])

                        logChannel.send({ embeds: [threadCreateLog] })
                    }
                } else {
                    console.error(`The log channel with ID ${logChannelId} was not found for server ${guildName} (${guildId}).`);
                }
            } catch (error) {
                console.error(`Error retrieving the log channel for server ${guildName} (${guildId}). Error : `, error);
            }
        } else {
            console.error(`The log room ID is empty in the database for the ${guildName} server (${guildId}).`);
        }
    });
});
