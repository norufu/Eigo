<template>
  <div>
    <button v-on:click="questionUpdate()">update qlist</button>
  </div>
</template>

<script>
import axios from 'axios'
// import fs from 'file-system'
export default {
  name: 'Updateqs',
  data () {
    return {

    }
  },
  methods: {
    async questionUpdate () {
      // var text = fs.readFileSync("../static/qlist.txt");
      // var textByLine = text.split("-")
      // // General Code

      // var qlist = read("qlist.txt").split("-");
      // alert(qlist)
      // send the data here
      axios.get('http://localhost:3000/qdatarewrite')
        .then((response) => {
          alert(response)
        })
        .catch(err => {
          alert(err)
        })
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
