import { Event } from '../types'
import ready from './ready'
import interactionCreate from './interactionCreate'
import guildMember from './guildMember'
import thread from './thread'
import messageCreate from './messageCreate'

//console.log(interactionCreate);

const events: Event<any>[] = [
    ...interactionCreate,
    ready,
    ...guildMember,
    ...thread,
    messageCreate,
]

export default events
