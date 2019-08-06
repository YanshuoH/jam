<template>
    <div class="align-center">
        <h1>Sweet Child O' ...</h1>

        <div>
            Make a Guns'n'Roses like music clip
        </div>
        <div class="spacer"></div>

        <div v-if="!modelInitialized">
            <div class="fa-5x">
                <i class="fas fa-sync fa-spin"></i>
            </div>
        </div>

        <div class="visualizer-container" v-bind:class="{show: !sequenceInitializing}">
            <canvas id="canvas" ref="canvas"></canvas>
        </div>

        <div v-if="modelInitialized">
            <div class="upload" v-if="!sequenceInitializing">
                <label>File
                    <input type="file" id="file" ref="file" v-on:change="upload()" accept="audio/midi"/>
                </label>
            </div>

            <div class="range" v-if="file && !sequenceInitializing">
                <span>From</span>
                <input type="number" id="from" ref="from" v-model="from">
                <span>To</span>
                <input type="number" id="to" ref="to" v-model="to">
            </div>

            <div class="compute" v-if="file && !sequenceInitializing">
                <button v-on:click="startCompute()">Start Computing</button>
            </div>

            <div v-if="sequenceInitializing">
                <div class="fa-5x">
                    <i class="fas fa-sync fa-spin"></i>
                </div>
            </div>

            <div v-if="!sequenceInitializing">
                <div class="fa-5x" v-if="file != null">
                    <a v-if="!playing" v-on:click="start"><i class="fas fa-play-circle"></i></a>
                    <a v-if="playing" v-on:click="stop"><i class="fas fa-stop-circle"></i></a>
                </div>
            </div>


        </div>
    </div>
</template>

<style>
    .align-center {
        text-align: center
    }

    .spacer {
        padding: 30px
    }

    .show {
        display: block !important;
    }
    .visualizer-container {
        display: none;
        background: white;
        padding: 14px;
        overflow-x: auto;
        border: 3px solid black;
        margin-top: -3px;  /* so that the border doesn't overlap with the play buttons */
    }
</style>

<script>
  import {MusicVAE, tf, sequences, PianoRollCanvasVisualizer} from '@magenta/music'
  import {readMidiFileToBinaryString} from '@/tools/load_midi'
  import {concatenateSequences} from '@/tools/sequences'
  import {interpolateSequences} from '@/tools/interpolate'
  import {search} from "@/checkpoints/config";
  import {createSoundFontPlayer, humanize} from '@/tools/player'
  import {slerp} from '@/tools/slerp'

  const STEPS_PER_QUARTER = 24
  const DEFAULT_PIXEL_PER_TIME_STEP = 30

  let canvasVisualizer

  const player = createSoundFontPlayer({
    run: () => {
      // canvasVisualizer.redraw(note, true)
    },
    stop: () => {}
  })
  const endpoint = search('multitrack_fb256').endpoint
  const model = new MusicVAE(endpoint)

  export default {
    name: 'SweetChildOMine',
    created() {
      console.log('initializing model')
      model.initialize()
        .then(() => {
          this.modelInitialized = true
        })
    },
    methods: {
      moveCanvasCursor() {
        // to from
        let seqs = sequences.split(this.sequence, STEPS_PER_QUARTER*4)

        if (seqs.length -1 < this.from || seqs.length - 1 < this.to) {
          alert('from-to out or range')
        }
        let startNote = seqs[this.from].notes[0]
        let x = startNote.startTime * DEFAULT_PIXEL_PER_TIME_STEP
        this.$refs.canvas.parentElement.scrollLeft = x
      },
      startCompute() {
        this.sequenceInitializing = true
        console.log(this.from, this.to)
        this.moveCanvasCursor()

        let seqs = sequences.split(this.sequence, STEPS_PER_QUARTER*4)
        seqs = seqs.slice(this.from, this.to)
        console.log(seqs)

        interpolateSequences(model, seqs, undefined)
          .then(seq => {
            this.sample = seq
            this.sequenceInitializing = false
          })
      },
      upload() {
        let file = this.$refs.file.files[0]

        readMidiFileToBinaryString(file)
          .then(seq => {
            this.tempo = Number(seq.tempos[0].qpm.toFixed(0))
            console.log('read tempo = ', this.tempo)
            this.file = file
            this.sequence = seq
            // let click = Number((seq.totalQuantizedSteps / STEPS_PER_QUARTER).toFixed(0))
            // let bars = Number((click/4).toFixed(0))

            // let seqs = sequences.split(sequences.clone(seq), STEPS_PER_QUARTER*4)
            // console.log(seqs.length)

            // return interpolateSequences(model, seqs, undefined)
            canvasVisualizer = new PianoRollCanvasVisualizer(seq, this.$refs.canvas)
          })
          .catch(err => {
            alert(err)
            console.trace(err)
          })
      },
      start() {
        player.resumeContext()

        player.start(humanize(this.sample), this.tempo)
        this.playing = true
      },
      stop() {
        player.stop()
        this.playing = false
      }
    },
    data() {
      return {
        file: null,
        modelInitialized: false,
        sequenceInitializing: false,
        tempo: 120,
        playing: false,
        sequence: null,
        sample: null,
        from: 34,
        to: 39,
      }
    }
  }
</script>