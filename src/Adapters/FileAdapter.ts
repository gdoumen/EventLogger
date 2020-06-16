import LogAdapter, { RawEvent }  from "../LogAdapter";
import BaseAdapter,{Props}  from "./BaseAdapter";
import * as fs from 'fs';

interface FileOpts  extends Props {
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
        super(opts);
        if (opts!==undefined) {
            if ( opts.name!==undefined) this.opts.name = opts.name
            if ( opts.fs!==undefined) this.opts.fs = opts.fs
        }
    }

    log(context: string, event: any, raw?: RawEvent): void {
        event.context = context;

        let logEvent = event;

        if ( raw!==undefined && this.props.depth!==undefined) {
            let {name,data} = raw.context.get(raw.event,this.props.depth);
            logEvent = data;
            logEvent.context = name;
        }
        this.opts.fs.appendFile(this.opts.name, this.toStr(logEvent,-1)+'\n','utf8', nop)
    }

}

