<template>
    <div>
        <button v-on:click="start">start</button>
        <button v-on:click="stop">stop</button>
    </div>
</template>

<script>
  import {MusicVAE, Player} from '@magenta/music';

  const player = new Player();

  export default {
    name: 'Trios4bar',
    methods: {
      start: () => {
        const model = new MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/trio_4bar');
        model
          .initialize()
          .then(() => model.sample(1))
          .then(samples => {
            player.resumeContext();
            player.start(samples[0]);
          });
      },
      stop: () => {
        player.stop();
      }
    },
  }
</script>