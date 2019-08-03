<template>
    <div class="align-center">
        <h1>
            Trio4bar
        </h1>
        <div class="spacer"></div>
        <div v-if="!initialized">
            <div class="fa-5x">
                <i class="fas fa-sync fa-spin"></i>
            </div>
        </div>

        <div v-if="initialized">
            <div class="fa-5x">
                <a v-if="!playing" v-on:click="start"><i class="fas fa-play-circle"></i></a>
                <a v-if="playing" v-on:click="stop"><i class="fas fa-stop-circle"></i></a>
            </div>
        </div>
    </div>
</template>

<style>
    .align-center {
        text-align: center;
    }
    .spacer {
        padding: 30px;
    }
</style>

<script>
  import {MusicVAE, Player} from '@magenta/music'

  const player = new Player()
  const model = new MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/trio_4bar')

  export default {
    name: 'Trios4bar',
    created() {
      model
        .initialize()
        .then(() => {
          console.log("checkpoint initialized")
          this.initialized = true
        })
        .then(() => model.sample(1))
        .then(samples => {
          this.sample = samples[0]
        })
    },
    methods: {
      start() {
        player.resumeContext()
        player.start(this.sample)
        this.playing = true
      },
      stop() {
        player.stop()
        this.playing = false
      }
    },
    data() {
      return {
        initialized: false,
        playing: false,
        sample: null,
      }
    }
  }
</script>