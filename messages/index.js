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

var API_KEY = "AIzaSyDNEXmxnsK3Ry7Rpc3RH_AKftt1beWWuSg";

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
  function (session, args, next) {
      if (!session.userData.name) {
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

    // Get request using idSymptoms[0] and idSymptoms[1] for diagnosis.
    // Then GET diagnosis Issue["Name"] 
    request('https://sandbox-healthservice.priaid.ch/diagnosis?symptoms=[\"13\"]&gender=male&year_of_birth=1988&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImRvbmFsZGtvbzcyQGdtYWlsLmNvbSIsInJvbGUiOiJVc2VyIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvc2lkIjoiMTE4OCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvdmVyc2lvbiI6IjIwMCIsImh0dHA6Ly9leGFtcGxlLm9yZy9jbGFpbXMvbGltaXQiOiI5OTk5OTk5OTkiLCJodHRwOi8vZXhhbXBsZS5vcmcvY2xhaW1zL21lbWJlcnNoaXAiOiJQcmVtaXVtIiwiaHR0cDovL2V4YW1wbGUub3JnL2NsYWltcy9sYW5ndWFnZSI6ImVuLWdiIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9leHBpcmF0aW9uIjoiMjA5OS0xMi0zMSIsImh0dHA6Ly9leGFtcGxlLm9yZy9jbGFpbXMvbWVtYmVyc2hpcHN0YXJ0IjoiMjAxNy0wMi0xOCIsImlzcyI6Imh0dHBzOi8vc2FuZGJveC1hdXRoc2VydmljZS5wcmlhaWQuY2giLCJhdWQiOiJodHRwczovL2hlYWx0aHNlcnZpY2UucHJpYWlkLmNoIiwiZXhwIjoxNDg3NDU2MDMyLCJuYmYiOjE0ODc0NDg4MzJ9.7Z1BSjILmw-kn4EROR4pdcTaEShdgVXvcBJ3PCY2JxI&language=en-gb&format=json', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body) // Show the HTML for the Google homepage. 
      }
    })

    session.send("Got it, so you're experiencing " +symptoms+".");
    session.send(Dialog.guessDiagnosis + idSymptoms);
    builder.Prompts.choice(session, Dialog.bestMeds + Dialog.medsList, ["Yes please!", "No thanks!"]);
  },
  function(session,results){
    if(results.response.entity == "Yes please!"){
      builder.Prompts.choice(session, "What is the closest address to you? (Try to be as detailed as possible)");
    }
    else
      session.send(Dialog.endMessage);
  }
  function(session, results){
    var address = results.response.entity.replace(" ", "+");
    var url = "https://www.google.com/search?q=pharmacies+near+" + address;
    // var url = "https://maps.googleapis.com/maps/api/geocode/"
    // var options = {
    //   method: "POST",
    //   body: {
    //     "address": address,
    //     "key": API_KEY,        
    //   },
    //   json: true,
    //   url: url
    // }

    // var result_link = '';
    // request(options, function(err, res, body) {
    //   if (err) {
    //     console.log(err, 'error when posting request for geocode');
    //     return;
    //   }      

    //   result_link = res.
      // var location = body.geometry.location.lat + ',' + body.geometry.location.lng;
      // var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/"
      // var options = {
      //   method: "POST",
      //   body: {
      //     "location": location,
      //     "radius": 500,
      //     "type": "pharmacy",
      //     "key": API_KEY,
      //   },
      //   json: true,
      //   url: url
      // }
      // request(options, function(err, res, body) {
      //   if (err) {
      //     console.log(err, 'error when posting request for near pharmacies');
      //     return;
      //   }

      })
    })

    session.send(Dialog.findPharms + url);
    session.send(Dialog.endMessage);
  }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
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

