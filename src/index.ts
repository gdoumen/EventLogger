import * as EventLogger from './EventLogger'
import * as Context from './Context'
import * as LogAdapter from './LogAdapter'
import * as ConsoleAdpter from './Adapters/ConsoleAdapter'

let Adapters = {
    ConsoleAdpter
}

export {
    EventLogger,
    Context,
    LogAdapter,
    Adapters
}

