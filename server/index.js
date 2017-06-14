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

function playTone(tone, stream) {
  if (tone > 61 || tone < 1) {
    console.log('undefined tone', tone);
    return;
  }
  const file = fs.createReadStream(path.resolve(__dirname, 'wav', `${tone}.wav`));
  file.pipe(stream);
  file.on('end', () => {
    file.unpipe(stream);
  });

  return file;
}

socket.on('connection', function(client) {
  client.on('stream', function(stream, meta) {
    const files = [];
    stream.on('data', function (data) {
      const type = data.readInt8(0);
      const tone = data.readInt8(1);
      const pressure = data.readInt8(2);
      files.push(playTone(tone, stream));
    });

    stream.on('end', () => {
      files.forEach(file => file.end());
    });
  });
});

process.setMaxListeners(0);

module.exports = app;
