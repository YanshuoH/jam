// Instantiate the model by specifying the desired checkpoint.
const model = new mm.MusicVAE(
  'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/trio_4bar');

const player = new mm.Player();

let stopSignal = false;
let count = 0;
let tempo = 80;

const sampleAndPlayForever = () => {
  player.stop();
  count += 1;
  document.getElementById('count').innerHTML = `${count} trios`;
  return model.sample(1)
    .then((samples) => player.start(samples[0], tempo))
    .then(stopSignal ? undefined : sampleAndPlayForever)
};

const changeTempo = (delta) => {
  tempo = Math.max(Math.min(tempo + delta * 10, 120), 40);
  const tempoCounter = document.getElementById('tempo');
  tempoCounter.setAttribute('scrollamount', tempo / 10);
  tempoCounter.innerHTML = `${tempo} bpm`;
}

const start = () =>  {
  mm.Player.tone.context.resume();  // Required on mobile.
  document.getElementById('start').style.display = "none";
  changeTempo(0);
  stopSignal = false;
  sampleAndPlayForever();
};

const stop = () => {
  stopSignal = true;
  player.stop();
  document.getElementById('wait').style.display = "none";
  document.getElementById('start').style.display = "block";
};

model.initialize().then(stop);