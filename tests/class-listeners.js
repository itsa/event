/*global describe, it, beforeEach, afterEach */
/*jshint unused:false */

"use strict";

require("itsa-jsext");

var expect = require('chai').expect,
    should = require('chai').should(),
    Event = require("../index.js"),
    Classes = require("itsa-classes");

describe('Classes automatic Event-listeners', function () {
    // Code to execute before every test.
    beforeEach(function() {
    });

    // Code to execute after every test.
    afterEach(function() {
        Event.detachAll();
        Event.undefAllEvents();
    });


    it('check existance EventListener', function () {
        var A = Classes.createClass();
        var a = new A();
        expect(a.after===undefined).to.be.false;
    });

    it('check eventlistener on class', function () {
        var A = Classes.createClass(function() {
            this.x = 0;
            this.after('*:dosomething', this.action);
        }, {
            action: function() {
                this.x = 10;
            }
        });
        var a = new A();
        Event.emit('dosomething');
        expect(a.x).to.be.eql(10);
    });

    it('check removal eventlistener on class', function () {
        var A = Classes.createClass(function() {
            this.x = 0;
            this.after('*:dosomething', this.action);
        }, {
            action: function() {
                this.x = 10;
            }
        });
        var a = new A();
        a.destroy();
        expect(Event._subs.itsa_size()).to.be.eql(0);
    });

});