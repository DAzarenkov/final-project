import { enableInput, inputEnabled, message, setDiv, token } from "./index.js";
import { showAppointments } from "./appointments.js";

let addEditDiv = null;
let reason = null;
let doctor = null;
let patient = null;
let dateInput = null;
let status = null;
let addingAppointment = null;

// Convert ISO date to datetime-local input value
function toDatetimeLocal(value) {
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}
export const handleAddEdit = () => {
  addEditDiv = document.getElementById("edit-appointment");
  reason = document.getElementById("reason");
  doctor = document.getElementById("doctor");
  patient = document.getElementById("patient");
  dateInput = document.getElementById("date");
  status = document.getElementById("status");
  addingAppointment = document.getElementById("adding-appointment");
  const editCancel = document.getElementById("edit-cancel");

  addEditDiv.addEventListener("click", async (e) => {
    if (inputEnabled && e.target.nodeName === "BUTTON") {
      if (e.target === addingAppointment) {
        enableInput(false);

        let method = "POST";
        let url = "/api/v1/appointments";

        if (addingAppointment.textContent === "update") {
          method = "PATCH";
          url = `/api/v1/appointments/${addEditDiv.dataset.id}`;
        }

        // Body without status property (backend sets default)
        const body = {
          reason: reason.value,
          doctor: doctor.value,
          patient: patient.value,
          date: dateInput.value ? new Date(dateInput.value).toISOString() : null,
        };
        if (addingAppointment.textContent === "update") {
          body.status = status.value;
        }

        try {
          const response = await fetch(url, {
            method: method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
          });

          const data = await response.json();
          if (response.status === 200 || response.status === 201) {
            if (response.status === 200) {
              // a 200 is expected for a successful update
              message.textContent = "The appointment entry was updated.";
            } else {
              // a 201 is expected for a successful create
              message.textContent = "The appointment entry was created.";
            }

            reason.value = "";
            doctor.value = "";
            patient.value = "";
            dateInput.value = "";
            status.value = "scheduled";
            showAppointments();
          } else {
            message.textContent = data.msg;
          }
        } catch (err) {
          console.log(err);
          message.textContent = "A communication error occurred.";
        }
        enableInput(true);
      } else if (e.target === editCancel) {
        message.textContent = "";
        showAppointments();
      }
    }
  });
};

export const showAddEdit = async (appointmentId) => {
  if (!appointmentId) {
    reason.value = "";
    doctor.value = "";
    patient.value = "";
    dateInput.value = "";
    status.value = "scheduled";
    addingAppointment.textContent = "add";
    // "scheduled" status (backend sets default)
    status.disabled = true;
    message.textContent = "";

    setDiv(addEditDiv);
  } else {
    enableInput(false);

    try {
      const response = await fetch(`/api/v1/appointments/${appointmentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.status === 200) {
        const appt = data.appointment || data;
        reason.value = appt.reason || "";
        doctor.value = appt.doctor || "";
        patient.value = appt.patient || "";
        status.value = appt.status || "scheduled";
        if (appt.date) {
          try {
            dateInput.value = toDatetimeLocal(appt.date);
          } catch (err) {
            dateInput.value = "";
          }
        } else {
          dateInput.value = "";
        }
        addingAppointment.textContent = "update";
        message.textContent = "";
        addEditDiv.dataset.id = appointmentId;
        // Enable status when editing
        status.disabled = false;

        setDiv(addEditDiv);
      } else {
        // might happen if the list has been updated since last display
        message.textContent = "The appointment entry was not found";
        showAppointments();
      }
    } catch (err) {
      console.log(err);
      message.textContent = "A communications error has occurred.";
      showAppointments();
    }

    enableInput(true);
  }
};
