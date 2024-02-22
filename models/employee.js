const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

//Creating Schema 
const employeeSchema = new Schema({
    name:{
        type: String,
        required : true,
    },
    email: {
        type: String,
        required : true,
    },
    age: {
        type: Number,
        required : true,
    },
    town: {
        type: String,
        required : true,
    },
    city: {
        type: String,
        required : true,
    },
    permanentAddress: {
        type: String,
        required : true,
    },
    Division: {
        type: String,
        required : true,
    },
    
});

//Creating Model
employeeSchema.plugin(passportLocalMongoose);

const Employee = mongoose.model("Employee", employeeSchema);
module.exports = Employee;