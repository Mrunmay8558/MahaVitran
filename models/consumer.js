const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const consumerSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  homeName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  town: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  permanantAddress: {
    type: String,
    required: true,
  },
  Division: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  OnOrOff: {
    type: Number,
    min: 0,
    max: 1,
  },
});

const Consumer = mongoose.model("Consumer", consumerSchema);
module.exports = Consumer;
