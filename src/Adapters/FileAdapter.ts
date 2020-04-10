import LogAdapter  from "../LogAdapter";
import BaseAdapter  from "./BaseAdapter";
var fs = require('fs');

interface FileOpts {
    name? : string
}

/* istanbul ignore next */
function nop() {}

export default class FileAdapter extends BaseAdapter implements LogAdapter  {

    private opts : FileOpts = {
        name : 'logfile.json'
    }

    constructor( opts?:FileOpts ){
        super();
        if (opts!==undefined) {
            if ( opts.name!==undefined) this.opts.name = opts.name
        }
    }

    log(context: string, event: any): void {
        event.context = context;

        fs.appendFile(this.opts.name, this.toStr(event)+'\n','utf8', nop)
    }

}