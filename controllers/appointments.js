const Appointment = require("../models/Appointment");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError, ForbiddenError } = require("../errors");

const getAllAppointments = async (req, res) => {
  const appointments = await Appointment.find({
    $or: [{ patient: req.user.userId }, { doctor: req.user.userId }],
  }).sort("date");

  res.json({ appointments, count: appointments.length });
};

const getAppointment = async (req, res) => {
  const {
    user: { userId },
    params: { id: appointmentId },
  } = req;

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    $or: [{ patient: userId }, { doctor: userId }],
  });

  if (!appointment) {
    throw new NotFoundError(`No appointment with id ${appointmentId}`);
  }

  res.json({ appointment });
};

const createAppointment = async (req, res) => {
  if (req.user.role !== "patient") {
    throw new ForbiddenError("Only patients can create appointments");
  }

  req.body.patient = req.user.userId;
  const appointment = await Appointment.create(req.body);
  res.status(StatusCodes.CREATED).json({ appointment });
};

const updateAppointment = async (req, res) => {
  if (req.user.role !== "patient") {
    throw new ForbiddenError("Only patients can update appointments");
  }

  const {
    user: { userId },
    params: { id: appointmentId },
  } = req;

  const appointment = await Appointment.findOneAndUpdate(
    {
      _id: appointmentId,
      $or: [{ patient: userId }, { doctor: userId }],
    },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!appointment) {
    throw new NotFoundError(`No appointment with id ${appointmentId}`);
  }

  res.json({ appointment });
};

const deleteAppointment = async (req, res) => {
  if (req.user.role !== "patient") {
    throw new ForbiddenError("Only patients can delete appointments");
  }

  const {
    user: { userId },
    params: { id: appointmentId },
  } = req;

  const appointment = await Appointment.findOneAndRemove({
    _id: appointmentId,
    $or: [{ patient: req.user.userId }, { doctor: req.user.userId }],
  });

  if (!appointment) {
    throw new NotFoundError(`No appointment with id ${appointmentId}`);
  }

  res.json({ msg: "The entry was deleted." });
};

module.exports = {
  getAllAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
