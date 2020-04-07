import Context from './Context'
import LogAdapter,{FilterFunc,registerLogAdapter,getLogAdapters,resetAdapters} from './LogAdapter';

var GlobalConfig : any =  {
    autoTimeStamp : true
}

export default class EventLogger {
    private context: Context;
    private parent: EventLogger | undefined;

    constructor (name: string, parent?:EventLogger) {
        this.parent = parent;
        let parentCtx = undefined;

        if ( parent!==undefined) {
            parentCtx = parent.context;
        }
        this.context = new Context(name,undefined,parentCtx);
    }

    getName() : string {
        return this.context.getName();
    }

    getParent() : EventLogger|undefined {
        return this.parent;
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

    // test only, don't use
    _get() {
        return this.context.get().data;
    }

    static registerAdapter(  adapter: LogAdapter, filter?:FilterFunc ) {
        registerLogAdapter(adapter,filter);
    }

    static reset() {
        resetAdapters();
        this.setGlobalConfig('autoTimeStamp', true)
    }

    static setGlobalConfig(key:string, value: any) : void{
        GlobalConfig[key] = value;
    }
    
}