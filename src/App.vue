<template>
    <div id="app">
        <div class="container">

            <router-view/>
        </div>

        <sidebar-menu
                :menu="menu"
        />
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

        padding: 50px;
    }

    .container {
        max-width: 600px;
    }

</style>

<script>
  export default {
    name: 'App',
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
        ]
      }
    }
  }
</script>
