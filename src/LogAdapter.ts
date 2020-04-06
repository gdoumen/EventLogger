
export default interface LogAdapter {
    log(context: string, event:any):void    
}

interface FilterFunc { (context:string,event?:any) : boolean }
interface LogAdapterDescription {
    adapter: LogAdapter,
    filter?: FilterFunc
}
var adapters: Array<LogAdapterDescription> = [];
 

function registerLogAdapter( adapter: LogAdapter, filter?:FilterFunc ) {
    adapters.push( {adapter,filter} )
}

function getLogAdapters(context:string,event?:any) : Array<LogAdapter> {
    let result:Array<LogAdapter> = [];

    adapters.forEach( (ad:LogAdapterDescription) => { 
        if ( ad.filter==undefined || ad.filter(context,event)==true )
            result.push(ad.adapter)            
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
    resetAdapters

}