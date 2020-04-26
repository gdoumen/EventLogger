import LogAdapter,{RawEvent}  from "../LogAdapter";
import BaseAdapter  from "./BaseAdapter";


export default class ConsoleAdapter extends BaseAdapter implements LogAdapter  {


    log(contextName: string, event: any,raw?:RawEvent): void {
         
        let {str,logs} = this.generateLog(contextName,event,raw);
        console.log( str, ...logs)
    
    }

}