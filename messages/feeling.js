var builder = require('botbuilder');
var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);
const Dialog = require('./dialog.js');


bot.dialog('/',[
  function(session){
    builder.Prompts.choice(session, Dialog.entryMessage, ["Good", "Sick"]);
  },
  function(session, results){
    session.userData.feeling = results.response.entity;
    session.beginDialog('/symptoms');
  }
]);

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
]);