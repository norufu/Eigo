"use strict";
const express = require("express");
const DB = require("./db");
const config = require("./config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

//So do I need to make a db module, require it here as a constant, have it export the db
//and then I have the db loaded publicly for all the other parts? who knows
//can maybe look at db.js as a guide
//https://stackabuse.com/how-to-use-module-exports-in-node-js/

//for the temp file reading
const fs = require("fs");
const db = new DB();
console.log(db.connectDB());

//const db = new DB("sqlitedb")
const app = express();
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// CORS middleware
const allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
};

app.use(allowCrossDomain);

router.post("/register", async (req, res) => {
  //Save user to db
  db.insert({
    username: req.body.name,
    email: req.body.email,
    hashedpassword: bcrypt.hashSync(req.body.password, 8)
  });
  // console.log(req.body.name)
  res.status(201).send({ auth: false, user: req.body.name });
});

async function loadDB() {
  const client = await mongodb.MongoClient.connect(
    "mongodb+srv://dbtestman1:testythebesty@testcluster-tw1hi.mongodb.net/test?retryWrites=true&w=majority",
    {
      useNewUrlParser: true
    }
  );
  console.log(
    client
      .db("Lingapp")
      .collection("QuestionMaster")
      .find({ type: "sentence" })
      .toArray()
  );
  return client.db("Lingapp").collection("Users");
}

// study / learning
router.get("/study", async (req, res) => {
  let username = await decodeJwtId(req.query.token);
  let questions = await db.getStudyQuestions(username);
  res.send(questions);
});

router.post("/study", async (req, res) => {
  let reviewedQuestions = req.body.reviewedQuestions;
  let username = await decodeJwtId(req.body.token);
  console.log(reviewedQuestions);
  await db.studyUpdate(username, reviewedQuestions);
});

router.get("/learn", async (req, res) => {
  console.log("learn token" + req.query);
  let returnQuestions = await db.getLearnQuestions(
    await decodeJwtId(req.query.token)
  );
  console.log(returnQuestions);
  res.send(returnQuestions);
});

router.post("/learn", async (req, res) => {
  let updateQuestions = req.body.updateQuestions;
  console.log(updateQuestions);
  let username = await decodeJwtId(req.body.token);
  await db.learnUpdate(updateQuestions, username);
});

router.get("/loadUserBoard", async (req, res) => {
  //gets question counts, number of learned questions, and reviews for the next week
  let counts = await db.loadUserBoard(await decodeJwtId(req.query.token));
  console.log(counts);
  res.send(counts);
});

//settings and example search
router.get("/profile", async (req, res) => {
  let userSettings = await db.getUserSettings(
    await decodeJwtId(req.query.token)
  );
  res.send(userSettings);
});

router.post("/profile", async (req, res) => {
  //not finished
  await db.updateUserSettings(
    await decodeJwtId(req.body.token),
    req.body.newSettings
  );
  // res.send(userSettings)
});

router.get("/words", async (req, res) => {
  console.log("words");
  res.send(
    await db.getExamples(await decodeJwtId(req.query.token), req.query.word)
  );
});

//auth and registration

router.post("/register-admin", function(req, res) {
  db.insertAdmin(
    [req.body.name, req.body.email, bcrypt.hashSync(req.body.password, 8), 1],
    function(err) {
      if (err)
        return res
          .status(500)
          .send("There was a problem registering the user.");
      db.selectByEmail(req.body.email, (err, user) => {
        if (err)
          return res.status(500).send("There was a problem getting user");
        let token = jwt.sign({ id: user.id }, config.secret, {
          expiresIn: 86400 // expires in 24 hours
        });
        res.status(200).send({ auth: true, token: token, user: user });
      });
    }
  );
});

router.post("/login", async (req, res) => {
  console.log("SDFSDF", req.body.email);
  let user = await db.findUserByEmail(req.body.email);
  console.log(user);
  if (user !== undefined) {
    let hashedp = user.hashedpassword;
    let username = user.username;

    console.log("excuse me", req.body.password, hashedp);
    let passwordIsValid = bcrypt.compareSync(req.body.password, hashedp);
    if (!passwordIsValid)
      return res.status(401).send({ auth: false, token: null });
    let token = jwt.sign({ id: username }, config.secret, {
      expiresIn: 86400 // expires in 24 hours -- 86400 < 24
    });
    db.setActiveToken(req.body.email, token); //pass email and token to save temporarily
    res.status(200).send({ auth: true, token: token, user: username });
  } else {
    console.log("FAILED LOGIN");
    res.status(401).send({ auth: false, token: null });
  }
});

router.post("/logout", async (req, res) => {
  //logout, get the username from token and delete that users active token
  try {
    let decoded = jwt.verify(req.body.token, config.secret); //https://medium.com/ag-grid/a-plain-english-introduction-to-json-web-tokens-jwt-what-it-is-and-what-it-isnt-8076ca679843
    db.removeActiveToken(decoded.id);
  } catch (err) {
    console.log("Invalid token  " + err);
  }

  res.status(200).send();
});

router.get("/checkUserToken", async (req, res) => {
  //check if the user's token is valid. return false will log out, return true means validated
  try {
    let decoded = null;
    try {
      decoded = await decodeJwtId(req.query.token); //https://medium.com/ag-grid/a-plain-english-introduction-to-json-web-tokens-jwt-what-it-is-and-what-it-isnt-8076ca679843
      console.log(await decodeJwtId(req.query.token));
    } catch (err) {
      console.log("Invalid token " + decoded + " " + err);
    }
    if (decoded !== null) {
      let tokenOK = await db.checkToken(req.query.token, decoded); //decode and send token/id to the db
      if (tokenOK === false) {
        console.log("invalid token, logging out");
        res.send(false);
      } else {
        res.send(true);
      }
    } else {
      res.send(false);
    }
  } catch (err) {
    console.log(err);
  }
});

async function decodeJwtId(token) {
  let decoded = null;
  try {
    decoded = jwt.verify(token, config.secret);
  } catch (err) {
    console.log(err);
  }
  return decoded.id;
}

//TEMPORARY to rewrite db from file till I find a better solution
router.get("/qdatarewrite", async (req, res) => {
  let qlist;
  fs.readFile("./static/qlist.txt", (err, data) => {
    if (err) console.log(err);

    qlist = data.toString().split("-");
    //remove the /n
    for (var i = 0; i < qlist.length - 1; i++) {
      qlist[i] = qlist[i].trim();
    }
    console.log(qlist);
    db.uploadQuestions(qlist);
  });
});

app.use(router);

let port = process.env.PORT || 3000;

let server = app.listen(port, function() {
  console.log("Express server listening on port " + port);
});
