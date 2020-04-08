import FileAdapter from "./FileAdapter"
import EventLogger from '../EventLogger'
import {mocked} from 'ts-jest/utils'

let originalLog = console.log;


describe('FileAdapter',()=>{

    beforeEach(()=>{
        EventLogger.registerAdapter( new FileAdapter);
        console.log = jest.fn();
    })

    afterEach(()=>{
        EventLogger.reset();
    })


    test('simple log',()=> {
        let LOG = new EventLogger("app");
        LOG.log('test')
    
        //expect(mocked(console.log).mock.calls[0][0]).toMatch(/.+\tapp\ttest/);
        //expect(mocked(console.log).mock.calls[0][1]).toBeUndefined
    });

    test('simple log - No Timestamp',()=> {
        EventLogger.setGlobalConfig('autoTimeStamp',false);

        let LOG = new EventLogger("app");
        LOG.log('test')
    
        //expect(mocked(console.log).mock.calls[0][0]).toBe('app\ttest');
        //expect(mocked(console.log).mock.calls[0][1]).toBeUndefined
    });
    
    test('event log',()=> {
        let LOG = new EventLogger("app");
        LOG.logEvent({message:'test1',str:'XX',int:1, boolean:true, object:{ a:1, b:2}, array:[ '1','2'], complex:[{z:1,y:[1,2]},{x:'10'}] })
    
        /*
        expect(mocked(console.log).mock.calls[0][0]).toMatch(/.+\tapp\ttest1/);
        expect(mocked(console.log).mock.calls[0][1]).toBe("str:'XX'");
        expect(mocked(console.log).mock.calls[0][2]).toBe("int:1");
        expect(mocked(console.log).mock.calls[0][3]).toBe("boolean:true");
        expect(mocked(console.log).mock.calls[0][4]).toBe("object:{a:1,b:2}");
        expect(mocked(console.log).mock.calls[0][5]).toBe("array:['1','2']");
        expect(mocked(console.log).mock.calls[0][6]).toBe("complex:[{z:1,y:[1,2]},{x:'10'}]");
        */
    });
}) 

