if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const ejsMate = require("ejs-mate");
const path = require("path");
const mongoose = require("mongoose");
const Employee = require("./models/employee.js");
const Consumer = require("./models/consumer.js");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
passport.use(new LocalStrategy(Employee.authenticate()));
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const Member = require("./models/member.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/expressError.js");
const { consumerSchema } = require("./schema.js");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);

const store = MongoStore.create({
  mongoUrl: process.env.MONGO_URL,
  crypto: {
    secret: process.env.PASSWORD,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("error in mongo session store", err);
});

const sessionOption = {
  store,
  secret: process.env.PASSWORD,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

//Employee
passport.use(new LocalStrategy(Employee.authenticate()));
passport.serializeUser(Employee.serializeUser());
passport.deserializeUser(Employee.deserializeUser());

//Member
passport.use(new LocalStrategy(Member.authenticate()));
passport.serializeUser(Member.serializeUser());
passport.deserializeUser(Member.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

const url = process.env.MONGO_URL;
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

app.listen(8080, () => {
  console.log("Server is listening");
});

const validateConsumer = (req, res, next) => {
  let { error } = consumerSchema.validate(req.body.employee);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
app.get("/", (req, res) => {
  res.redirect("/home");
});

app.get("/home", (req, res) => {
  res.render("frontpage/home.ejs");
});

//Creating a Page for Team Member
app.get("/home/team", (req, res) => {
  res.render("Team_Members/teammates.ejs");
});

//Creating Employee Protal and Login FUnctionality
app.get("/home/employee", (req, res) => {
  res.render("employee/employee.ejs");
});

//Check User is PResent or Not

app.post(
  "/home/employee",
  passport.authenticate("local", {
    failureRedirect: "/home/employee",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "Welcome to IOTEGS");
    res.redirect("/home/employee/main");
  }
);

//Forgetton-password
app.get("/home/employee/forgetten-password", (req, res) => {
  res.render("employee/forgetton.ejs");
});

app.post(
  "/home/employee/forgetten-password",
  passport.authenticate("local", {
    failureRedirect: "/home/employee/forgetten-password",
    failureFlash: true,
  }),
  wrapAsync(async (req, res) => {
    try {
      let { username, password, newPassword, ConfirmPass } = req.body;
      // console.log(username + " " + password + " " + ConfirmPass);

      if (newPassword == ConfirmPass) {
        await user.changePassword(password, ConfirmPass);
        await user.save();
        req.flash("success", "Password changed successfully");
        res.redirect("/home/employee");
      } else if (err) {
        res.redirect("/home/employee/forgetten-password");
        req.flash("error", "please try again");
      }
    } catch (err) {
      console.error(err);
      req.flash("error", "Failed to change password. Please try again.");
      res.redirect("/home/employee/forgetten-password");
    }
  })
);

//Creating Logout Functionality
app.get("/home/employee/logout", (req, res) => {
  req.logOut((err) => {
    res.redirect("/home");
    req.flash("success", "logout successful!");
  });
});

//Adding consumer Details in Database
app.get("/home/employee/main", (req, res) => {
  res.render("employee/employeePage.ejs");
});

app.post(
  "/home/employee/main",
  validateConsumer,
  wrapAsync(async (req, res) => {
    console.log(req.user);
    const consumerData = req.body.employee;
    const newConsumer = new Consumer(consumerData);
    await newConsumer.save();
    res.redirect("/home/employee/main/consumer-detail");
  })
);

//Show Consumers

app.get("/home/employee/main/consumer-detail", async (req, res) => {
  const allConsumer = await Consumer.find({});
  res.render("employee/showConsumers.ejs", { allConsumer });
});
//EDIT
app.get("/home/employee/main/consumer-detail/:id/edit", async (req, res) => {
  let { id } = req.params;
  const consumer = await Consumer.findById(id);
  res.render("employee/editEmployee.ejs", { consumer });
});
//UPDATE
app.put("/home/employee/main/consumer-detail/:id", async (req, res) => {
  let { id } = req.params;
  const consumer = await Consumer.findByIdAndUpdate(id, {
    ...req.body.employee,
  });
  res.redirect("/home/employee/main/consumer-detail");
});
//DELETE
app.delete(
  "/home/employee/main/consumer-detail/:id/delete",
  async (req, res) => {
    let { id } = req.params;
    await Consumer.findByIdAndDelete(id);
    res.redirect("/home/employee/main/consumer-detail");
  }
);

//Creating Main Functionality That will be able to cut the electricity
app.get("/home/employee/main/consumer-detail/:id/cut", async (req, res) => {
  let { id } = req.params;
  const consumer = await Consumer.findById(id);
  res.render("employee/cut.ejs", { consumer });
});

app.post("/home/employee/main/consumer-detail/:id/cut", async (req, res) => {
  let { button } = req.body;
  let { id } = req.params; // Accessing the id parameter from req.params
  const result = await Consumer.updateOne(
    { _id: id },
    { $set: { OnOrOff: button } }
  );
  console.log(result);
  req.flash("success", "Process has been done Successfully!");
  res.redirect(`/home/employee/main/consumer-detail/${id}/cut`);
});

//Nodemailer Code
app.get("/home/employee/main/consumer-detail/:id/alert", async (req, res) => {
  try {
    let { id } = req.params;
    const consumer = await Consumer.findById(id);
    let email = consumer.email;
    let name = consumer.name;
    const accessToken = await oAuth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "iot.egs1111@gmail.com",
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOption = {
      from: '"IOTEGS" <iot.egs1111@gmail.com>', // sender address
      to: email, // using the dynamically obtained email address
      subject: "Warning Notice - Pending Electricity Bill Payment",
      text: "IOTEGS",
      html: `<b>Dear Consumer,<br>${name}</b><br><br>
      <p>We hope this email finds you well.</p>
      <p>We are writing to bring to your attention an important matter regarding your pending electricity bill with IOTEGS. As of our records, the payment for your electricity bill remains outstanding, and we regret to inform you that failure to settle this overdue amount may result in service disconnection.</p>
      <p>At IOTEGS, we understand that unforeseen circumstances may arise, leading to delays in payment. However, it is crucial to ensure the timely settlement of bills to avoid any inconvenience or interruption to your electricity supply.</p>
      <p>We kindly urge you to take immediate action to clear the pending amount to prevent any service disruptions. You can conveniently make the payment through our online portal or visit our nearest payment center for assistance.</p>
      <p>Should you require any clarification regarding your bill or assistance with the payment process, please do not hesitate to contact our customer service team at  ${process.env.EMAIL}.</p>
      <p>Please treat this notice with the utmost urgency to avoid any inconvenience. We appreciate your prompt attention to this matter and your continued cooperation.</p>
      <p>Thank you for choosing IOTEGS for your electricity needs. We look forward to your prompt response and resolution of this matter.</p>
      <b>Best regards,</b><br>
      <b>Team IOTEGS</b>`,
    };

    const result = await transporter.sendMail(mailOption);
    console.log("Email sent...", result);
    req.flash("success", "Alert has been send Successfully!");
    res.redirect("/home/employee/main/consumer-detail");
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).send("Failed to send email");
  }
});

app.get("/home/terms-and-condition", (req, res) => {
  res.render("Team_Members/tandC.ejs");
});
//Adding Employee
app.get("/home/member", async (req, res) => {
  res.render("member/member.ejs");
});

app.post(
  "/home/member",
  passport.authenticate("local", {
    failureRedirect: "/home/member",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "Welcome to IOTEGS");
    res.redirect("/home/member/main");
  }
);

app.get("/home/member/main", async (req, res) => {
  res.render("member/createMember.ejs");
});

app.post(
  "/home/member/main",
  wrapAsync(async (req, res) => {
    try {
      const {
        name,
        email,
        age,
        town,
        city,
        permanentAddress,
        Division,
        username,
        password,
      } = req.body;
      const newEmployee = new Employee({
        name,
        email,
        age,
        town,
        city,
        permanentAddress,
        Division,
        username,
      });

      const registerEmployee = await Employee.register(newEmployee, password);
      console.log(registerEmployee);
      res.redirect("/home/member/main/employee-detail");
    } catch (err) {
      console.error(err);
      req.flash("error", "Data has not been saved");
      res.redirect("/home/member/main");
    }
  })
);

//Showing All Consumer
app.get("/home/member/main/employee-detail", async (req, res) => {
  const allEmployee = await Employee.find({});
  res.render("member/showMember.ejs", { allEmployee });
});

//Creating Logout Functionality
app.get("/home/member/main/logout", (req, res) => {
  req.logOut((err) => {
    res.redirect("/home");
    req.flash("success", "logout successful!");
  });
});

app.get("/home/createMain", async (req, res) => {
  let fakeUser = new Member({
    name: "Mrunmay Chichkhede",
    username: "Mrunmay2002",
  });
  let newUser = await Member.register(fakeUser, "demo@123");
  console.log(newUser);
  res.redirect("/home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "PAGE NOT FOUND!"));
});

//Creating Error Handling MiddleWare
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong!" } = err;
  res.render("error.ejs", { statusCode, message });
  // res.status(statusCode).send(message);
});

app.get("/home/t&C", (req, res) => {
  res.render("termsAndCondition.ejs");
});
