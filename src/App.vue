<template>
  <div id="app">
    <Navbar class = "navbar-custom"/>
    <router-view/>
  </div>
</template>

<script>
import Navbar from './components/Nav.vue'

export default {
  name: 'App',
  components: {
    Navbar
  }
}
</script>

<style>
  html, body {
    background-color: #ebebeb;
  }
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }
  button {
    margin:15px;
    width: 200px;
    border-radius: 0%;
    color: #636363;
    background: #DCDCDD;
    border: 2px;
    border-color: #4CAF50;
    box-shadow: 1.5px 2px  #a5a5a7;
  }
</style>
