/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
http://docs.botframework.com/builder/node/guides/understanding-natural-language/
-----------------------------------------------------------------------------*/
"use strict";
const request = require('request');
const Dialog = require('./dialog.js');
const Symp = require('./symptoms.js');
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

.matches('change_profile',[
  function(session){
    session.beginDialog('/profile');
  },
])

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
  function (session, args, next) {
      if (!session.userData.gender) {
          session.beginDialog('/profile');
      } else {
          next();
      }
  },
  function(session, results){
    session.send('Hello %s!', session.userData.name);
    builder.Prompts.choice(session, Dialog.entryMessage, ["Good", "Sick"]);
  },
  function(session, results){
    var areYouSick = results.response.entity;
    if(areYouSick == "Good"){
      session.send(Dialog.notSick);
      session.endDialog();
    }
    else{
      builder.Prompts.text(session, Dialog.askSymptoms);
    }
  },
  function(session, results){
    session.sendTyping();
    var symptoms = results.response.toLowerCase().split(",");
    var idSymptoms = [];

    for(var i = 0; i <symptoms.length; i++){
      for(var j = 0; j < Symp.length; j++){
        if(symptoms[i].includes(Symp[j][0])){
          idSymptoms.push(Symp[j][1]);
        }
      }
    }

<<<<<<< HEAD
    // Get request using idSymptoms[0] and idSymptoms[1] for diagnosis.
    // Then GET diagnosis Issue["Name"] 
=======
    session.send("Got it, so you're experiencing " +idSymptoms+".");
    session.send(Dialog.guessDiagnosis + symptoms);
>>>>>>> 7268e215943e5c1f0db6a465226fd3de0409ddb1

    session.send("Got it, so you're experiencing " +symptoms+".");
    session.send(Dialog.guessDiagnosis + idSymptoms);
    builder.Prompts.choice(session, Dialog.bestMeds + Dialog.medsList, ["Yes please!", "No thanks!"]);
  },
  function(session,results){
    if(results.response.entity == "Yes please!"){
      session.send(Dialog.findPharms)
    }
    session.send(Dialog.endMessage);
  }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.choice(session, 'Select your gender', ["Male", "Female", "Other"]);
    },
    function (session, results)
    {
        session.userData.gender = results.response.entity;
        builder.Prompts.text(session, 'What year were you born?');
    },
    function (session, results)
    {
        session.userData.birthYear = results.response;
        session.endDialog();
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

