var _ = require('lodash');
var xml = require('pixl-xml');
var fs = require("fs");
var he = require('he');
var path = require('path');

module.exports = function (wct, pluginOptions) {
    console.log('starting wct test result converter junit plugin');
    var tests = [];

    wct.on('test-end', function (browser, test, stats) {
        test.suite = he.encode(test.test[0] + ' (' + getBrowserDescription(browser) + ')');
        test.name = he.encode(_.slice(test.test, 1).join('; '));
        var classname = test.test[0];
        if (classname) {
            classname = classname.replace("test/", "").replace("-test.html", ".html");
        }
        test.classname = he.encode(classname);
        tests.push(test);
    });

    wct.on('run-end', function (error) {
        var fullpath = pluginOptions && pluginOptions.output ? pluginOptions.output : './test-results/junit-testfile.xml';

        var results = {
            testsuites: {
                testsuite: _.map(_.sortBy(_.unique(_.pluck(tests, 'suite'))), function (suite) {
                    var filteredTests = _.filter(tests, {
                        suite: suite
                    });
                    var testsuite = {
                        _Attribs: {
                            name: suite,
                            tests: filteredTests.length,
                            errors: 0,
                            failures: _.size(_.filter(filteredTests, {
                                state: 'failing'
                            })),
                            skipped: _.size(_.filter(filteredTests, {
                                state: 'pending'
                            }))
                        },
                        testcase: _.map(filteredTests, function (test) {
                            var testcase = {
                                _Attribs: {
                                    name: test.name,
                                    time: test.duration,
                                    classname: test.classname
                                }
                            };
                            if (test.state === 'failing') {
                                testcase.failure = {
                                    _Data: test.error.stack,
                                    _Attribs: {
                                        message: he.encode(test.error.message)
                                    }
                                };
                            }
                            if (test.state === 'error') {
                                testcase.error = {
                                    _Data: test.error.stack,
                                    _Attribs: {
                                        message: he.encode(test.error.message)
                                    }
                                };
                                testcase['system-out'] = he.encode(test.error.stack);
                            }
                            if (test.state === 'pending') {
                                testcase.skipped = {};
                            }

                            return testcase;
                        })
                    };

                    return testsuite;
                })
            }
        };
        fs.writeFileSync(path.resolve(fullpath), xml.stringify(results).replace(/&amp;/g, '&'));
    });

    function getBrowserDescription(browser) {
        var result = browser.browserName;

        if (_.size(browser.version) > 0) {
            result = result.concat(' ', browser.version);
        }

        if (_.size(browser.platform) > 0) {
            result = result.concat(' on ', browser.platform);
        }

        return he.encode(result).replace('.', ',');
    }

};