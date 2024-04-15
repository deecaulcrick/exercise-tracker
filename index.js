require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const User = require("./models/user");
const app = express();

mongoose.connect(process.env.MONGO_URI);
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const record = [];

app.post("/api/users", async (req, res) => {
  if ((await User.findOne({ username: req.body.username })) == null) {
    console.log("new user");
    User.create({ username: req.body.username });
  }
  const user = await User.findOne({ username: req.body.username });

  res.json({
    username: req.body.username,
    _id: user._id,
  });
});

app.get("/api/users", async (req, res) => {
  const users = await User.find({});

  res.json({ users });
});

app.post("/api/users/:id/exercises", async (req, res) => {
  const date = req.body.date
    ? new Date(req.body.date).toDateString()
    : new Date().toDateString();
  const duration = req.body.duration;
  const description = req.body.description;

  const newLog = {
    description,
    duration,
    date,
  };

  await User.findOneAndUpdate(
    { _id: req.params.id },
    { log: { description, duration, date } },
    { new: true }
  );
  const user = await User.findOne({ _id: req.params.id });
  console.log(user);

  user.count++;
  user.save();

  res.json({
    _id: user._id,
    username: user.username,
    date,
    duration,
    description,
  });
});

app.get("/api/users/:id/logs", async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });
  console.log(user);

  res.json({ log: user.log });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
