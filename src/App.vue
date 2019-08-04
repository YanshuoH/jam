<template>
    <div id="app"
         :class="[{'collapsed' : collapsed}]">
        <div class="app">
            <div class="container">

                <router-view :key="$route.path"/>
            </div>

            <sidebar-menu
                    :menu="menu"
                    :collapsed="collapsed"
                    @collapse="onCollapse"
            />
        </div>
    </div>
</template>

<style>
    body,
    html {
        margin: 0;
        padding: 0;
    }

    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
        margin-top: 60px;

    }

    .app {
        padding: 50px;
    }

    #app {
        padding-left: 350px;
    }

    #app.collapsed {
        padding-left: 50px;
    }

    .container {
        max-width: 600px;
    }

</style>

<script>
  import {config} from '@/checkpoints/config'

  export default {
    name: 'App',
    methods: {
      onCollapse: function (collapsed) {
        this.collapsed = collapsed
      },
    },
    data() {
      let playgroundMenuItems = []
      for (let i=0;i<config.length;i++) {
        let c = config[i]
        playgroundMenuItems.push({
          href: `/play/${c.name}`,
          title: c.name,
        })
      }

      return {
        menu: [
          {
            header: true,
            title: 'Jam',
          },
          {
            href: '/',
            title: "Home",
          },
          {
            title: 'Playground',
            child: playgroundMenuItems,
          },
          {
            title: 'Interpolate',
            child: [
              {
                href: '/interpolate/multitrack-chords',
                title: 'MultitrackChords',
              },
              {
                href: '/interpolate/sample-with-chords',
                title: 'SampleWithChords',
              },
              {
                href: '/interpolate/style-transition',
                title: 'StyleTransition',
              },
              {
                href: '/interpolate/learn-style-with-chord',
                title: 'LearnStyleWithChord',
              },
            ]
          }
        ],
        collapsed: false,
      }
    }
  }
</script>
