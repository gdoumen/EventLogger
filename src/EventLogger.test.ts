import EventLogger from './EventLogger'
import Context from './Context';
import BaseAdapter from './Adapters/BaseAdapter';
import LogAdapter from './LogAdapter';
import { isFunc } from './utils'

class MockAdapter extends BaseAdapter implements LogAdapter {
    log(context: string, event:any):void   {
        // empty
    } 
}

describe ('Constructor',()=> {
    afterEach( ()=> {
        EventLogger.reset();
    })

    test('no parent - first logger', ()=> {
        let logger = new EventLogger('test');
        expect(logger.getName()).toBe('test');
        expect(logger.getParent()).toBeUndefined();
        expect(logger._get()).toEqual({})
    })

    test('with parent as EventLogger', ()=> {
        let parent = new EventLogger('parent');
        let logger = new EventLogger('test',parent);
        expect(logger.getName()).toBe('test');
        expect(logger.getParent()?.getName()).toBe('parent');
        expect(logger._get()).toEqual({})
    })

    test('with parent as string', ()=> {
        let parent = new EventLogger('parent');
        let logger = new EventLogger('test','parent');
        expect(logger.getName()).toBe('test');
        expect(logger.getParent()?.getName()).toBe('parent');
        expect(logger._get()).toEqual({})
    })


    test('2nd logger without parent => first will become implicit parent', ()=> {
        let parent = new EventLogger('parent');
        let logger = new EventLogger('test');

        expect(logger.getName()).toBe('test');
        expect(logger.getParent()?.getName()).toBe('parent');
        expect(logger._get()).toEqual({})
    })

    test('Two loggers with same name', ()=> {
        // context is shared
        // parent can not be overwritten
        let parent = new EventLogger('parent');
        let logger = new EventLogger('test',parent);
        logger.set({x:1})
        
        let parent1 = new EventLogger('parent1');
        parent.set({y:1})
        parent1.set({z:1})

        expect(logger.getParent()?.getName()).toBe('parent');
        let logger1 = new EventLogger('test');
        expect(logger1._get()).toEqual({x:1,y:1})
    })


})

describe ('log levels',()=> {

    var mock = new MockAdapter ();

    beforeEach( ()=> {
        mock.log = jest.fn();
        EventLogger.registerAdapter(mock);
        EventLogger.setGlobalConfig('autoTimeStamp',false);
    })
    afterEach( ()=> {
        EventLogger.reset();
    })

    test('no level set', ()=> {
        let logger = new EventLogger('test');

        logger.set({x:1});
        logger.log('test')        
        expect(mock.log).toHaveBeenCalledWith('test',{x:1,message:'test'},expect.anything())
    })

    test('debug', ()=> {
        let logger = new EventLogger('test');

        logger.set({x:1});
        logger.debug('test')        
        logger.logEvent({message:'test1'},'debug')        
        expect(mock.log).toHaveBeenNthCalledWith(1,'test',{x:1,message:'test',level:'debug'},expect.anything())
        expect(mock.log).toHaveBeenNthCalledWith(2,'test',{x:1,message:'test1',level:'debug'},expect.anything())
    })

    test('info', ()=> {
        let logger = new EventLogger('test');

        logger.set({x:1});
        logger.info('test')        
        logger.logEvent({message:'test1'},'info')        
        expect(mock.log).toHaveBeenNthCalledWith(1,'test',{x:1,message:'test',level:'info'},expect.anything())
        expect(mock.log).toHaveBeenNthCalledWith(2,'test',{x:1,message:'test1',level:'info'},expect.anything())
    })

    test('error', ()=> {
        let logger = new EventLogger('test');

        logger.set({x:1});
        logger.error('test')        
        logger.logEvent({message:'test1'},'error')        
        expect(mock.log).toHaveBeenNthCalledWith(1,'test',{x:1,message:'test',level:'error'},expect.anything())
        expect(mock.log).toHaveBeenNthCalledWith(2,'test',{x:1,message:'test1',level:'error'},expect.anything())
    })

    test('level is set in context and conflicts with method => method wins', ()=> {
        let logger = new EventLogger('test');

        logger.set({x:1,level:'info'});
        logger.error('test')        
        logger.logEvent({message:'test1'},'error')        
        expect(mock.log).toHaveBeenNthCalledWith(1,'test',{x:1,message:'test',level:'error'},expect.anything())
        expect(mock.log).toHaveBeenNthCalledWith(2,'test',{x:1,message:'test1',level:'error'},expect.anything())
    })

    test('level in event conflicts with method parameter => method wins', ()=> {
        let logger = new EventLogger('test');

        logger.set({x:1});
        logger.logEvent({message:'test',level:'debug'},'error')        
        expect(mock.log).toHaveBeenNthCalledWith(1,'test',{x:1,message:'test',level:'error'},expect.anything())
    })

})


describe ( 'context' ,() => {
    var mock = new MockAdapter ();

    beforeEach( ()=> {
        mock.log = jest.fn();
        EventLogger.registerAdapter(mock);
        EventLogger.setGlobalConfig('autoTimeStamp',false);
    })
    afterEach( ()=> {
        EventLogger.reset();
    })

    test('root context', ()=> {
        let logger = new EventLogger('root');

        logger.set({x:1});
        logger.log('test')        
        expect(mock.log).toHaveBeenCalledWith('root',{x:1,message:'test'},expect.anything())
    })

    test('root context, value set in root', ()=> {
        let logger = new EventLogger('root');

        logger.set({x:1});
        logger.log('test')        
        expect(mock.log).toHaveBeenCalledWith('root',{x:1,message:'test'},expect.anything())
    })

    test('child context, value set in root', ()=> {
        let logger = new EventLogger('root');
        let child = new EventLogger('child',logger);

        logger.set({x:1});
        child.log('test')        
        expect(mock.log).toHaveBeenCalledWith('child',{x:1,message:'test'},expect.anything())
    })

    test('3rd level, value set in root', ()=> {
        let logger = new EventLogger('root');
        let mother = new EventLogger('mother',logger);
        let child = new EventLogger('child',mother);

        logger.set({x:1});
        child.log('test')        
        expect(mock.log).toHaveBeenCalledWith('child',{x:1,message:'test'},expect.anything())
    })

    test('child with implicit root , value set in root', ()=> {
        let logger = new EventLogger('root');
        let child = new EventLogger('child');

        logger.set({x:1});
        child.log('test')        
        expect(mock.log).toHaveBeenCalledWith('child',{x:1,message:'test'},expect.anything())
    })


    test('LazaLoading child with implicit root , value set in root', ()=> {
        EventLogger.setGlobalConfig('lazyLoading',true)

        let child = new EventLogger('child','mother');
        let mother = new EventLogger('mother');
        let logger = new EventLogger('root');

        logger.set({x:1});
        mother.set({y:1}); // will be initialized at that point with logger as root
        child.log('test'); // will be initialized at that point with mother as parent
        
        expect(mock.log).toHaveBeenCalledWith('child',{x:1,y:1,message:'test'},expect.anything())
    })

})

describe ('set/setContext',()=> {

    afterEach( ()=> {
        EventLogger.reset();
    })
    test('no parent', ()=> {
        let logger = new EventLogger('test');
        expect(logger._get()).toEqual({})

        logger.set({x:1});
        expect(logger._get()).toEqual({x:1})
        logger.set({y:2});
        expect(logger._get()).toEqual({x:1,y:2})
    })

    test('string with parent', ()=> {
        let parent = new EventLogger('parent');
        let logger = new EventLogger('test',parent);
        expect(logger._get()).toEqual({})

        logger.set({x:1});
        parent.set({y:1});
        expect(logger._get()).toEqual({x:1,y:1})
    })

    test('overwrite context', ()=> {
        let logger = new EventLogger('test');
        expect(logger._get()).toEqual({})

        logger.set({x:1});
        expect(logger._get()).toEqual({x:1})

        logger.setContext( new Context('test1'))
        logger.set({y:2});
        expect(logger._get()).toEqual({y:2})
    })

    test('overwrite context - overwrites parent', ()=> {
        let parent = new EventLogger('parent');
        let logger = new EventLogger('test',parent);

        parent.set({x:1});
        expect(logger._get()).toEqual({x:1})

        logger.setContext( new Context('test1'))
        logger.set({y:2});
        expect(logger._get()).toEqual({y:2})
    })

    test('set with null', ()=> {
        let logger = new EventLogger('test');

        logger.set({x:1, y:2, z:3});
        
        logger.set({y:3, z:null});
        expect(logger._get()).toEqual({x:1,y:3})
    })


})

describe ('unset',()=> {

    let logger

    beforeEach( ()=>{
        logger = new EventLogger('test');
        logger.set({x:1});
        logger.set({y:2});
    })

    afterEach( ()=> {
        EventLogger.reset();
    })
    test('no parent', ()=> {
        let logger = new EventLogger('test');

        logger.unset('x')
        expect(logger._get()).toEqual({y:2})
       
    })
})


describe ('setGlobal',()=> {

    afterEach( ()=> {
        EventLogger.reset();
    })


    test('global Logger should not have a parent', ()=> {
        const globalParent = EventLogger._getGlobalLogger().getParent();
        expect(globalParent).toBeUndefined();
    })

    test('two loggers - no conflicts', ()=> {
        let logger1 = new EventLogger('test1');
        let logger2 = new EventLogger('test2'); // test1 is implicit parent

        logger1.set({x:1});
        logger2.set({z:1});

        expect(logger1._get()).toEqual({x:1})
        expect(logger2._get()).toEqual({x:1,z:1})
        logger1.setGlobal({y:2});
        expect(logger1._get()).toEqual({x:1,y:2})
        expect(logger2._get()).toEqual({x:1,y:2,z:1})
    })

    test('two loggers - same log key used in Global and child element ', ()=> {
        // child has precedence
        let logger1 = new EventLogger('test1');
        let logger2 = new EventLogger('test2'); // test1 is implicit parent

        logger1.set({x:1});
        logger2.set({z:1});

        expect(logger1._get()).toEqual({x:1})
        expect(logger2._get()).toEqual({x:1,z:1})
        logger1.setGlobal({z:2});
        expect(logger1._get()).toEqual({x:1,z:2})
        expect(logger2._get()).toEqual({x:1,z:1})
    })


    test('setGlobal with null', ()=> {
        let logger1 = new EventLogger('test1');
        let logger2 = new EventLogger('test2'); // test1 is implicit parent
        let logger = new EventLogger('test','test2');
        logger1.setGlobal({z:2});

        logger1.set({x:1, y:2, logger:'1'});
        logger2.set({x:1, y:2, logger:'2'});
        logger.set({x:1, y:2});
        
        logger.setGlobal({logger:null, a:1, z:null});
        expect(logger1._get()).toEqual({x:1,y:2,a:1,logger:'1'})
        expect(logger2._get()).toEqual({x:1,y:2,a:1,logger:'2'})
        expect(logger._get()).toEqual({x:1,y:2,a:1, logger:'2'})
    })


})

describe ('unsetGlobal',()=> {

    afterEach( ()=> {
        EventLogger.reset();
    })


    test('multiple loggers', ()=> {
        let loggerApp = new EventLogger('app');
        let logger1 = new EventLogger('test1'); // app is implicit parent
        let logger2 = new EventLogger('test2'); // app is implicit parent

        logger1.set({x:1});
        logger2.set({z:1});
        logger1.setGlobal({y:2});
        expect(logger2._get()).toEqual({z:1,y:2})
        expect(loggerApp._get()).toEqual({y:2})


        logger1.unsetGlobal('y')
        expect(logger2._get()).toEqual({z:1})
        expect(loggerApp._get()).toEqual({})
        
    })

})


describe ( 'slow Adapter ' ,() => {
    var slow = new MockAdapter ();
    
    beforeEach( ()=> {
        EventLogger.registerAdapter(slow);
        EventLogger.setGlobalConfig('autoTimeStamp',false);
    })

    afterEach( ()=> {
        EventLogger.reset();
    })

    test('check', ()=> {
        let logger = new EventLogger('root');
        logger['isBusy'] = true;

        logger.log('test')        
        logger.log('test1')        

        expect(logger['isBusy']).toBe(true);
        expect(logger['events'].length).toBe(2);
    })

});


describe ( 'key blacklist' ,() => {
    var mock = new MockAdapter ();

    beforeEach( ()=> {
        mock.log = jest.fn();
        EventLogger.registerAdapter(mock);
        EventLogger.setGlobalConfig('autoTimeStamp',false);
    })

    afterEach( ()=> {
        EventLogger.reset();
    })

    test('Blacklist can be initialized', ()=> {
        const list = ['user','auth'];
        EventLogger.setKeyBlackList(list);

        expect( EventLogger['KeyBlackList']).toEqual(list);
    })

    test('element can be added to blacklist', ()=> {
        const list = ['user','auth'];
        EventLogger.setKeyBlackList(list);
        EventLogger.addToBlackList( 'test');

        expect( EventLogger['KeyBlackList']).toEqual(['user','auth','test']);
    })

    test('existing key will not be added to blacklist', ()=> {
        const list = ['user','auth'];
        EventLogger.setKeyBlackList(list);
        EventLogger.addToBlackList( 'auth');

        expect( EventLogger['KeyBlackList']).toEqual(['user','auth']);
    })

    test('Blacklist key in top element is filtered out', ()=> {
        let logger = new EventLogger('test');
        const list = ['user','auth'];
        EventLogger.setKeyBlackList(list);

        logger.logEvent( {message:'test', user:{ id:1, name:'test'}})        
        expect(mock.log).toHaveBeenCalledWith('test',{message:'test',user:'**filtered**' },expect.anything())
    })

    test('Blacklist key in string in top element is filtered out', ()=> {
        let logger = new EventLogger('test');
        const list = ['user','auth','cacheDir'];
        EventLogger.setKeyBlackList(list);

        logger.logEvent( {message:'test', cacheDir:'/home/userA/temp'})        
        expect(mock.log).toHaveBeenCalledWith('test',{message:'test',cacheDir: '**filtered**' },expect.anything())
    })

    test('Blacklist key in child element is filtered out', ()=> {
        let logger = new EventLogger('test');
        const list = ['user','auth'];
        EventLogger.setKeyBlackList(list);

        logger.logEvent( {message:'test', google:{  key:'1234', auth:{ accessToken:'lllll', id:'12345'} }})        
        expect(mock.log).toHaveBeenCalledWith('test',{message:'test',google:{ key:'1234',auth:'**filtered**' } },expect.anything())
    })

    test('Blacklist key in string in child element is filtered out', ()=> {
        let logger = new EventLogger('test');
        const list = ['user','auth','cacheDir'];
        EventLogger.setKeyBlackList(list);

        logger.logEvent( {message:'test', settings:{cacheDir:'/home/userA/temp'}})        
        expect(mock.log).toHaveBeenCalledWith('test',{message:'test',settings:{cacheDir: '**filtered**'} },expect.anything())
    })

    test('Blacklist key in string in array child element is filtered out', ()=> {
        let logger = new EventLogger('test');
        const list = ['user','auth','cacheDir'];
        EventLogger.setKeyBlackList(list);

        logger.logEvent( {message:'test', settings:[{cacheDir:'/home/userA/temp'}]})        
        expect(mock.log).toHaveBeenCalledWith('test',{message:'test',settings:[{cacheDir: '**filtered**'}] },expect.anything())
    })


    test ( 'bug parent.get is not a function' ,() => {
        let BaseLogger = new EventLogger('incyclist');
        EventLogger.setGlobalConfig('uuid','1234')
        EventLogger.setGlobalConfig('session','4567')
        let scanLogger = new EventLogger('Daum8i Scanner');

        const list = ['user','auth','cacheDir'];
        EventLogger.setKeyBlackList(list);
        
        scanLogger.logEvent( {message: 'some message', c:{logger:scanLogger}} )
        expect(mock.log).toHaveBeenCalled()

        scanLogger.log(`2nd message` )
        expect(mock.log).toHaveBeenNthCalledWith(2,'Daum8i Scanner',{message:'2nd message'},expect.anything())
        expect( isFunc(scanLogger['context'].get) ).toBe(true);
        expect( isFunc(scanLogger['context'].getParent()?.get) ).toBe(true);

        scanLogger.log(`3rd message` )
        expect(mock.log).toHaveBeenNthCalledWith(3,'Daum8i Scanner',{message:'3rd message'},expect.anything())
        expect( isFunc(scanLogger['context'].get) ).toBe(true);
        expect( isFunc(scanLogger['context'].getParent()?.get) ).toBe(true);
    });



});

describe('filterBlackList',()=> {

    describe ('non object - top element',()=> {
        test('string', ()=> {
            let logger = new EventLogger('test');    
            EventLogger.setKeyBlackList( ['a']) 
            const o = logger.filterBlackList( '123' )
            expect (o).toEqual( '123')    
        })

        test('number', ()=> {
            let logger = new EventLogger('test');    
            EventLogger.setKeyBlackList( ['a']) 
            const o = logger.filterBlackList( 1 )
            expect (o).toEqual( 1)    
        })

        test('boolean', ()=> {
            let logger = new EventLogger('test');    
            EventLogger.setKeyBlackList( ['a']) 
            const o = logger.filterBlackList( true )
            expect (o).toEqual( true)    
        })

        test('array', ()=> {
            let logger = new EventLogger('test');    
            EventLogger.setKeyBlackList( ['a']) 
            const o = logger.filterBlackList( [1,2] )
            expect (o).toEqual([1,2])    
        })

        test('function', ()=> {
            let logger = new EventLogger('test');    
            EventLogger.setKeyBlackList( ['a']) 
            const fnA = ()=> {}
            const o = logger.filterBlackList( fnA )
            expect (o).toBeUndefined();
        })

        test('symbol', ()=> {
            let logger = new EventLogger('test');    
            EventLogger.setKeyBlackList( ['a']) 
            const sA = Symbol('a');

            const o = logger.filterBlackList( sA)
            expect (o).toBeUndefined();
        })

        test('Class', ()=> {
            let logger = new EventLogger('test');    
            EventLogger.setKeyBlackList( ['a']) 

            const o = logger.filterBlackList( EventLogger)
            expect (o).toBe(EventLogger);
        })

        test('undefined or null', ()=> {
            let logger = new EventLogger('test');    
            EventLogger.setKeyBlackList( ['a']) 
            const o = logger.filterBlackList( undefined )
            expect (o).toBeUndefined();    
            const o1 = logger.filterBlackList( null )
            expect (o1).toEqual( null)    
        })

    })

    describe ('object - top element',()=> {

        test('string', ()=> {
            let logger = new EventLogger('test');    
            EventLogger.setKeyBlackList( ['a']) 
            const o = logger.filterBlackList( {a:'123', b:'2'} )
            expect (o).toEqual( {a:'**filtered**',b:'2'})    
        })

        test('number', ()=> {
            let logger = new EventLogger('test');    
            EventLogger.setKeyBlackList( ['a']) 
            const o = logger.filterBlackList( {a:1, b:2} )
            expect (o).toEqual( {a:'**filtered**',b:2})    
        })

        test('boolean', ()=> {
            let logger = new EventLogger('test');    
            EventLogger.setKeyBlackList( ['a']) 
            const o = logger.filterBlackList( {a:true, b:false} )
            expect (o).toEqual( {a:'**filtered**',b:false})    
        })

        test('array', ()=> {
            let logger = new EventLogger('test');    
            EventLogger.setKeyBlackList( ['a']) 
            const o = logger.filterBlackList( {a:[1,2], b:[1,2]} )
            expect (o).toEqual( {a:'**filtered**',b:[1,2]})    
        })

        test('object', ()=> {
            let logger = new EventLogger('test');    
            EventLogger.setKeyBlackList( ['a']) 
            const o = logger.filterBlackList( {a:{ a1:1, a2:2}, b:{b1:1, b2:2}} )
            expect (o).toEqual( {a:'**filtered**',b:{b1:1, b2:2}})    
        })

        test('function', ()=> {
            let logger = new EventLogger('test');    
            EventLogger.setKeyBlackList( ['a']) 
            const fnA = ()=> {}
            const fnB = ()=> {}
            const o = logger.filterBlackList( {a:fnA, b:fnB} )
            expect (o).toEqual( {})    
        })

        test('symbol', ()=> {
            let logger = new EventLogger('test');    
            EventLogger.setKeyBlackList( ['a']) 
            const sA = Symbol('a');
            const sB = Symbol('b');

            const o = logger.filterBlackList( {a:sA, b:sB} )
            expect (o).toEqual( {})    
        })

        test('undefined or null', ()=> {
            let logger = new EventLogger('test');    
            EventLogger.setKeyBlackList( ['a']) 
            const o = logger.filterBlackList( {a:undefined, b:undefined} )
            expect (o).toEqual( {a:undefined,b:undefined})    
            const o1 = logger.filterBlackList( {a:null, b:null} )
            expect (o1).toEqual( {a:null,b:null})    
        })

        test('Class', ()=> {
            let logger = new EventLogger('test');    
            EventLogger.setKeyBlackList( ['a']) 

            const o = logger.filterBlackList( {a:EventLogger,b:EventLogger})
            expect (o).toEqual({a:EventLogger,b:EventLogger});
        })


        test('does not modify event object', ()=> {
            let logger = new EventLogger('test');    
            EventLogger.setKeyBlackList( ['a']) 
            const event = {a:{ a1:1, a2:2}, b:{b1:1, b2:2}}
            const o = logger.filterBlackList( event )
            expect (o).toEqual( {a:'**filtered**',b:{b1:1, b2:2}})    
            expect (event).toEqual( {a:{ a1:1, a2:2}, b:{b1:1, b2:2}} )    

        })

        test('does not return any object below 5th level', ()=> {
            let logger = new EventLogger('test');    
            EventLogger.setKeyBlackList( ['b']) 
            const event = {a:{ a1: {a2:{ a3:{ a4: { a5:{ a6:{ a7:{ a8:{ test:true}}}}}}}} }}
            const o = logger.filterBlackList( event )
            expect (o).toEqual( {a:{ a1: {a2:{ a3:{ a4: { a5:{ a6:{ }}}}}} }} )    

        })

        test('circular', ()=> {
            let logger = new EventLogger('test');    
            EventLogger.setKeyBlackList( ['b']) 
            let x = {}
            const ev = { a: { a1:{ a2: x,b:'123' }}}
            ev.a.a1.a2 = ev;
            const o = logger.filterBlackList( ev )
            //expect (o).toEqual( {a:{ a1: {a2:'[circular]',b:'**filtered**'}}}  )    
            expect (o).toEqual({});

        })

    })
    
})


describe('external Logger',()=> {



    describe ('using external logger',()=> {

        const MockLogger = {
            log: jest.fn(),
            logEvent: jest.fn()
        }

        beforeEach( () => {
            EventLogger.reset()
        });

        afterEach( ()=> {
            jest.clearAllMocks();            
        })


        test('log', ()=> {
            let mock = new MockAdapter ();
            mock.log = jest.fn();

            EventLogger.useExternalLogger(MockLogger);
            EventLogger.registerAdapter(mock);

            let logger = new EventLogger('test');    
            logger.log( 'some message');
            expect(MockLogger.log).toHaveBeenCalledWith('some message');
            expect(MockLogger.logEvent).not.toHaveBeenCalled();
            expect(mock.log).not.toHaveBeenCalled();
        })

        test('logEvent', ()=> {
            let mock = new MockAdapter ();
            mock.log = jest.fn();

            EventLogger.useExternalLogger(MockLogger);
            EventLogger.registerAdapter(mock);

            let logger = new EventLogger('test');    
            logger.logEvent( {message:'some message',b:1});
            expect(MockLogger.logEvent).toHaveBeenCalledWith({message:'some message',b:1},undefined);
            expect(MockLogger.log).not.toHaveBeenCalled();
            expect(mock.log).not.toHaveBeenCalled();
        })


        test('reset', ()=> {
            let mock = new MockAdapter ();
            mock.log = jest.fn();

            EventLogger.useExternalLogger(MockLogger);
            EventLogger.registerAdapter(mock);

            let logger = new EventLogger('test');    

            logger.log( 'some message');
            expect(mock.log).not.toHaveBeenCalled();

            MockLogger.log.mockClear()
            MockLogger.logEvent.mockClear()

            EventLogger.reset();
            EventLogger.registerAdapter(mock);
            logger.log( '2nd message');
            expect(MockLogger.log).not.toHaveBeenCalled();
            expect(MockLogger.logEvent).not.toHaveBeenCalled();
            expect(mock.log).toHaveBeenCalledWith('test', { message:'2nd message',ts:expect.anything()},expect.anything());


        })


    });

});