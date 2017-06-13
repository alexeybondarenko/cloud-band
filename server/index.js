const Express = require('express');
const path = require('path');
const ejs = require('ejs');
const wav = require('wav');
const fs = require('fs');
const binaryServer = require('binaryjs').BinaryServer;

const config = require('./config');

const app = new Express();

app.set('PORT', config.PORT);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/scripts', Express.static(path.join(__dirname, '../client/scripts')));
app.use('/node_modules', Express.static(path.join(__dirname, '../node_modules')));

const waves = {
  48: 'a1',
  49: 'a1s',
  50: 'b1',
  51: 'c1',
  52: 'c1s',
  53: 'c2',
  54: 'd1',
  55: 'd1s',
  56: 'e1',
  57: 'f1',
  58: 'f1s',
  59: 'g1',
  60: 'g1s',
};

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(app.get('PORT'), (err) => {
  if (err) {
    console.log('Start server error', err.message, err.stack);
    throw err;
  }

  console.log(`Server is listening at http://localhost:${app.get('PORT')}`);
})

var socket = binaryServer({port: 9001});

socket.on('connection', function(client) {
  client.on('stream', function(stream, meta) {
    stream.on('data', function (data) {
      const tone = data.readInt8(1);
      const pressure = data.readInt8(2);
      if (!waves[tone]) {
        console.log('undefined tone', tone);
        return;
      }
      const file = fs.createReadStream(path.resolve(__dirname, 'wav', `${waves[tone]}.wav`));
      file.pipe(stream);
    });
  });
});

module.exports = app;
