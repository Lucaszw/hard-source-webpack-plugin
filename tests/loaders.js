var expect = require('chai').expect;

var util = require('./util');
var itCompilesTwice = util.itCompilesTwice;
var itCompilesChange = util.itCompilesChange;
var clean = util.clean;
var compile = util.compile;

describe('loader webpack use', function() {

  itCompilesTwice('loader-css');
  itCompilesTwice('loader-file');

});

describe('loader webpack warnings & errors', function() {

  var fixturePath = 'loader-warning';

  before(function() {
    return clean(fixturePath);
  });

  it('should cache errors & warnings from loader', function() {
    this.timeout(10000);
    return compile(fixturePath, {exportStats: true})
      .then(function(run1) {
        return Promise.all([run1, compile(fixturePath, {exportStats: true})])
      }).then(function(runs) {
        expect(runs[0].out).to.eql(runs[1].out);
        expect(runs[0].warnings.length).to.greaterThan(0);
        expect(runs[0].errors.length).to.greaterThan(0);
        expect(runs[1].warnings).to.eql(runs[0].warnings);
        expect(runs[1].errors).to.eql(runs[0].errors);
      });
  });

});

describe('loader webpack use - builds changes', function() {

  itCompilesChange('loader-custom-prepend-helper', {
    'loader-helper.js': [
      'function helper(a) {',
      '  console.log(a);',
      '}',
    ].join('\n'),
  }, {
    'loader-helper.js': [
      'function helper(b) {',
      '  console.log(b);',
      '}',
    ].join('\n'),
  }, function(output) {
    expect(output.run1['main.js'].toString()).to.match(/console\.log\(a\)/);
    expect(output.run2['main.js'].toString()).to.match(/console\.log\(b\)/);
  });

});
