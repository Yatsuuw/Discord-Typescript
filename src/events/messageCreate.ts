import { event } from '../utils';
import { db } from '../utils';
import { Message } from 'discord.js';
import { Xp } from '../utils/Xp';
import { addExperience } from '../utils/UserRankDB';

interface Levels {
    guildId?: string,
    userId?: string,
    level?: number,
    experience?: number,
}

export default event('messageCreate', async (client, message: Message) => {
    // Vérifier si le message n'est pas envoyé par un bot et est envoyé dans un serveur
    if (!message.author.bot && message.guild) {
        const guildId = message.guild.id;
        const userId = message.author.id;

        // Ajouter de l'expérience à l'utilisateur dans la base de données
        addExperience(guildId, userId);
    }
});