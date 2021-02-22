import EventLogger from './EventLogger'
import Context from './Context';
import BaseAdapter from './Adapters/BaseAdapter';
import LogAdapter from './LogAdapter';

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




});

