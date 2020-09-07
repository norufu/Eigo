/* eslint-disable */

//functions needed for the study/learn components

const StudyService = {
  shuffle(array) {
    // Need to change so the last learnt item won't be first in the review always
    var currentIndex = array.length;
    var temporaryValue;
    var randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  },

  adjustSRS(question, num) {
    console.log("adjusting srs");
    // if(question.userQData.interval == 0) {
    //     question.userQData.interval += 1
    // }
    switch (
      num // switch to change the srs values
    ) {
      case 1: // again
        question.userQData.interval = 0;
        question.userQData.wrongCount += 1;
        break;
      case 2: // hard
        if (question.userQData.interval == 0) {
          question.userQData.interval = 1;
          question.userQData.srsval += 2;
          question.userQData.correctCount += 1;
        } else {
          question.userQData.interval = Math.ceil(
            question.userQData.interval * 1.2
          );
          question.userQData.srsval += 1;
          question.userQData.correctCount += 1;
        }
        break;
      case 3: // good
        if (question.userQData.interval == 0) {
          question.userQData.interval = 1;
          question.userQData.srsval += 2;
          question.userQData.correctCount += 1;
        } else {
          question.userQData.interval = Math.ceil(
            question.userQData.interval * 2
          );
          question.userQData.srsval += 2;
          question.userQData.correctCount += 1;
        }
        break;
      case 4: // easy
        if (question.userQData.interval == 0) {
          question.userQData.interval = 1;
          question.userQData.srsval += 2;
          question.userQData.correctCount += 1;
        } else {
          question.userQData.interval = Math.ceil(
            question.userQData.interval * 3
          );
          question.userQData.srsval += 3;
          question.userQData.correctCount += 1;
        }
        break;
      default:
        break;
    }
  }
};

export { StudyService };
