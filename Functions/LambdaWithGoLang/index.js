var exec = require('child_process').exec;

exports.handler = function(event, context) {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    //Take the Python command from an event arg.
    exec('go run "' + event.GoCode + '"', function(error, stdout) {
        console.log('Go returned: ' + stdout + '.');
        context.done(error, stdout);
    });
};