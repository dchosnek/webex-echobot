# Webex EchoBot

This bot is only useful to demonstrate what happens when a message is sent to a Webex bot. This bot will display the contents of the webhook event that it receives as well as echo back the original message.

## Interaction

Send a message to the bot and it will respond with a JSON structure similar to the one below as well the contents of your original message.

```json
{
  "id": "...zovL3VzL1dFQ...",
  "name": "incoming messages",
  "targetUrl": "https://XXXXXX.lambda-url.us-east-1.on.aws/",
  "resource": "messages",
  "event": "created",
  "orgId": "...zovL3VzL09SR...",
  "createdBy": "...zovL3VzL1BFT...",
  "appId": "...zovL3VzL0FQU...",
  "ownedBy": "creator",
  "status": "active",
  "created": "2024-08-05T03:00:09.609Z",
  "actorId": "...zovL3VzL1BFT...",
  "data": {
    "id": "...zovL3VzL01FU...",
    "roomId": "...zovL3VzL1JPT...",
    "roomType": "direct",
    "personId": "...zovL3VzL1BFT...",
    "personEmail": "email@domain.com",
    "created": "2024-08-05T13:04:31.488Z"
  }
}
```

The most interesting parameters from the JSON structure above that are used for most bots that I've written are:

* `data.id`: the id of the message received. Use the `/messages/{id}` API to retrieve its contents
* `data.personEmail`: the email of the message sender. It's easy to respond to that individual in Webex with their email.
* `resource`: the type of payload received (message or response to adaptive card). For bots that handle both, it is important to confirm this.

Other useful fields:

* `data.roomId`: whether the message was received in a direct or group space, responding to this space will work.
* `data.personId`: if you need any information about the user, use this field with with `/people/{personId}` API to get that detail

## Deploy the bot

Once you've looked at the JSON payload above and read the description of the fields, you probably don't need to deploy your own bot. If you still want to experiment with it yourself, use the `yml` file in this repository with AWS CloudFormation to deploy the entire stack. You must then replace the function code for the Lambda function with the code contained in `index.js` in this repository.

You will also need to [create a webhook](https://developer.webex.com/docs/api/v1/webhooks) in Webex that points to the Lambda FunctionUrl created by the CloudFormation stack mentioned above.

This is an example of how to create a webhook to the Lambda FunctionUrl for **new** messages sent to the bot.

```json
{
  "name": "give your webhook a descriptive name",
  "targetUrl": "https://XXXXXX.lambda-url.us-east-1.on.aws/",
  "resource": "messages",
  "event": "created"
}
```