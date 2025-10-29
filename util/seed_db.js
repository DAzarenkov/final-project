const { date } = require("joi");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const faker = require("@faker-js/faker").fakerEN_US;
const FactoryBot = require("factory-bot");
require("dotenv").config();

const testUserPassword = faker.internet.password();
const factory = FactoryBot.factory;
const factoryAdapter = new FactoryBot.MongooseAdapter();
factory.setAdapter(factoryAdapter);
factory.define("appointment", Appointment, {
  reason: () => faker.lorem.sentence(10),
  date: () => faker.date.future(),
  status: () =>
    ["scheduled", "cancelled", "completed"][Math.floor(3 * Math.random())], // random one of these
});

factory.define("user", User, {
  name: () => faker.person.fullName(),
  email: () => faker.internet.email(),
  role: () => ["doctor", "patient"][Math.floor(2 * Math.random())],
  password: () => faker.internet.password(),
});

const seed_db = async () => {
  let testUser = null;
  try {
    await Appointment.deleteMany({}); // deletes all appointment records
    await User.deleteMany({}); // and all the users
    testUser = await factory.create("user", {
      role: "patient",
      password: testUserPassword,
    });
    const doctor = await factory.create("user", { role: "doctor" });
    await factory.createMany("appointment", 20, { patient: testUser._id, doctor: doctor._id }); // put 20 appointment entries in the database.
  } catch (e) {
    console.log("database error");
    console.log(e.message);
    throw e;
  }
  return testUser;
};

module.exports = { testUserPassword, factory, seed_db };
