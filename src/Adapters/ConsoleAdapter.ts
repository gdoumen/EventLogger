import LogAdapter  from "../LogAdapter";


function toStr(o:Object) {
    let str:string = '';
    let keys = Object.keys(o);
    let values = Object.values(o);
    let value : string;

    if (Array.isArray(o)) {
        value = o.map( v=> typeof(v)==='object' ? toStr(v) : typeof(v)!=='string' ? v : "'"+v+"'" ).join(',');
        str = '['+value+']'
        return str;
    }

    keys.forEach( (key,i) => {
        if ( typeof values[i] ==='object')
            value = toStr(values[i]);
        else if ( typeof values[i] ==='string')
            value = "'"+values[i]+"'";
        else
            value = values[i]
        if ( str.length>0) str+=','
        str+=(key+':'+value)
    })
    return '{'+str+'}';
}

export default class ConsoleAdapter implements LogAdapter {


    log(context: string, event: any): void {
        let ts;
        let message;
        let str = '';
        let keys : Array<any> = [];

        let key;
        for  ( key in event) {
            if ( key==='ts') ts = event[key];
            else if ( key==='message') message = event[key]
            else {
                if ( typeof(event[key])==='object' )
                    keys.push(key + ':' + toStr(event[key]))
                else  if ( typeof (event[key]) ==='string')
                    keys.push(key + ':' + ("'"+event[key]+"'"))
    
                else
                    keys.push(key + ':' + event[key])
            }
        }

        if ( ts!==undefined) str += ts
        if ( str.length>0) str+='\t'
        str+=context
        str+=('\t'+message)

        console.log( str, ...keys)
    
    }

}