import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

interface ServersSettings {
    logChannelId?: string,
}

const meta = new SlashCommandBuilder ()
    .setName('ping')
    .setDescription('Ping the bot for a response.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addStringOption((option) => 
        option
            .setName('message')
            .setDescription('Provide the bot a message to respond with.')
            .setMinLength(1)
            .setMaxLength(2000)
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

        const message = interaction.options.getString('message');
        const logChannelId = row?.logChannelId;

        if (logChannelId) {
            try {
                const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;

                if (logChannel) {
                    try {
                        await interaction.reply({
                            ephemeral: true,
                            content: message ?? 'Pong! 🏓'
                        })
                    } catch (error) {
                        await interaction.reply({ content: `An error occurred when calculating the bot's latency. Error :\n${error}` });
                    }

                    const logPing = new EmbedBuilder()
                        .setTitle("Ping command log")
                        .setDescription(`${interaction.user.tag} used the command \`/ping\` in the lounge <#${interaction.channel?.id}>.`)
                        .setColor('White')
                        .addFields([
                            { name: 'User', value: `<@${interaction.user.id}>` },
                            { name: 'Message', value: `${message || "No message"}` }
                        ])
                        .setTimestamp()
                        .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })

                    return logChannel.send({ embeds: [logPing] })
                } else {
                    console.error(`The log channel with ID ${logChannelId} was not found for server ${guildName} (${guildId}).`);
                }
            } catch (error) {
                console.error(`Error retrieving the log room for server ${guildName} (${guildId}). Error : `, error);
            }
        } else {
            console.error(`The log channel ID is empty in the database for the ${guildName} server (${guildId}).`)
        }
    });
});
