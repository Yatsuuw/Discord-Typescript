import { ActivityType } from 'discord.js'
import { event } from '../utils'

export default event('ready', ({ log }, client) => {
    log(`Connexion réussie sur le client "${client.user.username}" (${client.user.id}).`)
    client.user.setPresence({ activities: [{ name: 'En cours de développement', type: ActivityType.Watching }], status: 'dnd' })
})
