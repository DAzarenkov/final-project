const { app } = require("../app");
const { factory, seed_db } = require("../util/seed_db");
const faker = require("@faker-js/faker").fakerEN_US;
const get_chai = require("../util/get_chai");

const User = require("../models/User");

describe("tests for registration and logon", function () {
  // after(() => {
  //   server.close();
  // });

  it("should register the user", async () => {
    const { expect, request } = await get_chai();

    const password = faker.internet.password();
    const userData = await factory.build("user", { password });

    const res = await request
      .execute(app)
      .post("/api/v1/auth/register")
      .set("Content-Type", "application/json")
      .send({
        name: userData.name,
        email: userData.email,
        password,
      });

    expect(res).to.have.status(201);
    expect(res.body).to.have.property("message");
    expect(res.body.message).to.equal("User registered successfully");

    const newUser = await User.findOne({ email: userData.email });
    expect(newUser).to.not.be.null;
  });
});
