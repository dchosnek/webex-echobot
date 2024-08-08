/**
 * Project: Webex EchoBot
 * File: index.js
 * Description: AWS Lambda code to echo messages sent to a Webex bot
 * Author: Doron Chosnek
 * Date: August 2024
 * Version: 1.0.0
 * 
 * Notes:
 * - The purpose of this project is education.
 */

const https = require('https');


/**
 * Retrieve contents of a Webex message
 * @param {string} id - id of the message to be retrieved
 * @param {string} token - Webex API token
 * @returns string contents of the Webex message
 */
async function getMessage(id, token) {
    const url = `https://webexapis.com/v1/messages/${id}`;
    const options = {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
    return new Promise((resolve, reject) => {
        const req = https.get(url, options, (res) => {
            let data = '';

            // A chunk of data has been received.
            res.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received.
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data).text);
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}


/**
 * Sends a markdown message to the specified roomId using the provided Webex token
 * @param {string} roomId - Destination for the message to be sent
 * @param {string} markdown - Message to be sent in markdown format
 * @param {string} token - Webex API token
 * @returns nothing
 */
async function sendMessage(roomId, markdown, token) {
    return new Promise((resolve, reject) => {

        const url = "https://webexapis.com/v1/messages";
        var options = {
            'method': 'POST',
            'hostname': 'webexapis.com',
            'path': '/v1/messages',
            'headers': {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            'maxRedirects': 20
          };
          
          var req = https.request(options, function (res) {
            var chunks = [];
          
            res.on("data", function (chunk) {
              chunks.push(chunk);
            });
          
            res.on("end", function (chunk) {
              var body = Buffer.concat(chunks);
              console.log(body.toString());
            });
          
            res.on("error", function (error) {
              console.error(error);
            });
          });
          
          var postData = JSON.stringify({
            "roomId": roomId,
            "markdown": markdown
          });
          
          req.write(postData);
          
          req.end();
    });
}

/** 
 * Build the markdown for the message to return to the sender.
 * @param {object} body - the event sent by Webex
 * @param {string} message - actual contents of the message sent
 * @param {string} person - email or id of the person who sent the message
 */
function buildMarkdown(body, person, message) {
    const jsonBody = JSON.stringify(body, null, 2);
    // multiline string
    const markdown = `
\`\`\`json
${jsonBody}
\`\`\`

## ${person} said:
> ${message}
    `
    return markdown;
}

/**
 * Echo details of a message received by this bot back to it sender
 * @param {object} event - details of the event to be handled by this lambda
 * @returns statusCode 200 regardless of what actually happens
 */
exports.handler = async (event) => {
    console.log("EVENT IS BELOW");
    console.log(event);

    // the Webex event is located in the event body
    const eventBody = JSON.parse(event.body);
    console.log("EVENT BODY FROM WEBEX IS BELOW");
    console.log(eventBody);

    // retrieve the Webex token
    const token = process.env.TOKEN;

    // retrieve information about the event
    const id = eventBody?.data?.id;                     // message id
    const roomId = eventBody?.data?.roomId;             // room id
    const personEmail = eventBody?.data?.personEmail;   // email

    if (eventBody.resource === "messages") {

        // only process events not created by the bot itself
        if (! personEmail.includes("webex.bot")) {

            // retrieve message contents
            const message = await getMessage(id, token);
            console.log(`MESSAGE = "${message}"`);
    
            // create and send message to sender
            const markdown = buildMarkdown(eventBody, personEmail, message);
            await sendMessage(roomId, markdown, token);
        }
    }

    // return a status code of 200 so the Webex webhook doesn't become disabled
    return {
        statusCode: 200
    };
};
