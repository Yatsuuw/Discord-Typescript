import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

const meta = new SlashCommandBuilder ()
    .setName('setup')
    .setDescription('Initialise the bot in the database.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)

export default command(meta, async ({ interaction }) => {
    const guildId = interaction.guild?.id;
    const guildName = interaction.guild?.name;

    if (!guildId) {
        return interaction.reply({
            ephemeral: true,
            content: "This command must be used on a server."
        });
    }

    const existingServer = await new Promise<boolean>((resolve) => {
        db.get('SELECT 1 FROM servers_settings WHERE guildId = ?', [guildId], (err, row) => {
            resolve(!!row);
            if (err) {
                console.error('Error when creating the server in the database.', err);
                return;
            }
        });
    });

    if (existingServer) {
        const existingServerEmbed = new EmbedBuilder()
            .setTitle("Server initialisation")
            .setDescription("The server is already initialised in the database.\n**→ /bdd** for configure your server database.\n**→ /help** for more informations.\n**→ /version** for the current version of the bot.")
            .setColor("Yellow")
            .setTimestamp()
            .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })

        return interaction.reply({
            ephemeral: true,
            embeds: [existingServerEmbed]
        });
    }

    db.run(`
        INSERT OR IGNORE INTO servers_settings (guildId, logChannelId, welcomeChannelId, leaveChannelId, welcomeGifUrl, leaveGifUrl, levelChannelID, levelSystem)
        VALUES (?, NULL, NULL, NULL, 'https://c.tenor.com/A8bNTOeNznQAAAAC/tenor.gif', 'https://c.tenor.com/A8bNTOeNznQAAAAC/tenor.gif', NULL, 0)
    `, [guildId], (err) => {
        if (err) {
            console.error(`Server initialization error in the database for server ${guildName} (${guildId}) in the table \`servers_settings\`. Error`, err)
            return interaction.reply({
                ephemeral: true,
                content: "An error has occurred during database initialisation in the table \`servers_settings\`."
            });
        }
    });
    db.run(`
        INSERT OR IGNORE INTO servers_tickets (guildId, ticketsModId, ticketsName) VALUES (?, NULL, 'Tickets')`, [guildId], (err) => {
        if (err) {
            console.error(`Server initialization error in the database for server ${guildName} (${guildId}) in the table \`servers_tickets\`. Error`, err)
            return interaction.reply({
                ephemeral: true,
                content: "An error has occurred during database initialisation in the table \`servers_tickets\`."
            });
        }
    });
    db.run(`
        INSERT OR IGNORE INTO servers_voices (guildId, voiceCategoryName, voiceChannelName) VALUES (?, 'Voices Channels', 'Create a voice channel')`, [guildId], (err) => {
        if (err) {
            console.error(`Server initialization error in the database for server ${guildName} (${guildId}) in the table \`servers_voices\`. Error`, err)
            return interaction.reply({
                ephemeral: true,
                content: "An error has occurred during database initialisation in the table \`servers_voices\`."
            });
        }
    });

    const successEmbedSettings = new EmbedBuilder()
            .setTitle("Server initialisation")
            .setDescription("The server has been successfully initialised in the database for the table corresponding to the general configuration.\n**→ /bdd** for configure your server database.\n**→ /help** for more informations.\n**→ /version** for the current version of the bot.")
            .setColor("Green")
            .setTimestamp()
            .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })

    const successEmbedTickets = new EmbedBuilder()
        .setTitle("Server initialisation")
        .setDescription("The server has been successfully initialised in the database for the table corresponding to the tickets.")
        .setColor("Green")
        .setTimestamp()
        .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })

    const successEmbedVoices = new EmbedBuilder()
        .setTitle("Server initialisation")
        .setDescription("The server has been successfully initialised in the database for the table corresponding to the voices channels.")
        .setColor("Green")
        .setTimestamp()
        .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })

    return interaction.reply({
        ephemeral: false,
        embeds: [successEmbedSettings, successEmbedTickets, successEmbedVoices]
    });
});
