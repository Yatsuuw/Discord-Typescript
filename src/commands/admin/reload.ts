import { command } from '../../utils/command'
import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import keys from '../../keys';
import { db } from '../../utils/database';

interface ServersSettings {
    logChannelId?: string;
}

const meta = new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Restart the bot.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(true)

export default command(meta, async ({ interaction, client }) => {
    const guildId = interaction.guild?.id;
    const guildName = interaction.guild?.name;
    const guildsCount = client.guilds.cache.size || 0;

    if (interaction.guild) {

        db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guildId], async (err, row: ServersSettings) => {
            if (err) {
                console.error(`Error retrieving the "logChannelId" parameter for the ${guildName} server (${guildId}). Error :`, err);
                return;
            }

            const logChannelId = row?.logChannelId;

            if (logChannelId) {
                try {
                    const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;

                    if (logChannel) {
                        try {
                            if (interaction.user.id !== keys.ownerId) {

                                const dontOwner = new EmbedBuilder()
                                    .setTitle('Error')
                                    .setDescription('You do not have permission to run this command.')
                                    .setColor('Red')
                                    .addFields([
                                        { name: 'Permission', value: 'Your account ID does not match that of the bot owner.' }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })
                        
                                interaction.reply({ embeds: [dontOwner], ephemeral: true })
                            } else {
                        
                                const reloadSuccess = new EmbedBuilder()
                                    .setTitle('Restart')
                                    .setDescription('The bot will restart.')
                                    .setColor('Blue')
                                    .addFields([
                                        { name: 'Status', value: `Restart validated ✅.\nPlease wait between 5 and 10 seconds before using the bot again to avoid any problems.` },
                                        { name: 'Guilds count', value: `I'm on \`${guildsCount}\` servers.` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })

                                const reloadLog = new EmbedBuilder()
                                    .setTitle('Restart')
                                    .setDescription('The bot has been restart.')
                                    .setColor('Blue')
                                    .addFields([
                                        { name: 'Status', value: `Restart has been validated ✅.\nPlease wait between 5 and 10 seconds before using the bot again to avoid any problems.` },
                                        { name: 'Guilds count', value: `I'm on \`${guildsCount}\` servers.` }
                                    ])
                                    .setTimestamp()
                                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })
                        
                                await interaction.reply({ embeds: [reloadSuccess], ephemeral: true })
                                await logChannel.send({ embeds: [reloadLog] })
                        
                                return process.exit();
                            };
                        } catch (error) {
                            await interaction.reply({ content: `An error has occurred when launching the restart: ${error}`, ephemeral: true });
                        }
                    } else {
                        console.error(`The log channel with ID ${logChannelId} was not found for server ${guildName} (${guildId}).`);
                    }
                } catch (error) {
                    console.error(`Error retrieving the log room for the ${guildName} server:  `, error);
                }
            } else {
                console.error(`The log channel ID is empty in the database for the ${guildName} server (${guildId}).`);
            }
        });
    } else {
        try {
            if (interaction.user.id !== keys.ownerId) {
                const dontOwner = new EmbedBuilder()
                    .setTitle('Error')
                    .setDescription('You do not have permission to run this command.')
                    .setColor('Red')
                    .addFields([
                        { name: 'Permission', value: 'Your account ID does not match that of the bot owner.' }
                    ])
                    .setTimestamp()
                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })

                    await interaction.reply({ embeds: [dontOwner], ephemeral: true });
            } else {
                const reloadSuccess = new EmbedBuilder()
                    .setTitle('Restart')
                    .setDescription('The bot will restart.')
                    .setColor('Blue')
                    .addFields([
                        { name: 'Status', value: `Restart validated ✅.\nPlease wait between 5 and 10 seconds before using the bot again to avoid any problems.` },
                        { name: 'Guilds count', value: `I'm on \`${guildsCount}\` servers.` }
                    ])
                    .setTimestamp()
                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })

                await interaction.reply({ embeds: [reloadSuccess], ephemeral: false })

                return process.exit();
            }
        } catch (error) {
            await interaction.reply({ content: `An error has occured when launching the restart: ${error}`, ephemeral: true })
            console.error(error);
        }
    }
});
