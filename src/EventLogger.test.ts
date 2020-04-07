import EventLogger from './EventLogger'
import Context from './Context';

describe ('Constructor',()=> {

    test('string only', ()=> {
        let logger = new EventLogger('test');
        expect(logger.getName()).toBe('test');
        expect(logger.getParent()).toBeUndefined();
        expect(logger._get()).toEqual({})
    })

    test('string with parent', ()=> {
        let parent = new EventLogger('parent');
        let logger = new EventLogger('test',parent);
        expect(logger.getName()).toBe('test');
        expect(logger.getParent()?.getName()).toBe('parent');
        expect(logger._get()).toEqual({})
    })
})


describe ('set/setContext',()=> {

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