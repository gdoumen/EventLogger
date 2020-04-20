
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
        if ( ad.filter==undefined)  {
            result.push(ad.adapter)                            
        }
        else {
            try {
                if (ad.filter(context,event)==true )
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
    resetAdapters

}