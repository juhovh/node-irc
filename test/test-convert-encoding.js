var irc = require('../lib/irc');
var test = require('tape');
var testHelpers = require('./helpers');
var checks = testHelpers.getFixtures('convert-encoding');
var bindTo = { opt: { encoding: 'utf-8' } };
var bindToFallback = { opt: { encoding: 'utf-8', fallbackEncoding: 'latin1' } };

test('irc.Client.convertEncoding old', function(assert) {
    var convertEncoding = function(str) {
        var self = this;

        if (self.opt.encoding) {
            var charsetDetector = require('node-icu-charset-detector');
            var Iconv = require('iconv').Iconv;
            var charset = charsetDetector.detectCharset(str).toString();
            var to = new Iconv(charset, self.opt.encoding);

            return to.convert(str);
        } else {
            return str;
        }
    }.bind(bindTo);

    checks.causesException.forEach(function iterate(line) {
        var causedException = false;
        try {
            convertEncoding(line);
        } catch (e) {
            causedException = true;
        }

        assert.equal(causedException, true, line + ' caused exception');
    });

    assert.end();
});

test('irc.Client.convertEncoding', function(assert) {
    var convertEncoding = irc.Client.prototype.convertEncoding.bind(bindTo);

    checks.causesException.forEach(function iterate(line) {
        var causedException = false;

        try {
            convertEncoding(line);
        } catch (e) {
            causedException = true;
        }

        assert.equal(causedException, false, line + ' didn\'t cause exception');
    });

    assert.end();
});

test('irc.Client.convertEncoding fallback', function(assert) {
    var convertEncoding = irc.Client.prototype.convertEncoding.bind(bindToFallback);

    var latin1 = new Buffer('6d79f668e6', 'hex');
    var utf8 = new Buffer('myöhä');

    assert.equal(convertEncoding(latin1), convertEncoding(utf8), 'latin1 and utf8 strings were not equal');
    assert.end();
});
