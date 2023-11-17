import LogAdaper from './LogAdapter'
import EventLogger from './EventLogger';
import ConsoleAdaper from './Adapters/ConsoleAdapter'

class MyLogger implements LogAdaper {

    log(context: string, event: any): void {
        
    }


}
 

let testLogger = new MyLogger();


describe( 'logEvent', ()=> {
    beforeEach( ()=> {
        EventLogger.setGlobalConfig('autoTimeStamp',false);
        testLogger.log = jest.fn();        
    } )
    afterEach( ()=> {
        EventLogger.reset();
    } )
    test('simple event',()=> {
        EventLogger.registerAdapter(testLogger);
        let info  = new EventLogger ('TEST');
    
        info.set({test:'simple logEvent'});
        info.logEvent({line:1});

        expect(testLogger.log).toHaveBeenCalledWith('TEST',{test:'simple logEvent',line:1},expect.anything())
    
    })

    test('filtering',()=> {
        let testInfo = new MyLogger();
        testInfo.log = jest.fn();        

        let testDebug = new MyLogger();
        testDebug.log = jest.fn();        

        EventLogger.registerAdapter(testDebug);
        EventLogger.registerAdapter(testInfo, context =>   (context==='info') );
        let info  = new EventLogger ('info');
        let debug  = new EventLogger ('debug');
        
        debug.log('1');
        info.log('2');
        debug.log('3');

        expect(testInfo.log).toHaveBeenCalledWith('info',{message:'2'},expect.anything())
         
        expect(testDebug.log).toHaveBeenCalledWith('debug',{message:'1'},expect.anything())
        expect(testDebug.log).toHaveBeenCalledWith('info',{message:'2'},expect.anything())
        expect(testDebug.log).toHaveBeenCalledWith('debug',{message:'3'},expect.anything())
    
    })

})

describe( 'log', ()=> {
    beforeEach( ()=> {
        EventLogger.setGlobalConfig('autoTimeStamp',false);
        EventLogger.registerAdapter(testLogger);
        testLogger.log = jest.fn();        
    } )
    afterEach( ()=> {
        EventLogger.reset();
    } )

    test('simple string',()=> {
        let info  = new EventLogger ('TEST');

        info.set({test:'simple logEvent'});
        info.log('Debug message');

        expect(testLogger.log).toHaveBeenCalledWith('TEST',{test:'simple logEvent',message:'Debug message'},expect.anything())

    })

    test('two strings',()=> {
        let info  = new EventLogger ('TEST');

        info.set({test:'simple logEvent'});
        info.log('Debug message','one');

        expect(testLogger.log).toHaveBeenCalledWith('TEST',{test:'simple logEvent',message:'Debug message one'},expect.anything())

    })

    test('two strings and Object',()=> {
        let info  = new EventLogger ('TEST');

        info.set({test:'simple logEvent'});
        info.log('Debug message','one', {a:1});
        
        expect(testLogger.log).toHaveBeenCalledWith('TEST',{test:'simple logEvent',message:'Debug message one [object Object]'},expect.anything())

    })

});

