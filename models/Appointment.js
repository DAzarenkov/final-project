const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    reason: {
      type: String,
      required: [true, "Please provide reason for visit"],
      minlength: 5,
      maxlength: 500,
    },
    doctor: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please choose a doctor"],
    },
    patient: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please choose a patient"],
    },
    date: {
      type: Date,
      required: [true, "Please choose a date"],
    },
    status: {
      type: String,
      enum: ["scheduled", "cancelled", "completed"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", AppointmentSchema);
