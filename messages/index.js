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


//Google Custom Search API variables
var google = require('googleapis');
var customsearch = google.customsearch('v1');

// You can get a custom search engine id at
// https://www.google.com/cse/create/new
const CX = '005678558225547190025:eudrns_0izc';
const API_KEY = 'AIzaSyDj2ur2XxxCgagiTKSh7bKVCgKXyJ9_hU0';
const SEARCH = 'testing';


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

    var diag = "Cancer!";
    var subtext = "Cancer is a group of diseases involving abnormal cell growth with the potential to invade or..."
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
bot.dialog('/', intents);

intents.matches('None', '/none');
intents.matches('change_profile', '/profile');

bot.dialog('/none', [
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
  function(session, results, next){
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
    var fOne = idSymptoms[0];
    var fTwo = idSymptoms[1];
    var medList = "Tylenol, Advil, or see a doctor!"

    if(((fOne == 238 || fTwo == 238) && (fOne == 9 || fTwo == 9)) || ((fOne == 238 || fTwo == 238) && (fOne == 54 || fTwo == 54))){
      diag = "depression";
      medList = Dialog.medsDepression;
    }
    else if(((fOne == 17 || fTwo == 17) && (fOne == 57 || fTwo == 57)) || ((fOne == 17 || fTwo == 17) && (fOne == 31 || fTwo == 31)) || (fOne == 31 || fTwo == 31)){
      diag = "coronary heart disease";
      medList = Dialog.medsHeart;
    }
    else if(((fOne == 15 || fTwo == 15) && (fOne == 9 || fTwo == 9)) || ((fOne == 46 || fTwo == 46) && (fOne == 56 || fTwo == 56)) || (fOne == 15 || fTwo == 15)) {
      diag = "cold";
      medList = Dialog.medsCold;
    }
    else if(((fOne == 101 || fTwo == 101) && (fOne == 9 || fTwo == 9))){
      diag = "sick headache";
      medList = Dialog.medsHead;
    }
    else if((fOne == 44 || fTwo == 44) && (fOne == 101 || fTwo == 101)){
      diag = "food poisoning";
      medList = Dialog.medsFood;
    }
    else if(((fOne == 10 || fTwo == 10) && (fOne == 122 || fTwo == 122)) || (fOne == 17 || fTwo == 17)){
      diag = "reflux disease";
      medList = Dialog.medsReflux;
    }
    else if(((fOne == 13 || fTwo == 13) && (fOne == 87 || fTwo == 87)) || (fOne == 87 || fTwo == 87)){
      diag = "inflammation of the nose and throat";
      medList = Dialog.medsInflam;
    }
    else if((fOne == 104 || fTwo == 104) && (fOne == 10 || fTwo == 10)){
      diag = "kidney stones";
      medList = Dialog.medsKidStn;
    }
    else if(((fOne == 28 || fTwo == 28) && (fOne == 95 || fTwo == 95)) || (fOne == 14 || fTwo == 14)){
      diag = "flu";
      medList = Dialog.medsFlu;
    }
    else if(((fOne == 13 || fTwo == 13) && (fOne == 101 || fTwo == 101))){
      diag = "kissing disease";
      medList = Dialog.medsMono;
    }
    else if (fOne == 104 || fTwo == 104){
      diag = "slipped disc";
      medList = Dialog.medsDisc;
    }
    else if (fOne == 238 || fTwo == 238){
      diag = "excessive feeling of fear";
      medList = Dialog.medsFear; 
    }
    else if (fOne == 10 || fTwo == 10){
      diag = "bloated belly";
      medList = Dialog.medsFear;
    }
    else if (fOne == 9 || fTwo == 9){
      diag = "headache";
      medList = Dialog.medsAche;
    }
    else if(idSymptoms.length > 4){
      diag = "You seem really sick, maybe it's something serious";
      medList = Dialog.medsCancer;
    }
    // Get request using idSymptoms[0] and idSymptoms[1] for diagnosis.
    // Then GET diagnosis Issue["Name"] 
    // request('https://sandbox-healthservice.priaid.ch/diagnosis?symptoms=[\"13\"]&gender=male&year_of_birth=1988&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImRvbmFsZGtvbzcyQGdtYWlsLmNvbSIsInJvbGUiOiJVc2VyIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvc2lkIjoiMTE4OCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvdmVyc2lvbiI6IjIwMCIsImh0dHA6Ly9leGFtcGxlLm9yZy9jbGFpbXMvbGltaXQiOiI5OTk5OTk5OTkiLCJodHRwOi8vZXhhbXBsZS5vcmcvY2xhaW1zL21lbWJlcnNoaXAiOiJQcmVtaXVtIiwiaHR0cDovL2V4YW1wbGUub3JnL2NsYWltcy9sYW5ndWFnZSI6ImVuLWdiIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9leHBpcmF0aW9uIjoiMjA5OS0xMi0zMSIsImh0dHA6Ly9leGFtcGxlLm9yZy9jbGFpbXMvbWVtYmVyc2hpcHN0YXJ0IjoiMjAxNy0wMi0xOCIsImlzcyI6Imh0dHBzOi8vc2FuZGJveC1hdXRoc2VydmljZS5wcmlhaWQuY2giLCJhdWQiOiJodHRwczovL2hlYWx0aHNlcnZpY2UucHJpYWlkLmNoIiwiZXhwIjoxNDg3NDU2MDMyLCJuYmYiOjE0ODc0NDg4MzJ9.7Z1BSjILmw-kn4EROR4pdcTaEShdgVXvcBJ3PCY2JxI&language=en-gb&format=json', function (error, response, body) {
    //   if (!error && response.statusCode == 200) {
    //     console.log(body) // Show the HTML for the Google homepage. 
    //   }
    // })

    session.send("Got it, so you're experiencing " +symptoms+".");
    session.send(Dialog.guessDiagnosis + diag);
    session.beginDialog('/cards');
    builder.Prompts.choice(session, Dialog.bestMeds + medList, ["Yes please!", "No thanks!"]);
    next();
  },
  function(session,results){
    if(results.response.entity == "Yes please!"){
      builder.Prompts.text(session, "What is the closest address to you? (Try to be as detailed as possible)");
    }
    else
      session.send(Dialog.endMessage);
  },
  
  function(session, results){
    var address = results.response.replace(/ /g, "+");
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
    //session.send(Dialog.findPharms + url);
      msg = new builder.Message(session)
        .textFormat(builder.TextFormat.xml)
        .attachments([
            new builder.HeroCard(session)
                .title("Hero Card")
                .subtitle("Pharmacies Nearby")
                .text(address)
                .images([
                    builder.CardImage.create(session, "data:image/jpeg;base64,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")
                ])
                .tap(builder.CardAction.openUrl(session, url))
        ]);
    session.send(Dialog.endMessage);
  }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.text(session, 'What year were you born?');
    },
    function (session, results) {
        session.userData.birthYear = results.response;
        builder.Prompts.choice(session, 'Select your gender', ["Male", "Female", "Other"]);
    },
    function (session, results) {
        session.userData.gender = results.response.entity;
        session.beginDialog('/none');
    }
]);

bot.dialog('/cards', [
    function (session) {
        /*customsearch.cse.list({ cx: CX, q: SEARCH, auth: API_KEY }, function (err, resp) {
          if (err) {
            return console.log('An error occured', err);
          }
          // Got the response from custom search
          console.log('Result: ' + resp.searchInformation.formattedTotalResults);
          if (resp.items && resp.items.length > 0) {
            console.log('First result name is ' + resp.items[0].title);
          }
        });*/

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    .title(diag)
                    //.subtitle(diag)
                    .text(subtext)
                    .images([
                        builder.CardImage.create(session, "https://goo.gl/pBQLeH")
                    ])
                    .tap(builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/" + diag))
            ]);
        session.endDialog(msg);
    }
]);

intents.onDefault(builder.DialogAction.send("I'm sorry. I didn't understand. You probably have cancer.."));

/*
bot.dialog('/', [
  function (session, args, next) {
      if (!session.userData.zipCode) {
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
      session.send(Dialog.findPharms)
    }
    session.send(Dialog.endMessage);
  }
]);
*/

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

