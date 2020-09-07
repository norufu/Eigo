<template>
      <div class = "answerContainer" v-if="!finished">
      <div class = "row justify-content-md-center">
        <div class = "col-2"><b-button variant="light" v-on:click="answer(1)">👎</b-button></div>
        <div class = "col-2"><b-button variant="light" v-on:click="answer(2)">👌</b-button></div>
        <div class = "col-2"><b-button variant="light" v-on:click="answer(3)">👍</b-button></div>
      </div>
      <div class = "row justify-content-md-center">
        <div class = "col-2"><b-button variant="light" v-on:click="answer(1)">Notes</b-button></div>
        <div class = "col-2"><b-button variant="light" v-on:click="answer(2)">Last Question</b-button></div>
      </div>
    </div>
</template>

<script>
export default {
  name: 'AnswerButton',
  props: [ 'type' ]
}
</script>

<style scoped>
  button {
    margin:15px;
    width: 200px;
    background: #DCDCDD;
    border: 2px;
    border-color: #4CAF50;
    color: green;
    box-shadow: 1.5px 2px  #a5a5a7;
  }
  .answerContainer {
    background: #AFC2D5
  }
</style>
