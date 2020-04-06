import Context from './Context'

describe( 'Constructor', ()=> {

    test ( 'Context with name',()=> {
        let ctx = new Context('myCtx');
        expect(ctx.getName()).toBe('myCtx');
        expect(ctx.get().name).toBe('myCtx');
        expect(ctx.get().data).toEqual({});
    })

    test ( 'Context with name and payload',()=> {
        let payload = { x:1, y:2, z:'xx'}
        let ctx = new Context('myCtx',payload);
        expect(ctx.getName()).toBe('myCtx');
        expect(ctx.get().name).toBe('myCtx');
        expect(ctx.get().data).toEqual(payload);
    })
    
    test ( 'Context with name, payload and parent',()=> {
        let payload = { x:1, y:2, z:'xx'}
        
        let ctx = new Context('myCtx',payload,new Context('parent'));
        expect(ctx.getName()).toBe('myCtx');
        expect(ctx.get().name).toBe('myCtx');
        expect(ctx.get().data).toEqual(payload);
        expect(ctx.getParent()?.getName()).toBe('parent');
    })

})

describe( 'get', ()=> {
    
    test ( 'empty context',()=> {
        let ctx = new Context('myCtx');
        let res = ctx.get()
        expect(res.name).toEqual('myCtx');
        expect(res.data).toEqual({});
    })
    test ( 'context with some data',()=> {
        let ctx = new Context('myCtx',{b:2,c:3});
        let res = ctx.get()
        expect(res.name).toEqual('myCtx');
        expect(res.data).toEqual({b:2,c:3});
    })
    test ( 'context with parent',()=> {
        let ctx = new Context('myCtx',{b:2,c:3}, new Context('parent',{a:1}));
        let res = ctx.get();
        expect(res.name).toEqual('myCtx');
        expect(res.data).toEqual({a:1,b:2,c:3});
    })
    test ( 'context with parent - with overlap',()=> {
        let ctx = new Context('myCtx',{a:0,b:2,c:3}, new Context('parent',{a:1}));
        let res = ctx.get();
        expect(res.name).toEqual('myCtx');
        expect(res.data).toEqual({a:0,b:2,c:3});
    })

    test ( 'context chained parents',()=> {
        let ctx = new Context( 'XX',{z:'test'}, new Context('myCtx',{b:2,c:3}, new Context('parent',{a:1})));
        let res = ctx.get();
        expect(res.name).toEqual('XX');
        expect(res.data).toEqual({a:1,b:2,c:3,z:'test'});
    })

    test ( 'context chaned parents: with oayload',()=> {
        let ctx = new Context( 'XX',{z:'test'}, new Context('myCtx',{b:2,c:3}, new Context('parent',{a:1})));
        let res = ctx.get({a:'got it'});
        expect(res.name).toEqual('XX');
        expect(res.data).toEqual({a:'got it',b:2,c:3,z:'test'});
    })

})

describe( 'getValue', ()=> {
    
    test ( 'empty context',()=> {
        let ctx = new Context('myCtx');
        expect(ctx.getValue('a')).toBeUndefined;
        expect(ctx.getValue('b')).toBeUndefined;
    })
    test ( 'context with no overlap',()=> {
        let ctx = new Context('myCtx',{a:1});
        expect(ctx.getValue('a')).toBe(1);
        expect(ctx.getValue('b')).toBeUndefined;
    })

})

describe( 'setValue/deleteValue', ()=> {
    
    test ( 'context with no overlap',()=> {
        let ctx = new Context('myCtx',{a:1});
        ctx.setValue('b',2)
        expect(ctx.get().data).toEqual( {a:1,b:2})
    })
    test ( 'context with overlap',()=> {
        let ctx = new Context('myCtx',{a:1});
        ctx.setValue('a',2)
        expect(ctx.get().data).toEqual( {a:2})
    })
    test ( 'setter with undefined',()=> {
        let ctx = new Context('myCtx',{a:1});
        ctx.setValue('a',undefined)
        expect(ctx.get().data).toEqual( {a:undefined})
    })
    test ( 'delete',()=> {
        let ctx = new Context('myCtx',{a:1});
        ctx.deleteValue('a')
        expect(ctx.get().data).toEqual( {})
    })

})

describe( 'update', ()=> {
    
    test ( 'empty context',()=> {
        let ctx = new Context('myCtx');
        let res = ctx.update({a:1})
        expect(res).toEqual({a:1});
    })
    test ( 'context with no overlap',()=> {
        let ctx = new Context('myCtx',{b:2,c:3});
        let res = ctx.update({a:1})
        expect(res).toEqual({a:1,b:2,c:3});
    })
    test ( 'context with overlap',()=> {
        let ctx = new Context('myCtx',{a:0,b:2,c:3});
        let res = ctx.update({a:1})
        expect(res).toEqual({a:1,b:2,c:3});
    })
    test ( 'updating parent',()=> {
        let parent = new Context('parent',{a:0})
        let ctx = new Context('myCtx',{b:2,c:3},parent);
        let res;
        res = ctx.update({c:4})
        expect(res).toEqual({b:2,c:4});
        expect(ctx.get().data).toEqual({a:0,b:2,c:4});
        res = parent.update({a:1})
        expect(res).toEqual({a:1});
        expect(ctx.get().data).toEqual({a:1,b:2,c:4});
    })

})


describe( 'merge', ()=> {
    test ( 'empty context',()=> {
        let ctx = new Context('myCtx');
        let res = ctx.merge({a:1})
        expect(res).toEqual({a:1});
    })
    test ( 'context with no overlap',()=> {
        let ctx = new Context('myCtx',{b:2,c:3});
        let res = ctx.merge({a:1})
        expect(res).toEqual({a:1,b:2,c:3});
    })
    test ( 'context with overlap , before=true',()=> {
        let ctx = new Context('myCtx',{a:0,b:2,c:3});
        let res = ctx.merge({a:1})
        expect(res).toEqual({a:1,b:2,c:3});
    })
    test ( 'context with overlap , before=false',()=> {
        let ctx = new Context('myCtx',{a:0,b:2,c:3});
        let res = ctx.merge({a:1},false)
        expect(res).toEqual({a:0,b:2,c:3});
    })
    test ( 'with parent, withParent=false',()=> {
        let parent = new Context('parent',{a:0})
        let ctx = new Context('myCtx',{b:2,c:3},parent);
        let res;
        res = ctx.merge({c:4})
        expect(res).toEqual({b:2,c:4});
    })
    test ( 'with parent, with parent=true',()=> {
        let parent = new Context('parent',{a:0})
        let ctx = new Context('myCtx',{b:2,c:3},parent);
        let res;
        res = ctx.merge({c:4},true,true)
        expect(res).toEqual({a:0,b:2,c:4});
    })
    
})