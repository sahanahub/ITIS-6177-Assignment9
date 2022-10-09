'use strict';
console.log('Loading say keyword function');
 
exports.handler = async (event) => {
    let keyword = '';
    let responseCode = 200;
    
    if (event.queryStringParameters && event.queryStringParameters.keyword) {
        console.log("Received keyword: " + event.queryStringParameters.keyword);
        keyword = event.queryStringParameters.keyword;
    }
    
 
    let message = `Sahana says ${keyword}!`;

    let responseBody = {
        message: message
    };
    
    let response = {
        statusCode: responseCode,
        headers: {
            "x-custom-header" : "my custom header value"
        },
        body: JSON.stringify(responseBody)
    };
    return response;
};