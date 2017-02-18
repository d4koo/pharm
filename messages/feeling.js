var builder = require('botbuilder');
var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);
const Dialog = require('./dialog.js');

var feeling;

bot.dialog('/',[
  function(session, next){
    builder.Prompts.text(session, Dialog.entryMessage);
  },
  function(session, results){
    feeling = results.response;
    session.beginDialog('/symptoms');
  }
]);

bot.dialog('/symptoms',[
  function(session, args, next){
    if(feeling == 'sick'){

    }
    else{
      session.send(Dialog.notSick);
      session.endDialog();
    }
  }

]);