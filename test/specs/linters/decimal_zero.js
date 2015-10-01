var assert = require('assert');
var path = require('path');
var linter = require('../../../lib/linters/' + path.basename(__filename));
var lint = require('../../lib/spec_linter')(linter);
var parseAST = require('../../../lib/linter').parseAST;
var undefined;

describe('lesshint', function () {
    describe('#decimalZero()', function () {
        var options;
        var source;
        var ast;
        var actual;
        var expected;

        var shouldAllow = function (array) {
            array.forEach(function (example) {
                it('should allow "' + example + '"', function () {
                    source = '.foo { font-size: ' + example + '; }';

                    ast = parseAST(source);
                    ast = ast.first().first('block').first('declaration');

                    assert.equal(undefined, lint(options, ast));
                });
            });
        };
        var shouldNotAllow = function (array) {
            array.forEach(function (example) {
                it('should not allow "' + example + '"', function () {
                    source = '.foo { font-size: ' + example + '; }';

                    ast = parseAST(source);
                    ast = ast.first().first('block').first('declaration');

                    assert.notEqual(undefined, lint(options, ast));
                });
            });
        };

        describe('when disabled', function () {
            beforeEach(function () {
                source = '.foo { font-size: .5em; }';

                options = {
                    decimalZero: {
                        enabled: false
                    }
                };

                ast = parseAST(source);
                ast = ast.first().first('block').first('declaration');
            });

            it('should return null', function () {
                assert.equal(undefined, lint(options, ast));
            });
        });//disabled

        describe('when disabled via shorthand', function () {
            beforeEach(function () {
                source = '.foo { font-size: .5em; }';

                options = {
                    decimalZero: false
                };

                ast = parseAST(source);
                ast = ast.first().first('block').first('declaration');
            });

            it('should return null', function () {
                assert.equal(null, lint(options, ast));
            });
        });//disabled via shorthand

        describe('when "style" is "foobar" (unrecognized)', function () {
            beforeEach(function () {
                source = '.foo { font-size: .5em; }';

                options = {
                    decimalZero: {
                        enabled: true,
                        style: 'foobar'
                    }
                };

                ast = parseAST(source);
                ast = ast.first().first('block').first('declaration');
            });

            it('should throw error', function () {
                assert.throws(lint.bind(null, options, ast), Error);
            });
        });//style: foobar (unrecognized)

        describe('when "style" is "leading"', function () {
            beforeEach(function () {
                options = {
                    decimalZero: {
                        enabled: true,
                        style: 'leading'
                    }
                };
            });

            shouldAllow([
                '1em',   // integer (skipped)
                '0em',   // integer (skipped)
                '0.5em', // leading
                '1.5em', // leading (optional zero)
                '10.5em' // leading (optional zero)
            ]);

            shouldNotAllow([
                '.5em',  // none
                '.50em', // trailing
                '1.0em', // trailing
                '0.50em' // both
            ]);

            it('should return expected error message on invalid value', function () {
                source = '.foo { font-size: .5em; }';

                expected = [{
                    column: 19,
                    line: 1,
                    linter: 'decimalZero',
                    message: '.5 should be written with leading zero.'
                }];

                ast = parseAST(source);
                ast = ast.first().first('block').first('declaration');

                actual = lint(options, ast);

                assert.deepEqual(actual, expected);
            });
        });//style: leading

        describe('when "style" is "trailing"', function () {
            beforeEach(function () {
                options = {
                    decimalZero: {
                        enabled: true,
                        style: 'trailing'
                    }
                };
            });

            shouldAllow([
                '1em',    // integer (skipped)
                '0em',    // integer (skipped)
                '.50em',  // trailing
                '1.0em',  // trailing
            ]);

            shouldNotAllow([
                '.5em',   // none
                '0.50em', // both
                '0.5em',  // leading
                '1.5em',  // leading (optional zero)
                '10.5em'  // leading (optional zero)
            ]);

            it('should return expected error message on invalid value', function () {
                source = '.foo { font-size: 1.5em; }';

                expected = [{
                    column: 19,
                    line: 1,
                    linter: 'decimalZero',
                    message: '1.5 should be written with trailing zero.'
                }];

                ast = parseAST(source);
                ast = ast.first().first('block').first('declaration');

                actual = lint(options, ast);

                assert.deepEqual(actual, expected);
            });
        });//style: trailing

        describe('when "style" is "both"', function () {
            beforeEach(function () {
                options = {
                    decimalZero: {
                        enabled: true,
                        style: 'both'
                    }
                };
            });

            shouldAllow([
                '1em',    // integer (skipped)
                '0em',    // integer (skipped)
                '1.0em',  // trailing
                '0.50em', // both
                '10.50em' // optional leading zero
            ]);

            shouldNotAllow([
                '.50em',  // trailing
                '.5em',   // none
                '0.5em',  // leading
                '1.5em',  // leading (optional zero)
                '10.5em'  // leading (optional zero)
            ]);

            it('should return expected error message on invalid value', function () {
                source = '.foo { font-size: .5em; }';

                expected = [{
                    column: 19,
                    line: 1,
                    linter: 'decimalZero',
                    message: '.5 should be written with leading and trailing zero.'
                }];

                ast = parseAST(source);
                ast = ast.first().first('block').first('declaration');

                actual = lint(options, ast);

                assert.deepEqual(actual, expected);
            });
        });//style: both

        describe('when "style" is "none"', function () {
            beforeEach(function () {
                options = {
                    decimalZero: {
                        enabled: true,
                        style: 'none'
                    }
                };
            });

            shouldAllow([
                '1em',    // integer (skipped)
                '0em',    // integer (skipped)
                '.5em',   // none
                '1.5em',  // leading (optional zero)
                '10.5em'  // leading (optional zero)
            ]);

            shouldNotAllow([
                '1.0em',  // trailing
                '.50em',  // trailing
                '0.50em', // both
                '10.50em',// optional leading zero
                '0.5em'   // leading
            ]);

            it('should return expected error message on invalid value', function () {
                source = '.foo { font-size: 0.50em; }';

                expected = [{
                    column: 19,
                    line: 1,
                    linter: 'decimalZero',
                    message: '0.50 should be written without leading and trailing zero.'
                }];

                ast = parseAST(source);
                ast = ast.first().first('block').first('declaration');

                actual = lint(options, ast);

                assert.deepEqual(actual, expected);
            });
        });
    });
});
