import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

const meta = new SlashCommandBuilder ()
    .setName('setup')
    .setDescription('Initialiser le bot dans la base de données.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)

export default command(meta, async ({ interaction }) => {
    const guildId = interaction.guild?.id;

    if (!guildId) {
        return interaction.reply({
            ephemeral: true,
            content: "Cette commande doit être utilisée dans un serveur."
        });
    }

    const existingServer = await new Promise<boolean>((resolve) => {
        db.get('SELECT 1 FROM server_settings WHERE guildId = ?', [guildId], (err, row) => {
            resolve(!!row);
        });
    });

    if (existingServer) {
        const existingServerEmbed = new EmbedBuilder()
            .setTitle("Initialisation du serveur")
            .setDescription("Le serveur est déjà initialisé dans la base de données.")
            .setColor("Yellow")
            .setTimestamp()
            .setFooter({ text: "Par yatsuuw @ Discord" })

        return interaction.reply({
            ephemeral: true,
            embeds: [existingServerEmbed]
        });
    }

    db.run(`
        INSERT OR IGNORE INTO server_settings (guildId, logChannelId, welcomeChannelId, leaveChannelId, welcomeGifUrl, leaveGifUrl)
        VALUES (?, NULL, NULL, NULL, 'https://c.tenor.com/A8bNTOeNznQAAAAC/tenor.gif', 'https://c.tenor.com/A8bNTOeNznQAAAAC/tenor.gif')
    `, [guildId], (err) => {
        if (err) {
            console.error('Erreur de l\'initialisation du serveur dans la base de données. Erreur :\n', err)
            return interaction.reply({
                ephemeral: true,
                content: "Une erreur s'est produite lors de l'initialisation de la base de données."
            });
        }

        const successEmbed = new EmbedBuilder()
            .setTitle("Initialisation du serveur")
            .setDescription("Le serveur a été initialisé avec succès dans la base de données.")
            .setColor("Green")
            .setTimestamp()
            .setFooter({ text: "Par yatsuuw @ Discord" })

        return interaction.reply({
            ephemeral: true,
            embeds: [successEmbed]
        });
    });
});
