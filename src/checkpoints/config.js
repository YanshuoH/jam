import musicVaeConfig from '@/checkpoints/music_vae_config'

const l = window.location
const checkpointBaseUrl = `${l.protocol}//${l.host}/models/checkpoints/music_vae/`

for (let i=0;i<musicVaeConfig.length;i++) {
  let c = musicVaeConfig[i]
  c.endpoint = `${checkpointBaseUrl}/${c.checkpoint}`
}

export const search = (name) => {
  for (let i=0;i<musicVaeConfig.length;i++) {
    if (musicVaeConfig[i].name === name) {
      return musicVaeConfig[i]
    }
  }

  return null
}

export const config = musicVaeConfig
