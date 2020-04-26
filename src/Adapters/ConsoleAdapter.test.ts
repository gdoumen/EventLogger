import ConsoleAdapter from "./ConsoleAdapter"
import EventLogger from '../EventLogger'
import {mocked} from 'ts-jest/utils'

let originalLog = console.log;


describe('ConsoleAdapter',()=>{
    beforeAll(()=>{
        EventLogger.reset();
    })


    beforeEach(()=>{
        EventLogger.registerAdapter( new ConsoleAdapter);
        console.log = jest.fn();
    })

    afterEach(()=>{
        EventLogger.reset();
    })


    test('simple log',()=> {
        let LOG = new EventLogger("app");
        LOG.log('test')
    
        expect(mocked(console.log).mock.calls[0][0]).toMatch(/.+\tapp\ttest/);
        expect(mocked(console.log).mock.calls[0][1]).toBeUndefined
    });

    test('simple log - No Timestamp',()=> {
        EventLogger.setGlobalConfig('autoTimeStamp',false);

        let LOG = new EventLogger("app");
        LOG.log('test')
    
        expect(mocked(console.log).mock.calls[0][0]).toBe('app\ttest');
        expect(mocked(console.log).mock.calls[0][1]).toBeUndefined
    });
    test('event log',()=> {
        let LOG = new EventLogger("app");
        LOG.logEvent({message:'test1',str:'XX',int:1, boolean:true, object:{ a:1, b:2}, array:[ '1','2'], complex:[{z:1,y:[1,2]},{x:'10'}] })
    
        expect(mocked(console.log).mock.calls[0][0]).toMatch(/.+\tapp\ttest1/);
        expect(mocked(console.log).mock.calls[0][1]).toBe("str:'XX'");
        expect(mocked(console.log).mock.calls[0][2]).toBe("int:1");
        expect(mocked(console.log).mock.calls[0][3]).toBe("boolean:true");
        expect(mocked(console.log).mock.calls[0][4]).toBe("object:{a:1,b:2}");
        expect(mocked(console.log).mock.calls[0][5]).toBe("array:['1','2']");
        expect(mocked(console.log).mock.calls[0][6]).toBe("complex:[{z:1,y:[1,2]},{x:'10'}]");
    });
    
    test('event log - exceptions',()=> {
        let LOG = new EventLogger("app");
        LOG.logEvent({message:'test1',nullTest:null, undTest:undefined, o:{nullTest:null, undTest:undefined} })
    
        expect(mocked(console.log).mock.calls[0][0]).toMatch(/.+\tapp\ttest1/);
        expect(mocked(console.log).mock.calls[0][1]).toBe("nullTest:null");
        expect(mocked(console.log).mock.calls[0][2]).toBe("undTest:undefined");
        expect(mocked(console.log).mock.calls[0][3]).toBe("o:{nullTest:null,undTest:undefined}");
    });
}) 

describe('ConsoleAdapter with Context filtering',()=>{
    beforeAll(()=>{
        EventLogger.reset();
    })


    beforeEach(()=>{
        EventLogger.registerAdapter( new ConsoleAdapter({depth:1}));
        console.log = jest.fn();
    })

    afterEach(()=>{
        EventLogger.reset();
    })


    test('simple log',()=> {
        let parent = new EventLogger("app");
        let LOG = new EventLogger("page");
        parent.set({a:1,b:2})
        LOG.log('test')
    
        expect(mocked(console.log).mock.calls[0][0]).toMatch(/.+\tpage\ttest/);
        expect(mocked(console.log).mock.calls[0][1]).toBeUndefined
    });

    test('simple log with values stored in context',()=> {
        let parent = new EventLogger("app");
        let LOG = new EventLogger("page");
        parent.set({a:1,b:2})
        LOG.set({x:1})
        LOG.log('test')
    
        expect(mocked(console.log).mock.calls[0][0]).toMatch(/.+\tpage\ttest/);
        expect(mocked(console.log).mock.calls[0][1]).toBe("x:1");
        expect(mocked(console.log).mock.calls[0][2]).toBeUndefined
    });

});
