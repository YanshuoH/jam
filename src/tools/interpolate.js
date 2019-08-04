import {MusicVAE, tf, sequences, NoteSequence} from '@magenta/music'
import {concatenateSequences} from '@/tools/sequences'
import {slerp} from '@/tools/slerp'

const Z_DIM = 256
const STEPS_PER_QUARTER = 24
const NUM_STEP = 1

/**
 *
 * @param model {MusicVAE}
 * @param seqs {NoteSequence[]}
 * @param chord {String}
 */
export async function interpolateSequences(model, seqs, chord) {
  let tensors = []

  seqs = seqs.slice(8, 16)
  for (let i = 0; i < seqs.length; i++) {
    const seq = seqs[i]

    const z = await model.encode([seq], undefined)
    const zarr = await z.data()
    z.dispose()

    const zt = tf.tensor2d(zarr, [1, Z_DIM])
    tensors.push({zt, i})
  }

  console.log(tensors)
  // 先试着搞 1->3, 2->4
  const t1 = tensors[0].zt
  const t2 = tensors[1].zt
  const t3 = tensors[2].zt
  const t4 = tensors[3].zt

  const t1Tot3 = slerp(t1, t4, 2)
  const t2Tot4 = slerp(t2, t4, 2)

  const t1Tot3Seq = await model.decode(t1Tot3, undefined, undefined, STEPS_PER_QUARTER)
  const t2Tot4Seq = await model.decode(t2Tot4, undefined, undefined, STEPS_PER_QUARTER)

  // console.log(t1Tot3Seq)

  let result = [...t1Tot3Seq, ...t2Tot4Seq]
  // let result = [...t1Tot3Seq]

  const seq = concatenateSequences(result)
  const mergedSeq = sequences.mergeInstruments(seq)
  let interpSeq = sequences.unquantizeSequence(mergedSeq)
  interpSeq.ticksPerQuarter = STEPS_PER_QUARTER

  return interpSeq

  // p
  // .then(z => {
  //   const zarr = z.dataSync()
  //   const zt = tf.tensor2d(zarr, [1, Z_DIM])
  //
  //   let chordProgress;
  //   if (chord !== undefined) {
  //     chordProgress = [chord]
  //   }
  //   return model.decode(zt, undefined, chordProgress, STEPS_PER_QUARTER)
  // })
  //   .then(seqs => {
  //     const seq = concatenateSequences(seqs)
  //     const mergedSeq = sequences.mergeInstruments(seq)
  //     let interpSeq = sequences.unquantizeSequence(mergedSeq)
  //     interpSeq.ticksPerQuarter = STEPS_PER_QUARTER
  //
  //     resolve(interpSeq)
  //   })
}