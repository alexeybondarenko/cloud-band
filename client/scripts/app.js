(function() {
  'use strict';

  console.log('App');
  var context;

  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();

  var client = new BinaryClient('ws://localhost:9001');
  var MidiStream;

  client.on('open', function() {
    // for the sake of this example let's put the stream in the window
    MidiStream = client.createStream();
    MidiStream.on('data', handleAudioReceive);
    MidiStream.on('end', handleAudioFinish);
  });

  function playSound(buffer) {
    var source = context.createBufferSource(); // creates a sound source
    source.buffer = buffer;                    // tell the source which sound to play
    source.connect(context.destination);       // connect the source to the context's destination (the speakers)
    source.start(0);                           // play the source now
  }

  function handleAudioReceive(data) {
    console.log('receive audio', data);
    context.decodeAudioData(data, playSound);
  }
  function handleAudioFinish(data) {
    console.log('finish', data);
  }

  var m = null; // m = MIDIAccess object for you to make calls on
  navigator.requestMIDIAccess().then( onsuccesscallback, onerrorcallback );


  function myMIDIMessagehandler(e) {
    if (e.data[2] === 0) return;
    MidiStream.write(e.data);
  }

  function onsuccesscallback( access ) {
    m = access;

    // Things you can do with the MIDIAccess object:
    var inputs = m.inputs; // inputs = MIDIInputMaps, you can retrieve the inputs with iterators

    var iteratorInputs = inputs.values() // returns an iterator that loops over all inputs
    var input = iteratorInputs.next().value // get the first input

    input.onmidimessage = myMIDIMessagehandler; // onmidimessage( event ), event.data & event.receivedTime are populated
  };

  function onerrorcallback( err ) {
    console.log( "uh-oh! Something went wrong! Error code: " + err.code );
  }
})();
