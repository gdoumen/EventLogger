import FileAdapter from "./FileAdapter"
import EventLogger from '../EventLogger'


var fs = require('fs');


describe('Constructor',()=>{

    let testAdapter;


    afterEach(()=>{
        EventLogger.reset();
    })


    test('default options',()=> {
        let testAdapter = new FileAdapter();

        let opts = testAdapter['opts']; // workaround to access to  private member opts
        expect(opts).toEqual({name:'logfile.json',fs:fs})
    });

    test('file name set',()=> {
        let testAdapter = new FileAdapter({name:'test.json'});

        let opts = testAdapter['opts']; // workaround to access to  private member opts
        expect(opts.name).toEqual('test.json')
    });
    test('file name set to undefined',()=> {
        let testAdapter = new FileAdapter({name:undefined});

        let opts = testAdapter['opts']; // workaround to access to  private member opts
        expect(opts.name).toEqual('logfile.json')
    });
    test('fs set',()=> {
        let mockFS = {appendFile:jest.fn()}
        let testAdapter = new FileAdapter({fs:mockFS});

        let opts = testAdapter['opts']; // workaround to access to  private member opts
        expect(opts.fs).toEqual(mockFS)
    });

}) 


describe('logging',()=>{

    var mockAdapter =  new FileAdapter();

    beforeEach(()=>{
        EventLogger.registerAdapter(mockAdapter);
        fs.appendFile = jest.fn();
    })

    afterEach(()=>{
        EventLogger.reset();
        jest.clearAllMocks();
    })


    test('simple log',()=> {
        let LOG = new EventLogger("app");
        LOG.log('test')
        
        expect(fs.appendFile).toHaveBeenCalledWith('logfile.json',expect.stringMatching(/{message:'test',ts:.+,context:'app'}\n/),"utf8", expect.anything())
        
    });

    test('simple log - No Timestamp',()=> {
        EventLogger.setGlobalConfig('autoTimeStamp',false);

        let LOG = new EventLogger("app");
        LOG.log('test')

        expect(fs.appendFile).toHaveBeenCalledWith('logfile.json',"{message:'test',context:'app'}\n","utf8",expect.anything())
    });
    
    test('event log',()=> {
        EventLogger.setGlobalConfig('autoTimeStamp',false);
        let LOG = new EventLogger("app");
        LOG.logEvent({message:'test1',str:'XX',int:1, boolean:true, object:{ a:1, b:2}, array:[ '1','2'], complex:[{z:1,y:[1,2]},{x:'10'}] })

        expect(fs.appendFile).toHaveBeenCalledWith("logfile.json","{message:'test1',str:'XX',int:1,boolean:true,object:{a:1,b:2},array:['1','2'],complex:[{z:1,y:[1,2]},{x:'10'}],context:'app'}\n","utf8", expect.anything())
    });


    test('filename changed in opts',()=> {
        EventLogger.setGlobalConfig('autoTimeStamp',false);
        mockAdapter['opts'].name = 'testfile.json'


        let LOG = new EventLogger("app");
        LOG.log('test')

        expect(fs.appendFile.mock.calls[0][0]).toBe('testfile.json')        
    });


    test('fs changed in opts',()=> {
        EventLogger.setGlobalConfig('autoTimeStamp',false);
        let mockFS = {appendFile:jest.fn()}
        mockAdapter['opts'].fs = mockFS;


        let LOG = new EventLogger("app");
        LOG.log('test')
        expect(mockFS.appendFile).toHaveBeenCalled();
    });

}) 



describe('ConsoleAdapter with Context filtering',()=>{
    beforeAll(()=>{
        EventLogger.reset();
    })


    beforeEach(()=>{
        EventLogger.registerAdapter( new FileAdapter({depth:1}));
        fs.appendFile = jest.fn();
    })

    afterEach(()=>{
        EventLogger.reset();
        
    })


    test('simple log',()=> {

        const app = new EventLogger("app");
        const parent = new EventLogger("dialog");
        let LOG = new EventLogger("page","dialog");
        app.set({a:1,b:2})
        LOG.log('test')

        expect(fs.appendFile).toHaveBeenCalledWith( "logfile.json",expect.stringMatching(/{message:'test',ts:.+,context:'page'}\n/),"utf8",expect.anything())
    });

    test('simple log with values stored in context',()=> {
        EventLogger.setGlobalConfig('autoTimeStamp',false);
        let parent = new EventLogger("app");
        let LOG = new EventLogger("page");
        parent.set({a:1,b:2})
        LOG.set({x:1})
        LOG.log('test')
    
        expect(fs.appendFile).toHaveBeenCalledWith( "logfile.json", expect.stringMatching(/{x:1,message:'test',context:'page'}\n/),"utf8",expect.anything())
    });

});


