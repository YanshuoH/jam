<template>
    <div>
        <InterpolateStyleTransition/>
    </div>
</template>

<script>
  import StyleTransition from '@/components/interpolate/StyleTransition.vue'

  export default {
    name: 'StyleTransition',
    components: {
      InterpolateStyleTransition: StyleTransition
    }
  }
</script>
