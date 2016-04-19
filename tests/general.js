/*global describe, it, beforeEach, afterEach */
/*jshint unused:false */

"use strict";

require("itsa-jsext");

var expect = require('chai').expect,
    should = require('chai').should(),
    Event = require("../index.js"),
    Classes = require("itsa-classes");

describe('General tests', function () {

    // Code to execute before every test.
    beforeEach(function() {
    });

    // Code to execute after every test.
    afterEach(function() {
        Event.detachAll();
        Event.undefAllEvents();
    });

    it('objectlisteners to themselves using "this" as emitterName', function () {
        var cb, member1, member2, member3, memberproto, count = 0;
        memberproto = {}.itsa_merge(Event.Listener).itsa_merge(Event.Emitter('PersonalProfile'));
        memberproto.cb = function(e) {
            expect(this.name).to.be.eql('itsa');
            count++;
        };
        member1 = Object.create(memberproto);
        member2 = Object.create(memberproto);
        member3 = Object.create(memberproto);
        member1.name = 'a';
        member2.name = 'itsa';
        member3.name = 'b';
        member1.after('this:send', member1.cb);
        member2.after('this:send', member2.cb);
        member3.after('this:send', member3.cb);
        member2.emit('send');
        expect(count).to.be.eql(1);
    });

    it('classlisteners to themselves using "this" as emitterName', function () {
        var cb, member1, member2, member3, Member, count = 0;
        Member = Classes.createClass(
            function (name) {
                this.name = name;
                this.after('this:send', this.afterSend);
            },
            {
                afterSend: function() {
                    expect(this.name).to.be.eql('itsa');
                    count++;
                }
            }
        );
        Member.mergePrototypes(Event.Listener).mergePrototypes(Event.Emitter('PersonalProfile'));
        member1 = new Member('a');
        member2 = new Member('itsa');
        member3 = new Member('b');
        member2.emit('send');
        expect(count).to.be.eql(1);
    });

    it('consistency eventobject', function () {
        var redObject = {},
            handle;
        handle = Event.onceBefore('red:save', function(e) {}, redObject);
        expect(Event._subs['red:save'].b.length).to.eql(1);
        handle.detach();
        (Event._subs['red:save']===undefined).should.be.true;
    });

    it('check detach-handle before-subscriber', function () {
        var redObject = {},
            handle;
        handle = Event.before('red:save', function(e) {}, redObject);
        expect(Event._subs['red:save'].b.length).to.eql(1);
        handle.detach();
        (Event._subs['red:save']===undefined).should.be.true;
    });

    it('check detach-handle after-subscriber', function () {
        var redObject = {},
            handle;
        handle = Event.after('red:save', function() {}, redObject);
        expect(Event._subs['red:save'].a.length).to.eql(1);
        handle.detach();
        (Event._subs['red:save']===undefined).should.be.true;
    });

    it('check detach-handle onceBefore-subscriber', function () {
        var redObject = {},
            handle;
        handle = Event.onceBefore('red:save', function() {}, redObject);
        expect(Event._subs['red:save'].b.length).to.eql(1);
        handle.detach();
        (Event._subs['red:save']===undefined).should.be.true;
    });

    it('check detach-handle onceAfter-subscriber', function () {
        var redObject = {},
            handle;
        handle = Event.onceAfter('red:save', function() {}, redObject);
        expect(Event._subs['red:save'].a.length).to.eql(1);
        handle.detach();
        (Event._subs['red:save']===undefined).should.be.true;
    });

    it('onceBefore-subscriber auto cleanup', function (done) {
        var redObject = {},
            count = 0;
        Event.onceBefore('red:save', function() {
            count++;
        }, redObject);
        Event.emit(redObject, 'red:save');
        Event.emit(redObject, 'red:save');
        setTimeout(function() {
            expect(count).to.eql(1);
            done();
        }, 500);
    });

    it('onceAfter-subscriber auto cleanup', function (done) {
        var redObject = {},
            count = 0;
        Event.onceAfter('red:save', function() {
            count++;
        }, redObject);
        Event.emit(redObject, 'red:save');
        Event.emit(redObject, 'red:save');
        setTimeout(function() {
            expect(count).to.eql(1);
            done();
        }, 50);
    });

    it('onceBefore-subscriber auto cleanup with halted inbetween', function (done) {
        var redObject = {},
            count = 0,
            handle;
        Event.onceBefore('red:save', function(e) {
            e.halt();
        }, redObject);
        handle = Event.onceBefore('red:save', function() {
            count++;
        }, redObject);
        Event.emit(redObject, 'red:save');
        Event.emit(redObject, 'red:save');
        Event.emit(redObject, 'red:save');
        setTimeout(function() {
            expect(count).to.eql(1);
            handle.detach();
            done();
        }, 50);
    });

    it('onceAfter-subscriber auto cleanup with halted inbetween', function (done) {
        var redObject = {},
            count = 0,
            handle;
        Event.onceBefore('red:save', function(e) {
            e.halt();
        }, redObject);
        handle = Event.onceAfter('red:save', function() {
            count++;
        }, redObject);
        Event.emit(redObject, 'red:save');
        Event.emit(redObject, 'red:save');
        Event.emit(redObject, 'red:save');
        setTimeout(function() {
            expect(count).to.eql(1);
            handle.detach();
            done();
        }, 50);
    });

    it('check detach() on the object', function () {
        var blueObject = {};
        blueObject.itsa_merge(Event.Listener);
        blueObject.before('blue:save', function() {});
        expect(Event._subs['blue:save'].b.length).to.eql(1);
        blueObject.detach('blue:save');
        (Event._subs['blue:save']===undefined).should.be.true;
    });

    it('check detach() on the object with multiple subscribers', function () {
        var blueObject = {},
            greenObject = {};
        blueObject.itsa_merge(Event.Listener);
        greenObject.itsa_merge(Event.Listener);
        blueObject.before('blue:save', function() {});
        blueObject.before('blueb:save', function() {});
        greenObject.before('blue:save', function() {});
        expect(Event._subs['blue:save'].b.length).to.eql(2);
        blueObject.detach('blue:save');
        expect(Event._subs['blue:save'].b.length).to.eql(1);
        greenObject.detach('blue:save');
        (Event._subs['blue:save']===undefined).should.be.true;
        expect(Event._subs['blueb:save'].b.length).to.eql(1);
        blueObject.detach('blueb:save');
        (Event._subs['blueb:save']===undefined).should.be.true;
    });

    it('check detachAll() on the object', function () {
        var blueObject = {},
            greenObject = {};
        blueObject.itsa_merge(Event.Listener);
        greenObject.itsa_merge(Event.Listener);
        blueObject.before('blue:save', function() {});
        blueObject.before('blueb:save', function() {});
        greenObject.before('blue:save', function() {});
        expect(Event._subs['blue:save'].b.length).to.eql(2);
        blueObject.detachAll();
        expect(Event._subs['blue:save'].b.length).to.eql(1);
        (Event._subs['blueb:save']===undefined).should.be.true;
        greenObject.detach('blue:save');
        (Event._subs['blue:save']===undefined).should.be.true;
    });

    it('check detachAll() on ITSA.Event', function () {
        var blueObject = {},
            greenObject = {};
        blueObject.itsa_merge(Event.Listener);
        greenObject.itsa_merge(Event.Listener);
        blueObject.before('blue:save', function() {});
        blueObject.before('blueb:save', function() {});
        greenObject.before('blue:save', function() {});
        expect(Event._subs['blue:save'].b.length).to.eql(2);
        Event.detachAll(blueObject);
        expect(Event._subs['blue:save'].b.length).to.eql(1);
        (Event._subs['blueb:save']===undefined).should.be.true;
        greenObject.detach('blue:save');
        (Event._subs['blue:save']===undefined).should.be.true;
    });

    it('check detachAll() on ITSA.Event', function () {
        var blueObject = {},
            greenObject = {};
        blueObject.itsa_merge(Event.Listener);
        blueObject.before('blue:save', function() {});
        Event.detachAll(); // will log an error --> cannot be called without parameters
        (Event._subs['blue:save']===undefined).should.be.true;
    });

    it('cross-emits', function (done) {
        var blueObject = {},
            redObject = {};
        Event.before('blue:save', function() {
            Event.detachAll(blueObject);
            Event.detachAll(redObject);
            done();
        }, blueObject);
        Event.before('red:save', function() {
            throw new Error('wrong subscriber invoked');
        }, redObject);
        Event.emit(redObject, 'blue:save');
    });

    it('status.ok', function () {
        Event.defineEvent('red:save').defaultFn(function() {});
        Event.emit('red:save').status.ok.should.be.true;
    });

    it('status.ok when no customEvent', function () {
        Event.emit('red:save').status.ok.should.be.true;
    });

    it('status.ok when halted', function () {
        Event.defineEvent('red:save').defaultFn(function() {});
        Event.before('red:save', function(e) {
            e.halt();
        });
        Event.emit('red:save').status.ok.should.be.false;
    });

    it('status.ok when halted when no customEvent', function () {
        Event.before('red:save', function(e) {
            e.halt();
        });
        Event.emit('red:save').status.ok.should.be.false;
    });

    it('status.ok when preventDefaulted', function () {
        Event.defineEvent('red:save').defaultFn(function() {});
        Event.before('red:save', function(e) {
            e.preventDefault();
        });
        Event.emit('red:save').status.ok.should.be.false;
    });

    it('status.ok when preventDefaulted when no customEvent', function () {
        Event.before('red:save', function(e) {
            e.preventDefault();
        });
        Event.emit('red:save').status.ok.should.be.false;
    });

    it('status.defaultFn', function () {
        Event.defineEvent('red:save').defaultFn(function() {});
        Event.emit('red:save').status.defaultFn.should.be.true;
    });

    it('status.defaultFn when halted', function () {
        Event.defineEvent('red:save').defaultFn(function() {});
        Event.before('red:save', function(e) {
            e.halt();
        });
        (Event.emit('red:save').status.defaultFn===undefined).should.be.true;
    });

    it('status.defaultFn when preventDefaulted', function () {
        Event.defineEvent('red:save').defaultFn(function() {});
        Event.before('red:save', function(e) {
            e.preventDefault();
        });
        (Event.emit('red:save').status.defaultFn===undefined).should.be.true;
    });

    it('status.defaultFn when no customEvent', function () {
        (Event.emit('red:save').status.defaultFn===undefined).should.be.true;
    });

    it('status.preventedFn', function () {
        Event.defineEvent('red:save').preventedFn(function() {});
        (Event.emit('red:save').status.preventedFn===undefined).should.be.true;
    });

    it('status.preventedFn when halted', function () {
        Event.defineEvent('red:save').preventedFn(function() {});
        Event.before('red:save', function(e) {
            e.halt();
        });
        (Event.emit('red:save').status.preventedFn===undefined).should.be.true;
    });

    it('status.preventedFn when preventDefaulted', function () {
        Event.defineEvent('red:save').preventedFn(function() {});
        Event.before('red:save', function(e) {
            e.preventDefault();
        });
        Event.emit('red:save').status.preventedFn.should.be.true;
    });

    it('status.preventedFn when no customEvent', function () {
        (Event.emit('red:save').status.preventedFn===undefined).should.be.true;
    });

    it('status.halted when not halted', function () {
        (Event.emit('red:save').status.halted===undefined).should.be.true;
    });

    it('status.halted when halted without description', function () {
        Event.before('red:save', function(e) {
            e.halt();
        });
        Event.emit('red:save').status.halted.should.be.true;
    });

    it('status.halted when halted with description', function () {
        Event.before('red:save', function(e) {
            e.halt('some reason');
        });
        Event.emit('red:save').status.halted.should.be.eql('some reason');
    });

    it('status.defaultPrevented when not defaultPrevented', function () {
        (Event.emit('red:save').status.defaultPrevented===undefined).should.be.true;
    });

    it('status.defaultPrevented when defaultPrevented without description', function () {
        Event.before('red:save', function(e) {
            e.preventDefault();
        });
        Event.emit('red:save').status.defaultPrevented.should.be.true;
    });

    it('status.defaultPrevented when defaultPrevented with description', function () {
        Event.before('red:save', function(e) {
            e.preventDefault('some reason');
        });
        Event.emit('red:save').status.defaultPrevented.should.be.eql('some reason');
    });

    it('status.renderPrevented when not renderPrevented', function () {
        (Event.emit('red:save').status.renderPrevented===undefined).should.be.true;
    });

    it('check notify() once', function () {
        var count = 0;
        Event.notify('red:save', function(ce) {
            ce.should.be.eql('red:save');
            expect(Event._notifiers.itsa_keys().length).to.eql(1);
            count++;
        }, Event, true);
        Event.before('red:save', function() {
            expect(Event._notifiers.itsa_keys().length).to.eql(0);
        });
        Event.emit('red:save');
        Event.emit('red:save');
        expect(count).to.eql(1);
        Event.unNotify('red:save');
    });

    it('check notify()', function () {
        var count = 0;
        Event.notify('red:save', function(ce) {
            ce.should.be.eql('red:save');
            expect(Event._notifiers.itsa_keys().length).to.eql(count+1);
            count++;
        }, Event);
        Event.before('red:save', function() {
            expect(Event._notifiers.itsa_keys().length).to.eql(1);
        });
        Event.emit('red:save');
        Event.emit('red:save');
        expect(count).to.eql(1);
        Event.unNotify('red:save');
    });

    it('check notify() wildcard once', function () {
        var count = 0;
        Event.notify('red:*', function(ce) {
            (count===0) && ce.should.be.eql('red:save');
            (count===1) && ce.should.be.eql('red:create');
            expect(Event._notifiers.itsa_keys().length).to.eql(1);
            count++;
        }, Event, true);
        Event.before('red:save', function() {
            expect(Event._notifiers.itsa_keys().length).to.eql(1);
        });
        Event.before('red:create', function() {
            expect(Event._notifiers.itsa_keys().length).to.eql(1);
        });
        Event.emit('red:save');
        Event.emit('red:create');
        expect(count).to.eql(2);
        Event.unNotify('red:*');
    });

    it('check notify() wildcard', function () {
        var count = 0;
        Event.notify('red:*', function(ce) {
            (count===0) && ce.should.be.eql('red:save');
            (count===1) && ce.should.be.eql('red:create');
            expect(Event._notifiers.itsa_keys().length).to.eql(1);
            count++;
        }, Event);
        Event.before('red:save', function() {
            expect(Event._notifiers.itsa_keys().length).to.eql(1);
        });
        Event.before('red:create', function() {
            expect(Event._notifiers.itsa_keys().length).to.eql(1);
        });
        Event.emit('red:save');
        Event.emit('red:create');
        expect(count).to.eql(2);
        Event.unNotify('red:*');
    });

    it('check unNotify()', function () {
        var count = 0;
        Event.notify('red:save', function(ce) {
            count++;
        }, Event);
        Event.unNotify('red:save');
        Event.emit('red:save');
        expect(count).to.eql(0);
    });

    it('check unNotify() wildcard', function () {
        var count = 0;
        Event.notify('red:*', function(ce) {
            count++;
        }, Event);
        Event.unNotify('red:*');
        Event.emit('red:save');
        expect(count).to.eql(0);
    });

    it('check notify() when not needed', function () {
        Event.notify('red:save', function(ce) {}, Event);
        Event.emit('red:save');
        Event.unNotify('red:save'); // should not throw error
    });

    it('different beforesubscribers', function () {
        var count = 0,
            subscriber = {
                o: Event,
                cb: function(e) {
                    count += 1;
                }
            };
        Event.before('red:save', function(e) {
            throw new Error('default before-subscriber shouln\'t get invoked');
        });
        Event.after('red:save', function(e) {
            count += 2;
        });
        Event._emit(Event, 'red:save', null, [subscriber]).status.ok.should.be.true;
        expect(count).to.eql(3);
    });

    it('different aftersubscribers', function () {
        var count = 0,
            subscriber = {
                o: Event,
                cb: function(e) {
                    count += 1;
                }
            };
        Event.before('red:save', function(e) {
            count += 2;
        });
        Event.after('red:save', function(e) {
            throw new Error('default after-subscriber shouln\'t get invoked');
        });
        Event._emit(Event, 'red:save', null, null, [subscriber]).status.ok.should.be.true;
        expect(count).to.eql(3);
    });

    it('different before- and after-subscribers', function () {
        var count = 0,
            beforeSubscriber = {
                o: Event,
                cb: function(e) {
                    count += 1;
                }
            },
            afterSubscriber = {
                o: Event,
                cb: function(e) {
                    count += 2;
                }
            };
        Event.before('red:save', function(e) {
            throw new Error('default before-subscriber shouln\'t get invoked');
        });
        Event.after('red:save', function(e) {
            throw new Error('default after-subscriber shouln\'t get invoked');
        });
        Event._emit(Event, 'red:save', null, [beforeSubscriber], [afterSubscriber]).status.ok.should.be.true;
        expect(count).to.eql(3);
    });

});
