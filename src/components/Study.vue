<template>
  <div>
    <div class="questionContainer">
      <h1>{{currentQuestion.question}}</h1>
    </div>
    <div class="answerContainer" v-if="!finished">
      <div class="row justify-content-md-center">
        <div class="col-3"></div>
        <div class="col">
          <b-button variant="light" v-on:click="answer(1)">👎</b-button>
        </div>
        <div class="col">
          <b-button variant="light" v-on:click="answer(2)">👌</b-button>
        </div>
        <div class="col">
          <b-button variant="light" v-on:click="answer(3)">👍</b-button>
        </div>
        <div class="col-3"></div>
      </div>
      <div class="row justify-content-md-center">
        <div class="col">
          <b-button variant="light" v-on:click="answer(1)">Notes</b-button>
        </div>
        <div class="col">
          <b-button variant="light" v-on:click="answer(2)">Last Question</b-button>
        </div>
      </div>
    </div>
    <!-- <AnswerButton/> -->
    <div v-if="finished">
      <h1>Finished</h1>
    </div>
  </div>
</template>

<script>
import axios from "axios"; //  add replay sound, add notes, disable, and last question maybe
import { StudyService } from "../services/StudyService.js";
import AnswerButton from "./AnswerButton.vue";
export default {
  name: "Study",
  props: {
    msg: {
      type: String
    }
  },
  components: {
    AnswerButton
  },
  data() {
    return {
      questions: [],
      reviewed: [],
      currentQuestion: "",
      txtfield: "",
      finished: false
    };
  },
  created() {
    axios
      .get("http://localhost:3000/Study", {
        params: {
          token: localStorage.getItem("jwt")
        }
      })
      .then(response => {
        this.questions = response.data;
        if (this.questions.length < 1) {
          this.finished = true;
        } else {
          this.questions = StudyService.shuffle(this.questions);
          this.currentQuestion = this.questions[0];
          this.playSound();
        }
      })
      .catch(err => {
        alert(err);
      });

    window.addEventListener("keydown", e => {
      if (e.key === "1") {
        this.answer(1);
      } else if (e.key === "2") {
        this.answer(2);
      } else if (e.key === "3") {
        this.answer(3);
      } else if (e.key === "4") {
        this.answer(4);
      } else if (e.key === "r") {
        this.playSound();
      }
    });
  },

  methods: {
    answer(num) {
      StudyService.adjustSRS(this.currentQuestion, num); // adjust the srs values based on button clicked
      if (num === 1) {
        this.questions.push(this.questions.shift()); // move the wrong question to the back of the array (maybe change to middle somewhere based on length)
      }

      if (this.questions.length <= 1) {
        console.log(this.questions.length);
        this.finished = true;
        this.reviewed.push(this.questions.shift());
        this.sendUpdate();
      } else {
        this.reviewed.push(this.questions.shift());
        this.currentQuestion = this.questions[0];
        this.playSound();
      }
    },
    async playSound() {
      // play curq
      this.filePath = "../static/audio/" + this.currentQuestion.fileName;
      if (this.filePath) {
        var audio = new Audio(this.filePath);
        try {
          await audio.play();
        } catch (e) {
          console.error(e.message);
        }
      }
    },
    async sendUpdate() {
      // send question updates to server
      console.log("posted");
      console.log(this.reviewed);
      axios
        .post("http://localhost:3000/study", {
          token: localStorage.getItem("jwt"),
          reviewedQuestions: this.reviewed
        })
        .then(response => {
          console.log(response);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
html body {
  background-color: #525493;
}
.questionContainer {
  padding: 150px;
  background: #8be8cb;
}
.answerContainer {
  background: #afc2d5;
}

h1 {
  margin: 15px;
}
</style>
