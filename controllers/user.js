const User = require("../models/User");

const getAllDoctors = async (req, res) => {
  const doctors = await User.find({ role: "doctor" })
    .select("name")
    .sort("name");
  res.json({ doctors, count: doctors.length });
};

module.exports = {
  getAllDoctors,
};
