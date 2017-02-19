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

var diag = "Cancer";
var subtext = "Cancer is a group of diseases involving abnormal cell growth with the potential to invade or..."
var address ="";
var imageurl ="";
var url ="";
var cardcheck = 1;
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
  function(session, results){
    session.sendTyping();
    var symptoms = results.response.toLowerCase().split(",");
    var idSymptoms = [];
    diag = "Cancer";

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
      diag = "You seem really sick, maybe it's something serious. Try ";
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
    imageurl = "https://goo.gl/pBQLeH";
    url = "https://en.wikipedia.org/wiki/" + diag;
    session.beginDialog('/cards');
    session.send("testing");
    builder.Prompts.choice(session, Dialog.bestMeds + medList + Dialog.seeDoctor, ["Yes please!", "No thanks!"]);
  },
  function(session,results){
    if(results.response.entity == "Yes please!"){
      builder.Prompts.text(session, "What is the closest address to you? (Try to be as detailed as possible)");
    }
    else
      session.send(Dialog.endMessage);
  },
  
  function(session, results){
    address = results.response.replace(/ /g, "+");
    imageurl = "https://goo.gl/aoWyEz";
    url = "https://www.google.com/search?q=pharmacies+near+" + address;
    diag = "Nearby Pharmacies";
    subtext = address;
    session.beginDialog('/cards');
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
                        builder.CardImage.create(session, imageurl)
                    ])
                    .tap(builder.CardAction.openUrl(session, url))
            ]);
        session.endDialog(msg);
        session.endDialog();
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

