export default class Context {

    private data : any
    private name : string
    private parent?: Context

    constructor ( name:string, payload?: any, parent?:Context) {
        this.data = {}    
        this.name = name;
        this.parent = parent;

        if ( payload!==undefined) {
            let key : string;

            for (key in payload) {
                this.data[key]= payload[key]
            }
    
        }
    }

    getName() : string {
        return this.name;
    }

    get(payload?:any,depth?:number) : {name:string,data:any} {

        if (payload===undefined) {
            if ( this.parent===undefined || (depth!==undefined && depth<2) )
                return {name:this.name, data:this.data};        
            let d = depth===undefined? undefined : depth-1;
            let data = this.merge(this.parent.get(undefined,d).data,false);
            return {name:this.name, data}
        }

        if ( depth!==undefined && depth<1) 
            return {name:this.name, data:payload}
        
        let data = this.merge(payload,true,true,depth);
        return {name:this.name, data}

    }

    getParent() : Context|undefined {
        return this.parent;
    }

    getValue( key : string) : Object {
        return this.data[key] 
    }

    setValue( key : string, value?: Object ) {
        this.data[key] = value;
    }

    deleteValue( key : string ) {
        delete this.data[key];
    }

    update( payload: any) : any{
        let key : string;

        for (key in payload) {
            this.data[key]= payload[key]
        }
        return this.data;
    }

    merge( payload: any, before:boolean=true, withParent:boolean=false, depth?:number) : any {
        let result : any;
        let key : string;
        let origin = this.data;

        if ( withParent) {
            origin = this.get(undefined,depth).data;
        }
        result = {}
        if (before) {
            for (key in origin) {
                result[key] = origin[key];
            }    
        }
        for (key in payload) {
            result[key] = payload[key];
        }
        if (!before) {
            for (key in origin) {
                result[key] = origin[key];
            }    
        }
        return result
    }

}