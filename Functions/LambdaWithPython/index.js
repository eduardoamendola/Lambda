var exec = require('child_process').exec;
//Spawn a background process in Python (replace [path] and [script]).
//require("child_process").spawn("python", ["[path][script].py"], {stdio: [0, 1, 2]}).disconnect();
exports.handler = function(event, context) {
    console.log('Received event:', JSON.stringify(event, null, 2));
    /*
    //Run a fixed Python command.
    exec('python -c "import sys; print sys.version_info"', function(error, stdout) {
        console.log('Python returned: ' + stdout + '.');
        context.done(error, stdout);
    });
    */
    //Take the Python command from an event arg.
    exec('python -c "' + event.pythonCode + '"', function(error, stdout) {
        console.log('Python returned: ' + stdout + '.');
        context.done(error, stdout);
    });
};
}