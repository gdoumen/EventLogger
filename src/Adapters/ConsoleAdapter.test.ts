import ConsoleAdapter from "./ConsoleAdapter"
import EventLogger from '../EventLogger'

let originalLog = console.log;


describe('ConsoleAdapter',()=>{
    let logFn;

    beforeAll(()=>{
        EventLogger.reset();
        
    })


    beforeEach(()=>{
        EventLogger.registerAdapter( new ConsoleAdapter);
        jest.clearAllMocks();
        logFn= jest.fn(); 
        console.log =logFn
    })

    afterEach(()=>{
        EventLogger.reset();
        console.log = originalLog
    })


    test('simple log',()=> {
        let LOG = new EventLogger("app");
        LOG.log('test')

        expect(console.log).toHaveBeenCalledWith( expect.stringMatching(/.+\tapp\ttest/))
    });

    test('simple log - No Timestamp',()=> {
        EventLogger.setGlobalConfig('autoTimeStamp',false);

        let LOG = new EventLogger("app");
        LOG.log('test')
    
        expect(console.log).toHaveBeenCalledWith('app\ttest');
    });
    test('event log',()=> {
        let LOG = new EventLogger("app");
        LOG.logEvent({message:'test1',str:'XX',int:1, boolean:true, object:{ a:1, b:2}, array:[ '1','2'], complex:[{z:1,y:[1,2]},{x:'10'}] })

        expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/.+\tapp\ttest1/),"str:'XX'","int:1","boolean:true","object:{a:1,b:2}","array:['1','2']","complex:[{z:1,y:[1,2]},{x:'10'}]")
    });
    
    test('event log - exceptions',()=> {
        let LOG = new EventLogger("app");
        LOG.logEvent({message:'test1',nullTest:null, undTest:undefined, o:{nullTest:null, undTest:undefined} })
        expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/.+\tapp\ttest1/),"nullTest:null","undTest:undefined","o:{nullTest:null,undTest:undefined}")
    });
}) 

describe('ConsoleAdapter with Context filtering',()=>{
    let logFn;
    
    beforeAll(()=>{
        EventLogger.reset();
    })


    beforeEach(()=>{       
       
        EventLogger.registerAdapter( new ConsoleAdapter({depth:1}));

        logFn= jest.fn(); 
        console.log =logFn

    })

    afterEach(()=>{
        EventLogger.reset();
        jest.clearAllMocks();
        console.log = originalLog
    })


    test('simple log',()=> {

        const app = new EventLogger("app");
        const parent = new EventLogger("dialog","app");
        let LOG = new EventLogger("page","dialog");
        app.set({a:1,b:2})
        LOG.log('test')


        expect(logFn).toHaveBeenCalledWith( expect.stringMatching(/.+\tpage\ttest/))       
    });


});
