import LogAdapter  from "../LogAdapter";
import BaseAdapter  from "./BaseAdapter";
var fs = require('fs');

interface FileOpts {
    name? : string
    fs?: any
}

/* istanbul ignore next */
function nop() {}

export default class FileAdapter extends BaseAdapter implements LogAdapter  {

    private opts : FileOpts = {
        name : 'logfile.json',
        fs: fs
    }

    constructor( opts?:FileOpts ){
        super();
        if (opts!==undefined) {
            if ( opts.name!==undefined) this.opts.name = opts.name
            if ( opts.fs!==undefined) this.opts.fs = opts.fs
        }
    }

    log(context: string, event: any): void {
        event.context = context;

        this.opts.fs.appendFile(this.opts.name, this.toStr(event,-1)+'\n','utf8', nop)
    }

}