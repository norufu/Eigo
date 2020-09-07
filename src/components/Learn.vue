<template>
  <div>
    <div id = "learning" v-if="learning">
      <h1>{{questions[questionIndex][0]}}</h1>
      <button v-on:click="answer(2)">- ></button>
    </div>
    <div id = "testing" v-if="testing">
      <h1>{{questions[questionIndex][0]}}</h1>
      <button v-on:click="answer(1)">👎</button>
      <button v-on:click="answer(2)">👍</button>
    </div>
    <div v-if="finished">
      <h1>Finished</h1>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { StudyService } from '../services/StudyService.js'
export default {
  name: 'Learn',
  props: {
    msg: {
      type: String
    }
  },
  data () {
    return {
      questions: [], // array of arrays, 0 = question, 1 = file, 2 = userdata
      learnedList: [],
      questionIndex: 0,
      startTest: false,
      learning: true,
      testing: false,
      finished: false
    }
  },
  created () {
    // alert(localStorage.getItem('User'))
    console.log(localStorage.getItem('jwt'))
    axios.get('http://localhost:3000/learn', {
      params: {
        token: localStorage.getItem('jwt')
      }
    })
      .then((response) => {
        for (let i = 0; i < response.data.length; i++) {
          this.questions.push([response.data[i].question, response.data[i].fileName, response.data[i].userQData])
        }
        this.questionIndex = 0
        this.playSound()
      })
      .catch(err => {
        alert(err)
      })
    window.addEventListener('keydown', (e) => {
      if (e.key === '1') {
        this.answer(1)
      } else if (e.key === '2') {
        this.answer(2)
      // } else if (e.key === '3') {
      //   this.answer(3)
      // } else if (e.key === '4') {
      //   this.answer(4)
      } else if (e.key === 'r') {
        this.playSound()
      }
    })
  },

  methods: {
    answer (keyPressed) {
      if (this.learning) {
        if (this.questionIndex < this.questions.length - 1) {
          this.questionIndex += 1 // move to next question if more remain
          this.playSound()
        } else {
          this.testMode()
        }
      } else if (this.testing) {
        if (keyPressed === 2) {
          this.questions[0][2].learned = true // take index 0 (the question) and set it to learnt
          this.questions[0][2].srsval = 0
          this.learnedList.push((this.questions.shift())[2].num) // put the question number in a "finished" array
          if (this.questionIndex < this.questions.length) {
            this.playSound()
          } else { // finish testing, move to next set if available or quit
            this.finished = true
            this.testing = false
            // SEND THE UPDATED DATA TO THE SERVER
            console.log('LEARNED' + this.learnedList)
            axios.post('http://localhost:3000/learn', {
              token: localStorage.getItem('jwt'),
              updateQuestions: this.learnedList
            })
              .then((response) => {
                console.log(response)
              })
              .catch(err => {
                console.log(err)
              })
          }
        } else { // put answer question back in
          this.questions.push(this.questions.shift())
          this.playSound()
        }
      }
    },
    async playSound () { // play curq
      this.filePath = '../static/audio/' + this.questions[this.questionIndex][1]
      if (this.filePath) {
        var audio = new Audio(this.filePath)
        try {
          await audio.play()
        } catch (e) {
          console.error(e.message)
        }
      }
    },
    testMode () { // randomize questions order, change div testing div to visible
      this.questions = StudyService.shuffle(this.questions)
      // change to testing mode, reset index
      this.learning = false
      this.testing = true
      this.questionIndex = 0
      this.playSound()
    }
  }
}

// function shuffle (array) { // Need to change so the last learnt item won't be first in the review
//   var currentIndex = array.length
//   var temporaryValue
//   var randomIndex
//   // While there remain elements to shuffle...
//   while (currentIndex !== 0) {
//     // Pick a remaining element...
//     randomIndex = Math.floor(Math.random() * currentIndex)
//     currentIndex -= 1
//     // And swap it with the current element.
//     temporaryValue = array[currentIndex]
//     array[currentIndex] = array[randomIndex]
//     array[randomIndex] = temporaryValue
//   }

//   return array
// }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .containerInput {
    display:flex;
    /* flex: 0 0 50%; */
    width:20%;
    margin-left:40%;
    justify-content: center;
    padding: 10px;
    flex-flow: column-reverse;
  }
  /* .txtarea {
    padding:15px;
  }
  .playbtn{
    padding:15px;
  } */
  .containerButtons {
    display:flex;
    justify-content: center;
    padding: 10px;
  }
  .containerOutput {
    display:flex;
    justify-content: center;
    padding: 10px;
  }
  button {
    margin:15px;
    width: 200px;
  }
  h1 {
    margin:15px;
  }
</style>
