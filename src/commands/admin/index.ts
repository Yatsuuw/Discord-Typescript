import { category } from '../../utils'
import setup from './setup'
import bdd from './bdd'
import emit from './emit'
import reload from './reload'

export default category('Administration', [
    setup,
    bdd,
    emit,
    reload,
])
