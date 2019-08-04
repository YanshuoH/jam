import {tf} from '@magenta/music'

// Construct spherical linear interpolation tensor.
export function slerp(z1, z2, n) {
  const norm1 = tf.norm(z1)
  const norm2 = tf.norm(z2)
  const omega = tf.acos(tf.matMul(tf.div(z1, norm1),
    tf.div(z2, norm2),
    false, true))
  const sinOmega = tf.sin(omega)
  const t1 = tf.linspace(1, 0, n)
  const t2 = tf.linspace(0, 1, n)
  const alpha1 = tf.div(tf.sin(tf.mul(t1, omega)), sinOmega).as2D(n, 1)
  const alpha2 = tf.div(tf.sin(tf.mul(t2, omega)), sinOmega).as2D(n, 1)
  const z = tf.add(tf.mul(alpha1, z1), tf.mul(alpha2, z2))
  return z
}