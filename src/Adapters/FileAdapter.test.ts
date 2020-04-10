import FileAdapter from "./FileAdapter"
import EventLogger from '../EventLogger'
import {mocked} from 'ts-jest/utils'

var fs = require('fs');

let originalLog = console.log;

describe('Constructor',()=>{

    var testAdapter;


    afterEach(()=>{
        EventLogger.reset();
    })


    test('default options',()=> {
        let testAdapter = new FileAdapter();

        let opts = testAdapter['opts']; // workaround to access to  private member opts
        expect(opts).toEqual({name:'logfile.json'})
    });

    test('file name set',()=> {
        let testAdapter = new FileAdapter({name:'test.json'});

        let opts = testAdapter['opts']; // workaround to access to  private member opts
        expect(opts).toEqual({name:'test.json'})
    });
    test('file name set to undefined',()=> {
        let testAdapter = new FileAdapter({name:undefined});

        let opts = testAdapter['opts']; // workaround to access to  private member opts
        expect(opts).toEqual({name:'logfile.json'})
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
    })


    test('simple log',()=> {
        let LOG = new EventLogger("app");
        LOG.log('test')
        let calls = mocked(fs.appendFile).mock.calls;
        expect(calls[0][1]).toMatch(/{message:'test',ts:.+,context:'app'}\n/)
    });

    test('simple log - No Timestamp',()=> {
        EventLogger.setGlobalConfig('autoTimeStamp',false);

        let LOG = new EventLogger("app");
        LOG.log('test')
        let calls = mocked(fs.appendFile).mock.calls;
        expect(calls[0][1]).toBe("{message:'test',context:'app'}\n")
    });
    
    test('event log',()=> {
        EventLogger.setGlobalConfig('autoTimeStamp',false);
        let LOG = new EventLogger("app");
        LOG.logEvent({message:'test1',str:'XX',int:1, boolean:true, object:{ a:1, b:2}, array:[ '1','2'], complex:[{z:1,y:[1,2]},{x:'10'}] })
        let calls = mocked(fs.appendFile).mock.calls;
        expect(calls[0][1]).toBe("{message:'test1',str:'XX',int:1,boolean:true,object:{a:1,b:2},array:['1','2'],complex:[{z:1,y:[1,2]},{x:'10'}],context:'app'}\n")    
    });


    test('filename changed in opts',()=> {
        EventLogger.setGlobalConfig('autoTimeStamp',false);
        mockAdapter['opts'].name = 'testfile.json'


        let LOG = new EventLogger("app");
        LOG.log('test')
        let calls = mocked(fs.appendFile).mock.calls;
        expect(calls[0][0]).toBe('testfile.json')    
    });


}) 

