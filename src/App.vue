<template>
    <div id="app"
         :class="[{'collapsed' : collapsed}]">
        <div class="app">
            <div class="container">

                <router-view/>
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
  export default {
    name: 'App',
    methods: {
      onCollapse: function(collapsed) {
        this.collapsed = collapsed
      },
    },
    data() {
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
            href: '/play',
            child: [
              {
                href: '/play/trio4bar',
                title: 'Trio4Bar',
              },
              {
                href: '/play/trio4bar',
                title: 'Trio4Bar',
              }
            ]
          },
        ],
        collapsed: false,
      }
    }
  }
</script>
