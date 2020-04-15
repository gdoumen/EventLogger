import BaseAdapter from "./BaseAdapter"



describe('toStr',()=>{

    test('class',()=> {
        const z = BaseAdapter;
        const adapter = new BaseAdapter();
        let res = adapter.toStr(z);

        expect(res).toBe('class BaseAdapter');
    });

    test('class in Object',()=> {
        const z = BaseAdapter;
        const adapter = new BaseAdapter();
        let res = adapter.toStr({a:1,z});

        expect(res).toBe('{a:1,z:class BaseAdapter}');
    });

    test('method',()=> {
        const fn = (a,b) => b;
        const adapter = new BaseAdapter();
        let res = adapter.toStr(fn);

        expect(res).toBe('');
    });

    test('method in Object',()=> {
        const fn = (a,b) => b;
        const adapter = new BaseAdapter();
        let res = adapter.toStr({a:1,fn});

        expect(res).toBe('{a:1}');
    });

    test('symbol',()=> {
        const sym = Symbol('xxx');
        const adapter = new BaseAdapter();
        let res = adapter.toStr(sym);

        expect(res).toBe('Symbol(xxx)');
    });

    test('symbol in Object',()=> {
        const sym = Symbol();
        const sym1 = Symbol('some prop');
        const adapter = new BaseAdapter();
        let res = adapter.toStr({a:1,y:sym,z:sym1});

        expect(res).toBe("{a:1,y:Symbol(),z:Symbol(some prop)}");
    });

}) 

describe('generateLog',()=>{

    let adapter;

    test( 'complex object with arrays' , ()=> {
        let a= { i:1, b:{ i:2, c: { i:3, d: {i:4, e: {i:5}}}}}

        let o = { message:'1', y: { deep:[ {z:a}]}}
        adapter = new BaseAdapter();
        let res = adapter.generateLog('test',o)
        expect(res.logs).toEqual(['y:{deep:[{z:{...}}]}']);

    });

    test( 'complex object' , ()=> {
        let a= { i:1, b:{ i:2, c: { i:3, d: {i:4, e: {i:5}}}}}

        let o = { message:'1', a}
        adapter = new BaseAdapter();
        let res = adapter.generateLog('test',o)
        expect(res.logs).toEqual(['a:{i:1,b:{i:2,c:{i:3,d:{...}}}}']);

    });

    test('class',()=> {
        const z = BaseAdapter;
        const adapter = new BaseAdapter();
        let res = adapter.generateLog('test',{z});

        expect(res.logs).toEqual(['z:class BaseAdapter']);
    });

    test('method',()=> {
        const fn = (a,b) => b;
        const adapter = new BaseAdapter();
        let res = adapter.generateLog('test',{fn});

        expect(res.logs).toEqual([]);
    });


    test('exceptional case: throws exception',()=> {
        adapter = new BaseAdapter();
        adapter.toStr = jest.fn((o:Object,depth:number=0):string=> { 
            throw new Error('my Error'); 
        })
        let res = adapter.generateLog('test',{a:{test:1}})

        expect(res.logs).toEqual(['Error: my Error']);
    });

})

