<template>
  <div class="board">
      <div class = "mainButtons">
        <button class="learnBtn" @click="()=>$router.push('Learn')">
          Learn {{learnCount}}
        </button>
        <button class="studyBtn" @click="()=>$router.push('Study')">
          Study {{reviewCount}}
        </button>
      </div>

      <div class = "completed">
        <!-- 31.4 in dasharray is 100% of the circle. eg 7.85 would be 1/4, making a 1/4 slice -->
        <div class = "learnedPie">
          <svg  height="200" width="200" viewBox="0 0 20 20">
            <circle r="10" cx="10" cy="10" fill="gray" />
            <circle v-for="slice in pieVals" :key ="slice.amount" r="5" cx="10" cy="10" fill="transparent"
              v-bind:stroke="slice.color"
              stroke-width="10"
              v-bind:stroke-dasharray="slice.dashArray"
              v-bind:stroke-dashoffset="sliceOffset"
              transform="rotate(-90) translate(-20)"
            >{{sliceOffset -= slice.amount}}</circle>
          </svg>
        </div>
        <div class = "learnedCounts">
          <span>
            <svg  height="10" width="10" viewBox="0 0 20 20">
              <circle r="10" cx="10" cy="10" fill="#f80caa" />
            </svg>
            <p>Learned: {{totalLearned}}</p>
          </span>
          <span>
            <svg  height="10" width="10" viewBox="0 0 20 20">
              <circle r="10" cx="10" cy="10" fill="#378cd1" />
            </svg>
             <p>Unlearned: {{totalUnlearned}}</p>
          </span>
        </div>
      </div>

      <div class = "reviews">
        <GChart class = "barChart"
          type="BarChart"
          :data="nextWeek"
          :options="chartOptions"
        />
      </div>

  </div>
</template>

<script>
import { GChart } from 'vue-google-charts'

import axios from 'axios'
export default {
  components: {
    GChart
  },
  data () {
    return {
      username: localStorage.getItem('user'),
      learnCount: 0,
      reviewCount: 0,
      totalLearned: 0,
      totalUnlearned: 0,
      learnedPieVal: 0,
      learnedPieString: '',
      unlearnedPieVal: 0,
      pieVals: [],
      nextWeek: []
    }
  },
  created () {
    this.sliceOffset = 0 // non reactive offset for the pie slices
    this.chartOptions = {
      chartArea: {width: '50%', height: '80%'},
      bars: 'horizontal',
      colors: ['#59c274'],
      backgroundColor: '#ebebeb',
      hAxis: {
        columnType: 'number',
        gridlines: {count: '0'},
        format: '0',
        // baseline: '0',
        // minValue: '0',
        maxValue: '1'
      },
      vAxis: {
        lables: 'true'
      },
      legend: {
        position: 'none',
        labeledValueText: 'both'
      }
    }
    axios.get('http://localhost:3000/loadUserBoard', { // reviewC: reviewCount, learnC: learnCount, learned: totalLearned, unlearned: totalUnlearned, weekReviews: weekReviews
      params: {
        token: localStorage.getItem('jwt')
      }
    })
      .then((response) => {
        console.log(response.data.learnC)
        this.learnCount = response.data.learnC
        this.reviewCount = response.data.reviewC
        this.totalLearned = response.data.learned
        this.totalUnlearned = response.data.unlearned
        this.nextWeek = response.data.weekReviews
        console.log(this.nextWeek)

        // calc the pie chart values, if I add more slices will need to send the component an array with all the numbers to make adding them to this array easier
        // what I should have : learned, unlearned, disabled, mature (if I add this)
        this.pieVals.push({dashArray: ((this.totalLearned / (this.totalLearned + this.totalUnlearned)) * 31.4) + ' 31.4', color: '#378cd1', amount: ((this.totalLearned / (this.totalLearned + this.totalUnlearned)) * 31.4)})
        this.pieVals.push({dashArray: ((this.totalUnlearned / (this.totalLearned + this.totalUnlearned)) * 31.4) + ' 31.4', color: '#f80caa', amount: ((this.totalUnlearned / (this.totalLearned + this.totalUnlearned)) * 31.4)})
      })
      .catch(err => {
        alert(err)
      })
  },
  methods: {
    logout (e) {
      console.log(localStorage.getItem('jwt'))
      e.preventDefault()
      this.$http.post('http://localhost:3000/logout', {
        token: localStorage.getItem('jwt')
      })
      localStorage.clear()
      this.$router.go('/login')
    },
    test (amount) {
      this.sliceOffset -= amount
      console.log('hi')
    }
  }
}
</script>

<style scoped>
  .board {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    height: 700px;
    margin-left: 20%;
    margin-right: 20%;
    margin-top: 2%;
  }
  button {
    width: 200px;
    height: 150px;
    font-size: 25px;
    color: black;
  }
  .mainButtons {
    height:40%;
    /* background-color: yellow */
  }
  .learnBtn {
    margin-top: 10%;
    background-color: #f80caa;
    box-shadow: 1.5px 3px #c00c84;

  }
  .studyBtn {
    margin-top: 10%;
    background-color: #43aaff;
    box-shadow: 1.5px 3px#378cd1;
  }
  .reviews {
    flex: 100%;
    width:500px;
    height: 500px;
    /* background-color: lightgreen */
  }
  .completed {
    height:1000px;
    flex: 1; /* consumes full height of first column; forces siblings to wrap */
    /* background-color: white; */
  }
  .learnedPie {
    padding-left: 10%;
    padding-top: 5%;
    float: left;
  }
  .learnedCounts {
    display: inline-block;
  }
  .barChart {
    height: 100%;
    width: 100%;
  }
</style>
