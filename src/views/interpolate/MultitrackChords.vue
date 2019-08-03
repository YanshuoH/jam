<template>
    <div>
        <InterpolateMultitrackChords/>
    </div>
</template>

<script>
  import MultitrackChords from '@/components/interpolate/MultitrackChords.vue'

  export default {
    name: 'MultitrackChords',
    components: {
      InterpolateMultitrackChords: MultitrackChords
    }
  }
</script>
