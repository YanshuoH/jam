<template>
    <div>
        <Item
                :name="vaeConfig.name"
                :endpoint="vaeConfig.endpoint"
                :description="vaeConfig.description"
        />
    </div>
</template>

<script>
  import Item from '@/components/playground/Item.vue'
  import {search} from '@/checkpoints/config'

  export default {
    name: 'PlaygroundItem',
    created() {
      this.vaeConfig = search(this.$route.params.vaename)
    },
    mounted() {
      this.vaeConfig = search(this.$route.params.vaename)
    },
    updated() {
      this.vaeConfig = search(this.$route.params.vaename)
    },
    components: {
      Item
    },
    data() {
      return {
        vaeConfig: null,
      }
    }
  }
</script>