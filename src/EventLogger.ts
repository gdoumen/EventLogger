import Context from './Context'
import  EventEmitter = require('events');
import LogAdapter,{FilterFunc,registerLogAdapter,getLogAdapters,resetAdapters} from './LogAdapter';

var loggers: Array<EventLogger> = [];

const GlobalConfigDefault =  {
    autoTimeStamp : true
}

var GlobalConfig:any = GlobalConfigDefault;

export default class EventLogger {
    private context: Context;

    constructor (name: string, parent?:EventLogger) {
        let parentCtx = undefined;
        if ( parent!==undefined) {
            parentCtx = parent.context;
        }

        this.context = new Context(name,undefined,parentCtx);
        let existingLogger= loggers.filter( (logger:EventLogger) => (logger.getName() == name) )        
        if (existingLogger===undefined) 
            loggers.push( this);
        
    }

    getName() : string {
        return this.context.getName();
    }
    setContext(context:Context){
        this.context = context;
    }

    set(payload:any) {
        this.context.update(payload)
    }

    log(str : string, ...args: any[] )  {
        let message = str;
        if ( args.length>0)
            message = message + " " + args.join(" ");
        this.logEvent({message});
    }
    
    logEvent(event : any )  {
        
        let {name,data} = this.context.get(event);
        let adapters = getLogAdapters(name,data);
    
        if ( GlobalConfig.autoTimeStamp)
            data.ts =  (new Date()).toISOString();
        adapters.forEach( adapter => adapter.log(name,data))
    }

    static registerAdapter(  adapter: LogAdapter, filter?:FilterFunc ) {
        registerLogAdapter(adapter,filter);
    }

    static reset() {
        resetAdapters();
        GlobalConfig = GlobalConfigDefault;
    }

    static setGlobalConfig(key:string, value: any) : void{
        GlobalConfig[key] = value;
    }
    
}