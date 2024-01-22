import { Event } from '../types'
import ready from './ready'
import interactionCreate from './interactionCreate'
import guildMember from './guildMember'
import thread from './thread'

const events: Event<any>[] = [
    ...interactionCreate,
    ready,
    ...guildMember,
    ...thread,
]

export default events
