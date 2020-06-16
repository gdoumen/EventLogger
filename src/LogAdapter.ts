import Context from './Context'

interface RawEvent  {
    context:Context,
    event:any,
}

export default interface LogAdapter {
    log(contextName: string, event:any, raw?:RawEvent):void    
}

type FilterFunc = (context:string,event?:any) => boolean 
interface LogAdapterDescription {
    adapter: LogAdapter,
    filter?: FilterFunc
}
var adapters: LogAdapterDescription[] = [];
 

function registerLogAdapter( adapter: LogAdapter, filter?:FilterFunc ) {
    adapters.push( {adapter,filter} )
}

function getLogAdapters(context:string,event?:any) : LogAdapter[] {
    let result:LogAdapter[] = [];

    adapters.forEach( (ad:LogAdapterDescription) => { 
        if ( ad.filter===undefined)  {
            result.push(ad.adapter)                            
        }
        else {
            try {
                if (ad.filter(context,event)===true )
                    result.push(ad.adapter)                            
            }
            catch (error) {
                //ignore
            }
        } 
    } )
    return result;
}

function resetAdapters() :void {
    adapters = [];
}


export  {
    FilterFunc,
    registerLogAdapter,
    getLogAdapters,
    resetAdapters,
    RawEvent

}