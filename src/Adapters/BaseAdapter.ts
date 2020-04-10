import LogAdapter  from "../LogAdapter";


export default class BaseAdapter implements LogAdapter {


    toStr(o:Object,depth:number=0) {
        let str:string = '';

        if ( o===null) return 'null';
        if ( depth>3) return '{...}';

        let keys = Object.keys(o);
        let values = Object.values(o);
        let value : string;
        let self = this;

        if (Array.isArray(o)) {
            value = o.map( v=> typeof(v)==='object' ? self.toStr(v,depth+1) : typeof(v)!=='string' ? v : "'"+v+"'" ).join(',');
            str = '['+value+']'
            return str;
        }
    
        keys.forEach( (key,i) => {
            if ( typeof values[i] ==='object')
                value = self.toStr(values[i],depth+1);
            else if ( typeof values[i] ==='string')
                value = "'"+values[i]+"'";
            else
                value = values[i]
            if ( str.length>0) str+=','
            str+=(key+':'+value)
        })
        return '{'+str+'}';
    }

    generateLog(context: string, event: any) : {str:string,logs:Array<string>} {
        try {
            let ts;
            let message;
            let str = '';
            let logs : Array<any> = [];
            let self = this;
    
            let key;
            for  ( key in event) {
                if ( key==='ts') ts = event[key];
                else if ( key==='message') message = event[key]
                else {
                    if ( typeof(event[key])==='object' )
                        logs.push(key + ':' + self.toStr(event[key]))
                    else  if ( typeof (event[key]) ==='string')
                        logs.push(key + ':' + ("'"+event[key]+"'"))
        
                    else
                        logs.push(key + ':' + event[key])
                }
            }
    
            if ( ts!==undefined) str += ts
            if ( str.length>0) str+='\t'
            str+=context
            str+=('\t'+message)
    
            return { str, logs }
    
        }
        catch (error) {
            return {str:'Error',logs:[error]};
        }
    }
    /* istanbul ignore next */
    log(context: string, event: any): void {
        // to be implemeted
    }

}