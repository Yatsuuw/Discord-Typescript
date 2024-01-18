import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { command } from '../../utils'
import { db } from '../../utils/database'

const meta = new SlashCommandBuilder ()
    .setName('bdd')
    .setDescription('Modifier les valeurs de la base de données.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addStringOption(option =>
        option
            .setName("data")
            .setDescription("Valeur à modifier")
            .setRequired(true)
            .addChoices(
                { name: 'Log Channel ID', value: 'logchannelid' },
                { name: 'Welcome Channel ID', value: 'welcomechannelid' },
                { name: 'Leave Channel ID', value: 'leavechannelid' },
                { name: 'Welcome Gif URL', value: 'welcomegifurl' },
                { name: 'Leave Gif URL', value: 'leavegifurl' }
            )
    )
    .addStringOption(option =>
        option
            .setName("element")
            .setDescription("Élément qui remplacera la précédente.")
            .setRequired(true)
    )

export default command(meta, async ({ interaction }) => {
    const key = interaction.options.getString('data');
    const guildId = interaction.guild?.id;
    const logChannelId = interaction.options.getString("element")
    const welcomeChannelId = interaction.options.getString("element")
    const leaveChannelId = interaction.options.getString("element")
    const welcomeGifUrl = interaction.options.getString("element");
    const leaveGifUrl = interaction.options.getString("element");

    if (key == "logchannelid")
        try {
            db.run(`UPDATE servers_settings SET logChannelId = ? WHERE guildId = ?`, [logChannelId, guildId])
            interaction.reply({
                ephemeral: true,
                content: `L'ID du salon des logs a bien été modifié.\nNouvel ID : ${logChannelId}`
            })
        } catch (error) {
            console.error(`Une erreur est survenue lors de la modification de l'ID du salon des logs sur le serveur ${interaction.guild?.name}. Erreur :\n`, error);
            interaction.reply({
                ephemeral: true,
                content: `Une erreur est survenue lors de la modification de l'ID du salon des logs.`
            });
        };
    if (key == "welcomechannelid")
        try {
            db.run(`UPDATE servers_settings SET welcomeChannelID = ? WHERE guildId = ?`, [welcomeChannelId, guildId])
            interaction.reply({
                ephemeral: true,
                content: `L'ID du salon des messages de bienvenue a bien été modifié.\nNouvel ID : ${welcomeChannelId}`
            })
        } catch (error) {
            console.error(`Une erreur est survenue lors de la modification de l'ID du salon des messages de bienvenue sur le serveur ${interaction.guild?.name}. Erreur :\n`, error);
            interaction.reply({
                ephemeral: true,
                content: `Une erreur est survenue lors de la modification de l'ID du salon des messages de bienvenue.`
            });
        };
    if (key == "leavechannelid")
        try {
            db.run(`UPDATE servers_settings SET leaveChannelID = ? WHERE guildId = ?`, [leaveChannelId, guildId])
            interaction.reply({
                ephemeral: true,
                content: `L'ID du salon des messages de départ a bien été modifié.\nNouvel ID : ${leaveChannelId}`
            })
        } catch (error) {
            console.error(`Une erreur est survenue lors de la modification de l'ID du salon des messages de départ sur le serveur ${interaction.guild?.name}. Erreur :\n`, error);
            interaction.reply({
                ephemeral: true,
                content: `Une erreur est survenue lors de la modification de l'ID du salon des messages de départ.`
            });
        };
    if (key == "welcomegifurl")
        try {
            db.run(`UPDATE servers_settings SET welcomeGifUrl = ? WHERE guildId = ?`, [welcomeGifUrl, guildId])
            interaction.reply({
                ephemeral: true,
                content: `Le lien du gif du message de bienvenue a été modifié.\nNouveau lien : ${leaveChannelId}`
            })
        } catch (error) {
            console.error(`Une erreur est survenue lors de la modification du lien du gif de bienvenue sur le serveur ${interaction.guild?.name}. Erreur :\n`, error);
            interaction.reply({
                ephemeral: true,
                content: `Une erreur est survenue lors de la modification du lien du gif de bienvenue.`
            });
        };
    if (key == "leavegifurl")
        try {
            db.run(`UPDATE servers_settings SET leaveGifUrl = ? WHERE guildId = ?`, [leaveGifUrl, guildId])
            interaction.reply({
                ephemeral: true,
                content: `Le lien du gif du message de départ a été modifié.\nNouveau lien : ${leaveChannelId}`
            })
        } catch (error) {
            console.error(`Une erreur est survenue lors de la modification du lien du gif de départ sur le serveur ${interaction.guild?.name}. Erreur :\n`, error);
            interaction.reply({
                ephemeral: true,
                content: `Une erreur est survenue lors de la modification du lien du gif de départ.`
            });
        };
})
