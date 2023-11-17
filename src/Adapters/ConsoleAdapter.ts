import LogAdapter,{RawEvent}  from "../LogAdapter";
import BaseAdapter  from "./BaseAdapter";


export default class ConsoleAdapter extends BaseAdapter implements LogAdapter  {


    log(contextName: string, event: any,raw?:RawEvent): void {
        let {str,logs} = this.generateLog(contextName,event,raw);
        // istanbul ignore next
        const idx = logs?.findIndex( str => str.startsWith('context:') )
        if (idx!==-1)
            logs.splice(idx,1)
        console.log( str, ...logs)
    
    }

}