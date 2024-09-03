import { db } from "../../utils";
import { command } from "../../utils/command";
import { PermissionsBitField, CategoryChannel, VoiceChannel, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

interface ServersVoices {
    voiceCategoryName?: string;
    voiceChannelName?: string;
}

const meta = new SlashCommandBuilder()
    .setName('set-automatic-vocal-channel')
    .setDescription('Create a category and a lobby voice channel for dynamic voice channels.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export default command(meta, async ({ interaction }) => {
    const guild = interaction.guild;
    const guildId = guild?.id;
    const guildName = guild?.name;

    if (!guild) {
        return interaction.reply({ content: 'This command can only be executed in a Discord server.', ephemeral: true });
    }

    try {
        const row: ServersVoices = await new Promise((resolve, reject) => {
            db.get('SELECT voiceCategoryName, voiceChannelName FROM servers_voices WHERE guildId = ?', [guildId], (err, row: ServersVoices) => {
                if (err) {
                    console.error(`Error when retrieving the "voiceCategoryName" or/and "voiceChannelName" parameter(s) from the database for the ${guildName} server (${guildId}). \nError :\n`, err);
                    return reject(err);
                }
                resolve(row);
            });
        });

        const voiceCategoryName = row?.voiceCategoryName;
        const voiceChannelName = row?.voiceChannelName;

        if (!voiceCategoryName || !voiceChannelName) {
            return interaction.reply({ content: 'The voice category or channel name is not set in the database.', ephemeral: true });
        }

        const existingCategory = guild.channels.cache.find(channel => 
            channel.name === voiceCategoryName && channel.type === 4
        ) as CategoryChannel | undefined;

        if (existingCategory) {
            return interaction.reply({ content: `The category "${voiceCategoryName}" already exists. No need to create it again.`, ephemeral: true });
        }

        const category = await guild.channels.create({
            name: voiceCategoryName,
            type: 4,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionsBitField.Flags.Connect],
                },
            ],
        }) as unknown as CategoryChannel;

        const existingVoiceChannel = category.children.cache.find(channel => 
            channel.name === voiceChannelName && channel.type === 2
        ) as VoiceChannel | undefined;

        if (existingVoiceChannel) {
            return interaction.reply({ content: `The voice channel "${voiceChannelName}" already exists in the category "${voiceCategoryName}". No need to create it again.`, ephemeral: true });
        }

        await guild.channels.create({
            name: voiceChannelName,
            type: 2,
            parent: category.id,
            permissionOverwrites: [
                {
                    id: guild.id,
                    allow: [PermissionsBitField.Flags.Connect],
                },
            ],
        }) as unknown as VoiceChannel;

        return interaction.reply({ content: `Category "${voiceCategoryName}" and lobby voice channel "${voiceChannelName}" created successfully.`, ephemeral: true });

    } catch (error) {
        console.error(`An error occurred while setting up the automatic vocal channel for server ${guildName} (${guildId}). Error:`, error);
        return interaction.reply({ content: 'An error occurred while setting up the automatic vocal channel. Please check the logs for more details.', ephemeral: true });
    }
});
