const { expect, request } = require("chai");
const app = require("../app");
const Appointment = require("../models/Appointment");
const { seed_db, testUserPassword } = require("../util/seed_db");
const factory = require("factory-girl").factory;

describe("Testing Appointment CRUD Operations", function () {
  before(async function () {
    this.test_user = await seed_db();

    let req = request(app).get("/session/logon").send();
    let res = await req;
    const textNoLineEnd = res.text.replaceAll("\n", "");
    this.csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd)[1];

    let cookies = res.headers["set-cookie"];
    this.csrfCookie = cookies.find((element) =>
      element.startsWith("csrfToken")
    );

    const dataToPost = {
      email: this.test_user.email,
      password: testUserPassword,
      _csrf: this.csrfToken,
    };
    req = request(app)
      .post("/session/logon")
      .set("Cookie", this.csrfCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .redirects(0)
      .send(dataToPost);

    res = await req;
    cookies = res.headers["set-cookie"];
    this.sessionCookie = cookies.find((element) =>
      element.startsWith("connect.sid")
    );

    expect(this.csrfToken).to.not.be.undefined;
    expect(this.sessionCookie).to.not.be.undefined;
    expect(this.csrfCookie).to.not.be.undefined;
  });

  it("Should get the appointment list", async function () {
    const res = await request(app)
      .get("/appointments")
      .set("Cookie", this.sessionCookie)
      .send();

    expect(res.status).to.equal(200);

    const pageParts = res.text.split("<tr>");
    expect(pageParts.length).to.equal(21); // 20 appointments + header row
  });

  it("Should add a new appointment", async function () {
    const appointmentData = await factory.build("appointment");

    const res = await request(app)
      .post("/appointments/new")
      .set("Cookie", `${this.sessionCookie}; ${this.csrfCookie}`)
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        reason: appointmentData.reason,
        doctor: appointmentData.doctor,
        patient: appointmentData.patient,
        date: appointmentData.date.toISOString(),
        _csrf: this.csrfToken,
      });

    expect(res.status).to.equal(302);

    const appointments = await Appointment.find({
      patient: this.test_user._id,
    });
    expect(appointments.length).to.equal(21);
  });
});
