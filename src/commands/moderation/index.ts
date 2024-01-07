import { category } from '../../utils'
import kick from './kick'
import ban from './ban'
import clear from './clear'
import mute from './mute'
import unmute from './unmute'
import channel from './channel'
import userinfo from './userinfo'

export default category('Moderation', [
    kick,
    ban,
    clear,
    mute,
    unmute,
    channel,
    userinfo,
])
