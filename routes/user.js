const express = require("express");
const router = express.Router();

const { getAllDoctors } = require("../controllers/user");

router.route("/doctors").get(getAllDoctors);

module.exports = router;
