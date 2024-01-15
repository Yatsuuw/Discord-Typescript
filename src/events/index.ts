import { Event } from '../types'
import ready from './ready'
import interactionCreate from './interactionCreate'
import guildMember from './guildMember'

const events: Event<any>[] = [
    ...interactionCreate,
    ready,
    ...guildMember,
]

export default events
