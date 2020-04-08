import LogAdapter  from "../LogAdapter";
import BaseAdapter  from "./BaseAdapter";


export default class ConsoleAdapter extends BaseAdapter implements LogAdapter  {


    log(context: string, event: any): void {
        let {str,logs} = this.generateLog(context,event);
        console.log( str, ...logs)
    
    }

}