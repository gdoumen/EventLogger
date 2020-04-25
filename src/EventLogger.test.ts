import EventLogger from './EventLogger'
import Context from './Context';
import BaseAdapter from './Adapters/BaseAdapter';
import LogAdapter from './LogAdapter';
import { resolve } from 'dns';

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
        expect(mock.log).toHaveBeenCalledWith('test',{x:1,message:'test'})
    })

    test('debug', ()=> {
        let logger = new EventLogger('test');

        logger.set({x:1});
        logger.debug('test')        
        logger.logEvent({message:'test1'},'debug')        
        expect(mock.log).toHaveBeenNthCalledWith(1,'test',{x:1,message:'test',level:'debug'})
        expect(mock.log).toHaveBeenNthCalledWith(2,'test',{x:1,message:'test1',level:'debug'})
    })

    test('info', ()=> {
        let logger = new EventLogger('test');

        logger.set({x:1});
        logger.info('test')        
        logger.logEvent({message:'test1'},'info')        
        expect(mock.log).toHaveBeenNthCalledWith(1,'test',{x:1,message:'test',level:'info'})
        expect(mock.log).toHaveBeenNthCalledWith(2,'test',{x:1,message:'test1',level:'info'})
    })

    test('error', ()=> {
        let logger = new EventLogger('test');

        logger.set({x:1});
        logger.error('test')        
        logger.logEvent({message:'test1'},'error')        
        expect(mock.log).toHaveBeenNthCalledWith(1,'test',{x:1,message:'test',level:'error'})
        expect(mock.log).toHaveBeenNthCalledWith(2,'test',{x:1,message:'test1',level:'error'})
    })

    test('level is set in context and conflicts with method => method wins', ()=> {
        let logger = new EventLogger('test');

        logger.set({x:1,level:'info'});
        logger.error('test')        
        logger.logEvent({message:'test1'},'error')        
        expect(mock.log).toHaveBeenNthCalledWith(1,'test',{x:1,message:'test',level:'error'})
        expect(mock.log).toHaveBeenNthCalledWith(2,'test',{x:1,message:'test1',level:'error'})
    })

    test('level in event conflicts with method parameter => method wins', ()=> {
        let logger = new EventLogger('test');

        logger.set({x:1});
        logger.logEvent({message:'test',level:'debug'},'error')        
        expect(mock.log).toHaveBeenNthCalledWith(1,'test',{x:1,message:'test',level:'error'})
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
        expect(mock.log).toHaveBeenCalledWith('root',{x:1,message:'test'})
    })

    test('root context, value set in root', ()=> {
        let logger = new EventLogger('root');

        logger.set({x:1});
        logger.log('test')        
        expect(mock.log).toHaveBeenCalledWith('root',{x:1,message:'test'})
    })

    test('child context, value set in root', ()=> {
        let logger = new EventLogger('root');
        let child = new EventLogger('child',logger);

        logger.set({x:1});
        child.log('test')        
        expect(mock.log).toHaveBeenCalledWith('child',{x:1,message:'test'})
    })

    test('3rd level, value set in root', ()=> {
        let logger = new EventLogger('root');
        let mother = new EventLogger('mother',logger);
        let child = new EventLogger('child',mother);

        logger.set({x:1});
        child.log('test')        
        expect(mock.log).toHaveBeenCalledWith('child',{x:1,message:'test'})
    })

    test('child with implicit root , value set in root', ()=> {
        let logger = new EventLogger('root');
        let child = new EventLogger('child');

        logger.set({x:1});
        child.log('test')        
        expect(mock.log).toHaveBeenCalledWith('child',{x:1,message:'test'})
    })


    test('LazaLoading child with implicit root , value set in root', ()=> {
        EventLogger.setGlobalConfig('lazyLoading',true)

        let child = new EventLogger('child','mother');
        let mother = new EventLogger('mother');
        let logger = new EventLogger('root');

        logger.set({x:1});
        mother.set({y:1}); // will be initialized at that point with logger as root
        child.log('test'); // will be initialized at that point with mother as parent
        
        expect(mock.log).toHaveBeenCalledWith('child',{x:1,y:1,message:'test'})
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