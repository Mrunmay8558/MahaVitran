const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const homeSchema = new Schema({
  houseName: {
    type: String,
    required: true,
  },
  houseValue: {
    type: Number,
    min: 0,
    max: 1,
  },
  houseChangeFuncAt: {
    type: Date,
    default: Date.now(),
  },
});

const Home = mongoose.model("Home", homeSchema);
module.exports = Home;
