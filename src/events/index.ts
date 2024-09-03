import { Event } from '../types'
import ready from './ready'
import interactionCreate from './interactionCreate'
import guildMember from './guildMember'
import thread from './thread'
import messageCreate from './messageCreate'
import voiceStateUpdate from './voiceStateUpdate'

const events: Event<any>[] = [
    ...interactionCreate,
    ready,
    ...guildMember,
    ...thread,
    messageCreate,
    voiceStateUpdate,
]

export default events
