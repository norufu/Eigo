<template>
  <div>
    <h1>Hello {{username}}</h1>
    <div>
      <label>Daily new words:</label>
      <input id = "dailyNew" type="number" min="0" max = "100" name="dailyNew" />
    </div>
    <div>
      <label>Your language: </label>
      <select id = "dictionaryDropdown">
          <option id = "japanese" value = "japanese">Japanese</option>
          <option id = "chinese" value = "chinese">Chinese</option>
        </select>
    </div>
    <button v-on:click="save()">Save</button>
  </div>
</template>

<script>
import axios from 'axios'
// import fs from 'file-system'
export default {
  name: 'Profile',
  data () {
    return {
      username: localStorage.getItem('user'),
      dictionary: '',
      dailyNew: 0
    }
  },
  methods: {
    save () {
      let newSettings = {dailyNew: document.getElementById('dailyNew').value, dictionary: document.getElementById('dictionaryDropdown').value}
      axios.post('http://localhost:3000/profile', {
        token: localStorage.getItem('jwt'),
        newSettings: newSettings
      })
    }
  },
  created () {
    axios.get('http://localhost:3000/profile', {
      params: {
        token: localStorage.getItem('jwt')
      }
    })
      .then((response) => {
        console.log(response.data)
        this.dictionary = response.data.dictionary
        document.getElementById(this.dictionary).selected = true
        this.dailyNew = response.data.dailyNew
        document.getElementById('dailyNew').value = this.dailyNew
      })
      .catch(err => {
        alert(err)
      })
  }
}
</script>

<style>
</style>
