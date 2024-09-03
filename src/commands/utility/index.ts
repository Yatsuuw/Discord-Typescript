import { category } from '../../utils'
import message from './message'
import ping from './ping'
import help from './help'
import poll from './poll'
import jsdoc from './jsdoc'
import result from './result'
import avatar from './avatar'
import version from './version'
import level from './level'
import leaderboard from './leaderboard'
import setAutomaticVocalChannel from './setAutomaticVocalChannel'
import tickets from './tickets'

export default category('Utility', [
    message,
    ping,
    help,
    poll,
    jsdoc,
    result,
    avatar,
    version,
    level,
    leaderboard,
    setAutomaticVocalChannel,
    tickets,
])