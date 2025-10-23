const express = require("express");
const router = express.Router();

const {
  getAllAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require("../controllers/appointments");

router.route("/").post(createAppointment).get(getAllAppointments);
router
  .route("/:id")
  .get(getAppointment)
  .delete(deleteAppointment)
  .patch(updateAppointment);

module.exports = router;
