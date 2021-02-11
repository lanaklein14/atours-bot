const http = require('http');
http.createServer(function (req, res) {
  res.write("online");
  res.end();
}).listen(8080);

require('dotenv').config();
const AToursBot = require('./atoursbot.js');

// 'guildId/channelId' of the discord channel for logging
const loggerId = '807729013396471879/809281891512614932';

const aToursBot = new AToursBot(loggerId);

//Mana
aToursBot.addRule(
    '807729013396471879/807732845761265714',

    [{
        id: '807729013396471879/809112846003732560',
        mentionIds: ['809123745209909250'],
    }]
);

//Gaia
aToursBot.addRule(
    '807729013396471879/807733736270594050',
    [{
        id: '807729013396471879/809112790798565397',
        mentionIds: ['809125167754117130'],
    }]
);

//Elemental
aToursBot.addRule(
    '807729013396471879/807734958050770955',
    [{
        id: '807729013396471879/809112741771739197',
        mentionIds: ['809125177060884551'],
    }]
);

aToursBot.login();
