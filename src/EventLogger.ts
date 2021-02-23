import Context from './Context'
import LogAdapter,{FilterFunc,registerLogAdapter,getLogAdapters,resetAdapters} from './LogAdapter';
import {isClass,isFunc,isSymbol} from './utils'

const MAX_DEPTH=7;

let __debug = false;

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

const GLOBAL_CONTEXT_NAME='__global'
let globalLogger : EventLogger = undefined; 

export interface EventLoggerInterface {
    log(str : string, ...args: any[] ): void ;
    logEvent(event : any,level?:string ): void;
}

export default class EventLogger implements EventLoggerInterface{
    private context: Context;
    private parent?: EventLogger;
    private config:EventLoggerConfig;
    private isReady:boolean;
    private isBusy:boolean;
    private events:Array<any>;

    private static loggers:IHash = {}
    private static GlobalConfig:any =  JSON.parse(JSON.stringify(GlobalConfigDefault));
    private static KeyBlackList: Array<string> = [];
    private static externalLogger?: EventLoggerInterface = undefined;

    constructor (name: string, parent?:EventLogger|string) {

        const parentLogger:EventLogger|string = parent;
        this.isReady= false;
        this.config  = {name,parent:parentLogger};
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
        if ( parentObj===undefined && name!==GLOBAL_CONTEXT_NAME) parentObj = globalLogger;

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

        if ( EventLogger.GlobalConfig.root===undefined && name!==GLOBAL_CONTEXT_NAME) {
            EventLogger.GlobalConfig.root = this;
        }

        this.isReady = true;
    }

    getName() : string {
        return this.context.getName();
    }

    getParent() : EventLogger|undefined {
        if ( this.parent===undefined) return undefined;
        if ( this.parent.getName()===GLOBAL_CONTEXT_NAME) return undefined;
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

    setGlobal(payload:any): void {
        globalLogger.set(payload);
    }


    createEvent(str : string, ...args: any[] ) :{message:string} {
        let message = str;
        if ( args.length>0)
            message = message + " " + args.join(" ");
        return {message};
    }
    
    log(str : string, ...args: any[] ): void  {
        if ( EventLogger.externalLogger) {
            EventLogger.externalLogger.log(str,...args);
            return;
        }
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

    
    logEvent(event : any,level?:string ): void  {
        if ( EventLogger.externalLogger) {
            EventLogger.externalLogger.logEvent(event,level);
            return;
        }
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
                    this.events.forEach( ev => {
                        let {data,event,context} = ev;
                        //console.log( data, event);
                        data = this.filterBlackList(data);
                        event = this.filterBlackList(event);
                        
                        ev.event = event;

                        adapter.log(name,data,ev) 
                    })                    
                }
                catch (err) {
                    //ignore
                }
            })
            this.isBusy = false;
            this.events = [];
        }
        
    }


    filterBlackList(o:any,depth:number=0):Object {

        let str:string = '';
        let res = {}

        if ( o===null || o===undefined) return o;
        if ( depth>=MAX_DEPTH) return {};
        if ( isClass(o) ) return o;
        if ( isFunc(o) ) return;
        if ( isSymbol(o) ) return;



        if ( typeof(o)==='object' && !Array.isArray(o)) {

            try {
                JSON.stringify(o)
            }
            catch(err) {
                const keys = Object.keys(o);
                const values = Object.values(o);

                keys.forEach( (key,i) => {
                    if ( typeof values[i] !=='object')  {    
                        res[key]=values[i];
                    }
                })
                return res;
            }


            let keys = Object.keys(o);
            let values = Object.values(o);
            keys.forEach( (key,i) => {
    
                const isBlackList = (EventLogger.KeyBlackList.find( val => val===key)!==undefined)
    
    
                if ( values[i] === null )
                    res[key]= null;
                else if ( values[i] === undefined )
                    res[key]= undefined;
                else if ( typeof values[i] ==='object')  {    
                    res[key]= isBlackList ? '**filtered**' : this.filterBlackList(values[i],depth+1);
                }
                else if ( isClass(values[i]) ) res[key]=values[i];
                else if ( isFunc(values[i]) ) return;
                else if ( isSymbol(values[i]) ) return;
                else {
                    res[key]= isBlackList ? '**filtered**' : o[key];
                }
            });
        
        }

        
        else if (Array.isArray(o)  ) {
            const arr = o as Array<any>
            let arrRes = [];
            arr.forEach( v=> { arrRes.push(this.filterBlackList(v,depth+1)) });
            return arrRes;
        }
        else //if ( typeof(o)==='number' || typeof(o)==='string' || typeof(o)==='boolean')  
            return o;
        
    
        return res;
    }

    static setKeyBlackList( list: Array<string>):void {
        this.KeyBlackList = list;
    } 
    static addToBlackList(str:string) {
        if ( this.KeyBlackList.find( val => val===str))
            return; 
        this.KeyBlackList.push(str);
    }

    static setGlobalConfig(key:string, value: any) : void{
        EventLogger.GlobalConfig[key] = value;
    }

    // test only, don't use
    _get() {
        return this.context.get().data;
    }

    static _getGlobalLogger() {
        return globalLogger;
    }

    static registerAdapter(  adapter: LogAdapter, filter?:FilterFunc ) {
        registerLogAdapter(adapter,filter);
    }

    static reset() {
        resetAdapters();
        EventLogger.loggers = {}
        EventLogger.GlobalConfig  =  JSON.parse(JSON.stringify(GlobalConfigDefault));
        EventLogger.KeyBlackList = [];
        EventLogger.externalLogger = undefined
        globalLogger = new EventLogger(GLOBAL_CONTEXT_NAME);

    }


    static useExternalLogger( logger: EventLoggerInterface) {
        EventLogger.externalLogger = logger;
    }
}

globalLogger = new EventLogger(GLOBAL_CONTEXT_NAME);