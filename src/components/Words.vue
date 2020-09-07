<template>

  <div>
    <input id = "search" type="text" placeholder="Search..">
    <button v-on:click="search()">search</button>
    <table v-for="item in examples" :key ="item.question" id = "testTable" style="width:100%">
      <tr >
          <th>{{item.question}}</th>
          <th>
            <button v-on:click="playSound(item.filename)">▷</button>
          </th>
        </tr>
    </table>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Words',
  data () {
    return {
      examples: [],
      vfortest: [
        {message: 'yes'},
        {message: 'no'}
      ]
    }
  },
  methods: {
    search (word) {
      axios.get('http://localhost:3000/words', {
        params: {
          token: localStorage.getItem('jwt'),
          word: document.getElementById('search').value
        }
      })
        .then((response) => {
          // let table = document.getElementById('exampleTable')
          this.examples = response.data // 2d array, [x][0] = question text, [x][1] = filepath
        })
    },
    async playSound (fileName) {
      this.filePath = '../static/audio/' + fileName
      if (this.filePath) {
        var audio = new Audio(this.filePath)
        try {
          await audio.play()
        } catch (e) {
          console.error(e.message)
        }
      }
    }
  },
  created () {

  }
}
</script>

<style>

</style>
