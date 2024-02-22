const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const memberSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
});

memberSchema.plugin(passportLocalMongoose);
const Member = mongoose.model("Member", memberSchema);
module.exports = Member;
