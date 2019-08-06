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

  for (let i = 0; i < seqs.length; i++) {
    const seq = seqs[i]

    console.log(`encoding tensor %d/%d`, i + 1, seqs.length)
    const z = await model.encode([seq], undefined)
    const zarr = await z.data()
    z.dispose()

    const zt = tf.tensor2d(zarr, [1, Z_DIM])
    tensors.push({zt, i})
  }

  let resultSeqs = []
  // 1 -> 2, 2 -> 3, 3 -> 4, 4 -> 5 ...
  const t1 = tensors[0].zt
  const t2 = tensors[1].zt
  const t3 = tensors[2].zt
  const t4 = tensors[3].zt
  const t5 = tensors[4].zt

  const inter1 = slerp(t1, t2, 1)
  const inter2 = slerp(t2, t3, 1)
  const inter3 = slerp(t3, t4, 1)
  const inter4 = slerp(t4, t5, 1)
  //
  let ss1 = await model.decode(inter1, undefined, undefined, STEPS_PER_QUARTER)
  let ss2 = await model.decode(inter2, undefined, undefined, STEPS_PER_QUARTER)
  let ss3 = await model.decode(inter3, undefined, undefined, STEPS_PER_QUARTER)
  let ss4 = await model.decode(inter4, undefined, undefined, STEPS_PER_QUARTER)

  resultSeqs.push(...ss1)
  resultSeqs.push(...ss2)
  resultSeqs.push(...ss3)
  resultSeqs.push(...ss4)
  // // 1 -> 3, 2 -> 4, then flush
  // for (let i = 0; i < tensors.length; i++) {
  //   if (i === length - 3) {
  //     break
  //   }
  //   const t1 = tensors[i].zt
  //   const t2 = tensors[i + 2].zt
  //
  //   const inter = slerp(t1, t2, 2)
  //   const reconstruct = await model.decode(inter, undefined, undefined, STEPS_PER_QUARTER)
  //   resultSeqs.push({
  //     seq: reconstruct[0],
  //     i: i,
  //   }, {
  //     seq: reconstruct[1],
  //     i: i + 2
  //   })
  // }

  // sort
  // resultSeqs.sort((a, b) => {
  //   return a.i - b.i
  // })
  // let ss = []
  // for (let i=0;i<resultSeqs.length;i++) {
  //   ss.push(resultSeqs[i].seq)
  // }

  const seq = concatenateSequences(resultSeqs)
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