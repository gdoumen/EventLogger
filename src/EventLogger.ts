import Context from './Context'
import LogAdapter,{FilterFunc,registerLogAdapter,getLogAdapters,resetAdapters} from './LogAdapter';

const GlobalConfigDefault = {
    autoTimeStamp : true,
    lazyLoading:false,
    root:undefined
}

export interface IHash {
    [details: string] : EventLogger;
} 

interface EventLoggerConfig {
    name: string, parent?:EventLogger|string
}

export default class EventLogger {
    private context: Context;
    private parent?: EventLogger;
    private config:EventLoggerConfig;
    private isReady:boolean;
    private isBusy:boolean;
    private events:Array<any>;

    private static loggers:IHash = {}
    private static GlobalConfig:any =  JSON.parse(JSON.stringify(GlobalConfigDefault));

    constructor (name: string, parent?:EventLogger|string) {

        this.isReady= false;
        this.config  = {name,parent};
        this.isBusy = false;
        this.events = [];

        if ( !EventLogger.GlobalConfig.lazyLoading)
            this.init();
    }

    init() {

        let name = this.config.name;
        let parent = this.config.parent;

        let parentObj;        
        parentObj = ( parent!==undefined && typeof(parent)==='string') ? EventLogger.loggers[parent] : parent;
        if ( parentObj===undefined) parentObj = EventLogger.GlobalConfig.root;

        if ( EventLogger.loggers[name]===undefined) {
            let parentCtx = undefined;
            if ( parentObj!==undefined) {
                parentCtx = parentObj.context;
            }
            this.context = new Context(name,undefined,parentCtx);  
            EventLogger.loggers[name] = this;             
        }
        else {  // existing Context
            this.context = EventLogger.loggers[name].context;
        }
        this.parent = parentObj;

        if ( EventLogger.GlobalConfig.root===undefined) {
            EventLogger.GlobalConfig.root = this;
        }

        this.isReady = true;
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
        if ( !this.isReady )
            this.init();
        this.context.update(payload)
    }

    createEvent(str : string, ...args: any[] ) :{message:string} {
        let message = str;
        if ( args.length>0)
            message = message + " " + args.join(" ");
        return {message};
    }
    
    log(str : string, ...args: any[] )  {
        this.logEvent( this.createEvent(str,...args));
    }

    debug(str : string, ...args: any[] )  {
        this.logEvent( this.createEvent(str,...args),'debug');
    }
    info(str : string, ...args: any[] )  {
        this.logEvent( this.createEvent(str,...args),'info');
    }
    error(str : string, ...args: any[] )  {
        this.logEvent( this.createEvent(str,...args),'error');
    }

    
    logEvent(event : any,level?:string )  {
        if ( !this.isReady )
            this.init();

        if (level!==undefined) {
            event.level = level;
        }
        let {name,data} = this.context.get(event);
        let adapters = getLogAdapters(name,data);
    
        if ( EventLogger.GlobalConfig.autoTimeStamp){
            data.ts =  (new Date()).toISOString();
            event.ts = data.ts;
        }
        
        this.events.push({data,event,context:this.context});
        
        if ( !this.isBusy) {
            this.isBusy = true;

            adapters.forEach( adapter => {
                try {
                    this.events.forEach( ev => {adapter.log(name,ev.data,ev) })                    
                }
                catch (error) {
                    //ignore
                }
            })
            this.isBusy = false;
            this.events = [];
        }
        
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
        EventLogger.loggers = {}
        EventLogger.GlobalConfig  =  JSON.parse(JSON.stringify(GlobalConfigDefault));
    }

    static setGlobalConfig(key:string, value: any) : void{
        EventLogger.GlobalConfig[key] = value;
    }
    
}