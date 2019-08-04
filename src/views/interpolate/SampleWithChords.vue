<template>
    <div>
        <InterpolateSampleWithChords/>
    </div>
</template>

<script>
  import SampleWithChords from '@/components/interpolate/SampleWithChords.vue'

  export default {
    name: 'SampleWithChords',
    components: {
      InterpolateSampleWithChords: SampleWithChords
    }
  }
</script>
