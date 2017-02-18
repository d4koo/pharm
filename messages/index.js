/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
http://docs.botframework.com/builder/node/guides/understanding-natural-language/
-----------------------------------------------------------------------------*/
"use strict";
const Dialog = require('./dialog.js');
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'api.projectoxford.ai';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/

/*.matches('feeling_flow',[
  function(session){
    builder.Prompts.choice(session, Dialog.entryMessage, ["Good", "Sick"]);
  },
  function(session, results){
    session.userData.feeling = results.response.entity;
    session.beginDialog('/symptoms');
  }
])*/

/* .onDefault(
  function(session){
    builder.Prompts.choice(session, Dialog.entryMessage, ["Good", "Sick"]);
  },
  function(session, results){
    session.userData.feeling = results.response.entity;
  },
  function(session){
    if(session.userData.feeling == 'sick'){
      builder.Prompts.text(session, Dialog.askSymptoms);
    }
    else{
      session.send(Dialog.notSick);
      session.endDialog();
    }
  },
  function(session, results){
    session.userData.symptomsList = results.response;
    session.send("Got it, so you're experiencing " + session.userData.symptomsList +".");
  },
  function(session){
    session.Prompts.text(session, Dialog.guessDiagnosis + "GET DIAGNOSIS");
    session.beginDialog('/medicines');
  }
); */
bot.dialog('/', [
  function(session){
    builder.Prompts.choice(session, Dialog.entryMessage, ["Good", "Sick"]);
  },
  function(session, results){
    var areYouSick = results.response;
    if(areYouSick == "Good"){
      session.send(Dialog.notSick);
      session.endDialog();
    }
    else{
      builder.Prompts.text(session, Dialog.askSymptoms);
    }
  },
  function(session, results){
    var symptoms = results.response;
    session.send("Got it, so you're experiencing " +symptoms+".");
  },
  function(session){
    session.send(Dialog.guessDiagnosis + "GET DIAGNOSIS");
  },
  function(session){
    builder.Prompts.choice(session, Dialog.bestMeds + Dialog.medsList, ["Yes please!", "No thanks!"]);
  },
  function(session,results){
    if(results.response == "Yes please!"){
      session.send(Dialog.findPharms)
    }
    session.send(Dialog.endMessage);
  }
]);


/*bot.dialog('/', intents);  
bot.dialog('/symptoms',[
  function(session){
    if(session.userData.feeling == 'sick'){
      builder.Prompts.text(session, Dialog.askSymptoms);
    }
    else{
      session.send(Dialog.notSick);
      session.endDialog();
    }
  },
  function(session, results){
    session.userData.symptomsList = results.response;
    session.send("Got it, so you're experiencing " + session.userData.symptomsList +".");
  },
  function(session){
    session.Prompts.text(session, Dialog.guessDiagnosis + "GET DIAGNOSIS");
    session.beginDialog('/medicines');
  }
]);

bot.dialog('/medicines',[
  function(session){
    builder.Prompts.choice(session, Dialog.bestMeds + Dialog.medsList, ["Yes please!", "No thanks!"]);
  },
  function(session, results){
    var locate = results.response;
    if(locate == "Yes please!"){
      session.send(Dialog.findPharms)
    }
    else{
      session.send(Dialog.endMessage);
    }
  }
]);*/

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}

