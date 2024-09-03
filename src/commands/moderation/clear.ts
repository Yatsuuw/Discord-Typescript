import { GuildMember, SlashCommandBuilder, Collection, Message, TextChannel, EmbedBuilder, PermissionFlagsBits } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

interface ServersSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder ()
    .setName('clear')
    .setDescription('Delete a specific number of messages')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addChannelOption((option) => 
        option
            .setName('channel')
            .setDescription('Channel where messages will be deleted')
            .setRequired(true)
    )
    .addIntegerOption((option) => 
        option
            .setName('number')
            .setDescription('Number of messages to delete')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(50)
    )
    .addUserOption((option) =>
        option
            .setName('target')
            .setDescription('User whose messages will be deleted')
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

        const amount = interaction.options.getInteger("number")!;
        const channel = (interaction.options.getChannel("channel") || interaction.channel) as TextChannel;
        const target = interaction.options.getMember("target") as GuildMember;
        const logChannelId = row?.logChannelId;

        if (amount < 1 || amount > 100)
            return interaction.reply("You cannot enter a number less than 1 or greater than 100.");

        const messages: Collection<string, Message<true>> = await channel.messages.fetch();

        var filterMessages = target ? messages.filter(m => m.author.id === target.id) : messages;
        let deleted = 0

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;

                if (logChannel) {
                    try {
                        try {
                            deleted = (await channel.bulkDelete(Array.from(filterMessages.keys()).slice(0, amount), true)).size;
                        } catch (error) {
                            return interaction.reply({ content: `An error has occurred while deleting the !\n${error} messages.`, ephemeral: true });
                        }
                
                        if (deleted > 1) {
                            let deletedMessages = `${deleted} messages`;
                            const clearMessage = new EmbedBuilder()
                                .setTitle("Clear")
                                .setColor("Green")
                                .setDescription(`Messages have been deleted in the channel.`)
                                .addFields([
                                    { name: 'Number', value: `${deletedMessages}` }
                                ])
                                .setTimestamp()
                                .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })
                    
                            await interaction.reply({ embeds: [clearMessage], ephemeral: true });
                        }
                        if (deleted < 2) {
                            let deletedMessages = `${deleted} message`;
                            const clearMessage = new EmbedBuilder()
                                .setTitle("Clear")
                                .setColor("Green")
                                .setDescription(`Messages have been deleted in the channel.`)
                                .addFields([
                                    { name: 'Number', value: `${deletedMessages}` }
                                ])
                                .setTimestamp()
                                .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })
                    
                            await interaction.reply({ embeds: [clearMessage], ephemeral: true });
                        }
                    } catch (error) {
                        await interaction.reply({ content: `An error has occurred while deleting content. Error :\n${error}` });
                    }

                    if (amount > 1 && deleted > 1 || deleted === 0) {
                        const logClear = new EmbedBuilder()
                            .setTitle("Clear command log")
                            .setColor('DarkOrange')
                            .setDescription(`${interaction.user.tag} used the command \`/clear\` in the channel <#${interaction.channel?.id}>.`)
                            .addFields([
                                { name: 'User', value: `<@${interaction.user.id}>` },
                                { name: 'Number of messages', value: `${amount} messages to be deleted, ${deleted} have been deleted` }
                            ])
                            .setTimestamp()
                            .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })

                        return logChannel.send({ embeds: [logClear] })
                    }
                    if (amount > 1 && deleted < 2 && deleted > 0) {
                        const logClear = new EmbedBuilder()
                            .setTitle("Clear command log")
                            .setColor('DarkOrange')
                            .setDescription(`${interaction.user.tag} used the command \`/clear\` in the channel <#${interaction.channel?.id}>.`)
                            .addFields([
                                { name: 'User', value: `<@${interaction.user.id}>` },
                                { name: 'Number of messages', value: `${amount} messages to be deleted, ${deleted} have been deleted` }
                            ])
                            .setTimestamp()
                            .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })

                        return logChannel.send({ embeds: [logClear] })
                    }
                    if (amount < 2 && deleted < 2) {
                        const logClear = new EmbedBuilder()
                            .setTitle("Clear command log")
                            .setColor('DarkOrange')
                            .setDescription(`${interaction.user.tag} used the command \`/clear\` in the channel <#${interaction.channel?.id}>.`)
                            .addFields([
                                { name: 'User', value: `<@${interaction.user.id}>` },
                                { name: 'Number of messages', value: `${amount} message to be deleted, ${deleted} has been deleted` }
                            ])
                            .setTimestamp()
                            .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })

                        return logChannel.send({ embeds: [logClear] })
                    }
                } else {
                    console.error(`The log channel with ID ${logChannelId} was not found.`);
                }
            } catch (error) {
                console.error(`Error retrieving the log channel for server ${guildName} (${guildId}). Error : `, error);
            }
        } else {
            console.error(`The log channel ID is empty in the database for the ${guildName} server (${guildId}).`)
        }
    });
});
