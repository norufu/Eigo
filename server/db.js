// https://stackoverflow.com/questions/52558619/mongodb-in-nodejs-class-structure/52560488
// ^EXAMPLES current issue is having the db in the constructor. I think this shows ways to not do that
"use strict";
const mongodb = require("mongodb");
require("dotenv").config();

class Db {
  constructor() {
    this.userdb;
    this.questiondb;
    this.defaultSettings = { dailyNew: 10, dictionary: "japanese" }; //things to be changed on the settings page
  }
  async connectDB() {
    const client = await mongodb.MongoClient.connect(
      process.env.DB_CONNECT_STRING,
      {
        useNewUrlParser: true
      }
    );

    this.userdb = client.db("Lingapp").collection("Users");
    this.questiondb = client.db("Lingapp").collection("QuestionMaster");
    console.log(await this.userdb.find({ email: "2@gmail.com" }).toArray());
    return typeof this.userdb, this.userdb;
    // return(client.db('Lingapp').collection('Users'), client.db('Lingapp').collection('QuestionMaster'))
  }

  //general functions

  getDB() {
    return this.db;
  }

  async findUserByEmail(email) {
    return (await this.userdb.find({ email: email }).toArray())[0];
  }

  async findUserByUsername(username) {
    return (await this.userdb.find({ username: username }).toArray())[0];
  }

  async getIntervalDays(date1, date2) {
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays;
  }

  async getReviewDate(date1, date2) {
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
    return diffDays;
  }

  //question things

  async getLearnQuestions(username) {
    let user = (await this.userdb.find({ username: username }).toArray())[0];
    let allQuestions = user.usersQuestions;
    let userDailyNew = user.userSettings.dailyNew;
    console.log(allQuestions);
    console.log(userDailyNew);
    let sendit = [];
    for (let i = 0; i < allQuestions.length; i++) {
      if (allQuestions[i].learned === false) {
        sendit.push({
          userQData: allQuestions[i],
          question: (
            await this.questiondb.find({ qnum: allQuestions[i].num }).toArray()
          )[0].question,
          fileName: (
            await this.questiondb.find({ qnum: allQuestions[i].num }).toArray()
          )[0].filename
        });
      }
      if (sendit.length >= userDailyNew) {
        break;
      }
    }
    console.log(sendit);
    console.log(sendit.length);
    return sendit;
  }

  async getStudyQuestions(username) {
    //CHANGE TO TAKE USERNAME/FIND ONLY READY ITEMS
    // let today = new Date();
    let qList = (await this.findUserByUsername(username)).usersQuestions;
    let sendList = [];
    let today = new Date();
    console.log(qList.length);
    for (let i = 0; i < qList.length; i++) {
      console.log(i);
      console.log(qList[i].nextReview, today);
      if (qList[i].learned === true && today >= qList[i].nextReview) {
        // && today.getTime() < qlist[i].nextReview.getTime() @@ may needd to change how the learnt/review dates are stored in db
        console.log("adding");
        sendList.push({
          userQData: qList[i],
          question: (
            await this.questiondb.find({ qnum: qList[i].num }).toArray()
          )[0].question,
          fileName: (
            await this.questiondb.find({ qnum: qList[i].num }).toArray()
          )[0].filename
        });
      }
    }
    console.log("sending " + sendList);
    console.log(sendList.length);
    return sendList;
  }

  async learnUpdate(updateList, username) {
    console.log("list | " + updateList);
    let user = await this.findUserByUsername(username);
    //https://stackoverflow.com/questions/40062110/how-to-dynamically-set-field-name-from-variable-in-mongo-script
    let update = { $set: {} }; //variable to update things
    let date = new Date();
    let nextDate = new Date();
    // nextDate.setDate(nextDate.getDate() + 1);    //uncomment to set first rview to a day after
    console.log(nextDate);

    for (let i = 0; i < updateList.length; i++) {
      let qnum = "usersQuestions." + updateList[i];
      //add what to update
      update.$set[qnum + ".srsval"] = 0;
      update.$set[qnum + ".learned"] = true;
      update.$set[qnum + ".lastLearned"] = date;
      update.$set[qnum + ".nextReview"] = nextDate;
      update.$set[qnum + ".interval"] = await this.getIntervalDays(
        date,
        nextDate
      );

      this.userdb.updateMany({ username: username }, update, false, true);
      // this.userdb.updateMany (
      //     { username : username },
      //     { $set : { $$qnum: 6 } },
      //     function( err, result ) {
      //         if ( err ) throw err;
      //     }
      // );
    }
    console.log("updated " + (await this.findUserByUsername(username)));
  }

  async studyUpdate(username, reviewedQuestions) {
    let update = { $set: {} }; //variable to update things
    let date = new Date();
    console.log("updating...");
    for (let i = 0; i < reviewedQuestions.length; i++) {
      let qnum = "usersQuestions." + reviewedQuestions[i].userQData.num;
      //add what to update
      update.$set[qnum + ".srsval"] = reviewedQuestions[i].userQData.srsval;
      update.$set[qnum + ".ease"] = reviewedQuestions[i].userQData.ease;
      update.$set[qnum + ".lastLearned"] = date;
      update.$set[qnum + ".nextReview"] = new Date(
        date.getTime() +
          reviewedQuestions[i].userQData.interval * 24 * 60 * 60 * 1000
      );
      update.$set[qnum + ".correctCount"] =
        reviewedQuestions[i].userQData.correctCount;
      update.$set[qnum + ".wrongCount"] =
        reviewedQuestions[i].userQData.wrongCount;
      update.$set[qnum + ".disabled"] = reviewedQuestions[i].userQData.disbaled;
      update.$set[qnum + ".interval"] = reviewedQuestions[i].userQData.interval;

      this.userdb.updateMany({ username: username }, update, false, true);
      console.log("finished...");
    }
  }

  async loadUserBoard(username) {
    //can probably store total learnt count so I don't have to serach for it here. would need to update it when saving review sessions?
    let qList = (await this.findUserByUsername(username)).usersQuestions;
    let learnCount = 0;
    let reviewCount = 0;
    let totalLearned = 0;
    let totalUnlearned = 0;
    let weekReviews = []; //[0] = tomorrow, etc
    weekReviews.push(["Days", "Reviews"]);
    // weekReviews.push(new Array(7).fill(0))
    var days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ];
    let d = new Date();
    for (let i = 0; i < 7; i++) {
      if (i == 0) {
        weekReviews.push(["Today", 0]);
      } else {
        weekReviews.push([days[d.getDay()], 0]);
        d.setDate(d.getDate() + 1);
      }
    }
    console.log(weekReviews);
    let today = new Date();
    console.log(weekReviews);

    //go through the lists to find the userboard data
    for (let i = 0; i < qList.length; i++) {
      if (qList[i].learned === true && today >= qList[i].nextReview) {
        console.log(qList[i]);
      }
      if (qList[i].learned === true) {
        totalLearned += 1;
        if (today >= qList[i].nextReview) {
          console.log(qList[i]);
          reviewCount += 1;
          weekReviews[1][1] += 1;
        } else if (
          (await this.getReviewDate(today, qList[i].nextReview)) <= 7
        ) {
          //check if the next review is within a week, add to the weekly review count
          // weekReviews[
          // (await this.getReviewDate(today, qList[i].nextReview)) + 1
          // ][1] += 1;
        }
      } else if (qList[i].learned === false) {
        //will need to limit to the
        learnCount += 1;
        totalUnlearned += 1;
      }
    }
    let send = {
      reviewC: reviewCount,
      learnC: learnCount,
      learned: totalLearned,
      unlearned: totalUnlearned,
      weekReviews: weekReviews
    };
    return send;
  }

  //settings and example searchs

  async getUserSettings(user) {
    let settings = (await this.findUserByUsername(user)).userSettings;
    return settings;
  }

  async updateUserSettings(user, newSettings) {
    console.log(newSettings);
    let updatedSettings = (await this.findUserByUsername(user)).userSettings;
    updatedSettings.dailyNew = newSettings.dailyNew;
    updatedSettings.dictionary = newSettings.dictionary;
    console.log(updatedSettings);
    this.userdb.updateMany(
      { username: user },
      { $set: { userSettings: updatedSettings } },
      function(err, result) {
        if (err) throw err;
      }
    );
    // return(settings)
  }

  async getExamples(user, word) {
    //might need to limit length of word to anything above 3 characters. maybe have a set return for things like "a" "or" etc as they are contained in many words
    let qlist = await this.questiondb.find({}).toArray();
    let exampleCount = 0;
    word = word.toUpperCase();
    let send = [];
    for (let i = 0; i < qlist.length; i++) {
      if (qlist[i].question.toUpperCase().includes(word)) {
        let temp = qlist[i].question.toUpperCase().split(" ");
        for (let w = 0; w < temp.length; w++) {
          var punctuationless = temp[w].replace(
            /[.,\/#!?$%\^&\*;:{}=\-_`~()]/g,
            ""
          );
          var finalString = punctuationless.replace(/\s{2,}/g, " ");
          if (finalString === word) {
            send.push({
              question: qlist[i].question,
              filename: qlist[i].filename
            });
            exampleCount += 1;
            break;
          }
        }
      }
      if (exampleCount >= 10) {
        break;
      }
    }
    console.log(send);
    return send;
  }

  //user and auth things

  async insert(user) {
    let qlist = await this.questiondb.find({}).toArray();
    let userqlist = [];
    let today = new Date();
    let date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate() +
      " " +
      today.getHours() +
      ":" +
      today.getMinutes() +
      ":" +
      today.getSeconds();

    console.log("inserting new user");
    // Add user question data
    for (let i = 0; i < qlist.length; i++) {
      console.log(qlist[i]);
      userqlist.push({
        num: qlist[i].qnum, //question number
        srsval: -1, //srs interval, -1 = unlearned, 0 learning, 1 novice, etc
        learned: false, //viewed or not
        ease: 100, //used to adjust further srs intervals (if I decide to use it)
        lastLearned: date, //track the last question learned so I don't have to search
        nextReview: null, //track when item is due, only updates after learned
        correctCount: 0,
        wrongCount: 0,
        disabled: false,
        interval: 0 //days till next review
      });
    }

    console.log(userqlist);
    // console.log("inserting new user1" + req.body.name + '\n'+ req.body.email + '\n'+ req.body.password + '\n')

    await this.userdb.insertOne({
      username: user.username,
      email: user.email,
      hashedpassword: user.hashedpassword,
      activeToken: null,
      usersQuestions: userqlist,
      userSettings: this.defaultSettings
    });
  }

  async setActiveToken(email, token) {
    //save the active token for a user
    this.userdb.updateMany(
      { email: email },
      { $set: { activeToken: token } },
      function(err, result) {
        if (err) throw err;
      }
    );
  }

  async getActiveToken(email) {
    let user = this.userdb.find({ email: email });
    return user.activeToken;
  }

  async removeActiveToken(username) {
    //remove the active token upon logout
    this.userdb.updateMany(
      { username: username },
      { $set: { activeToken: null } },
      function(err, result) {
        if (err) throw err;
      }
    );
  }

  async checkToken(token, username) {
    try {
      let ok = (await this.findUserByUsername(username)).activeToken;
      if (ok === token) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
    }
  }

  async uploadQuestions(qlist) {
    console.log("this is the write questions function");
    let counter = 0;
    let questioncount = 0;
    let tempobj = [];
    //deletes all
    this.questiondb.deleteMany({});
    //cycles through the text document contents
    for (var i = 0; i < qlist.length; ++i) {
      if (counter < 3) {
        //make a temp array with the data for a q
        tempobj.push(qlist[i]);
        counter += 1;
        if (counter === 3) {
          //add that data to the db
          console.log(questioncount, tempobj[0], tempobj[1], tempobj[2]);
          await this.questiondb.insertOne({
            qnum: questioncount,
            type: tempobj[0],
            question: tempobj[1],
            filename: tempobj[2]
          });
          counter = 0;
          tempobj = [];
          questioncount += 1;
        }
      }
    }
  }
}

module.exports = Db;
