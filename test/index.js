
var equal = require('assert-dir-equal');
var Metalsmith = require('metalsmith');
var markdown = require('..');

describe('metalsmith-markdown', function(){
  it('should convert markdown files', function(done){
    Metalsmith('test/fixture')
      .use(markdown({
        smartypants: true
      }))
      .build(function(err){
        if (err) return done(err);
        equal('test/fixture/expected', 'test/fixture/build');
        done();
      });
  });
});