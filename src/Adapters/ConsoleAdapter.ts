import LogAdapter  from "../LogAdapter";

export default class ConsoleAdapter implements LogAdapter {
    
    log(context: string, event: any): void {
        console.log( context,event)
    }

}