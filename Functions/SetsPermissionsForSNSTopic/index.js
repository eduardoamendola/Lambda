/**
* A Lambda function that sets the permissions for the specified SNS topic
**/
var aws = require("aws-sdk");

exports.handler = function(event, context) {

    console.log("REQUEST RECEIVED:\n" + JSON.stringify(event));

    // For Delete requests, immediately send a SUCCESS response.
    if (event.RequestType == "Delete") {
        sendResponse(event, context, "SUCCESS");
        return;
    }

    var responseStatus = "FAILED";
    var responseData = {};

    var lambda = new aws.Lambda({region: event.ResourceProperties.Region});
    var addPermissionParams = {
	Action: 'lambda:InvokeFunction',
  	FunctionName: event.ResourceProperties.LambdaFx,
  	Principal: 'sns.amazonaws.com',
  	StatementId: 'stmt-id-101',
    };

    // Permissions for SNS to invoke Lambda
    lambda.addPermission(addPermissionParams, function(err, addPermissionResult) {
        if (err) {
            responseData = {Error: "Add Permission call failed"};
            console.log(responseData.Error + ":\n", err);
        }
        else {
	    responseStatus = "SUCCESS";
	    responseData = { "Result" : addPermissionResult };
        }
        sendResponse(event, context, responseStatus, responseData);
    });
};


// Send response to the pre-signed S3 URL
function sendResponse(event, context, responseStatus, responseData) {

    var responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: "See the details in CloudWatch Log Stream: " + context.logStreamName,
        PhysicalResourceId: context.logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: responseData
    });

    console.log("RESPONSE BODY:\n", responseBody);

    var https = require("https");
    var url = require("url");

    var parsedUrl = url.parse(event.ResponseURL);
    var options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: "PUT",
        headers: {
            "content-type": "",
            "content-length": responseBody.length
        }
    };

    console.log("SENDING RESPONSE...\n");

    var request = https.request(options, function(response) {
        console.log("STATUS: " + response.statusCode);
        console.log("HEADERS: " + JSON.stringify(response.headers));
        // Tell AWS Lambda that the function execution is done
        context.done();
    });

    request.on("error", function(error) {
        console.log("sendResponse Error:" + error);
        // Tell AWS Lambda that the function execution is done
        context.done();
    });

    // write data to request body
    request.write(responseBody);
    request.end();
}
