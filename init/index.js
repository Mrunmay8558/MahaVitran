const mongoose = require("mongoose");
const data = require("../init/employees.js");
const Employee = require("../models/employee.js");

const url = "mongodb://127.0.0.1:27017/IOTEGS";
main()
  .then(() => {
    console.log("conneted to DB");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(url);
}

const initData = async () => {
  await Employee.insertMany(data.employees);
  console.log("Data has Initalized");
};

initData();
