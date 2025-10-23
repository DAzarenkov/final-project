import {
  inputEnabled,
  setDiv,
  message,
  setToken,
  token,
  enableInput,
} from "./index.js";
import { showLoginRegister } from "./loginRegister.js";
import { showAddEdit } from "./addEdit.js";

let appointmentsDiv = null;
let appointmentsTable = null;
let appointmentsTableHeader = null;

export const handleAppointments = () => {
  appointmentsDiv = document.getElementById("appointments");
  const logoff = document.getElementById("logoff");
  const addAppointment = document.getElementById("add-appointment");
  appointmentsTable = document.getElementById("appointments-table");
  appointmentsTableHeader = document.getElementById("appointments-table-header");

  appointmentsDiv.addEventListener("click", async (e) => {
    if (inputEnabled && e.target.nodeName === "BUTTON") {
      if (e.target === addAppointment) {
        showAddEdit(null);
      } else if (e.target === logoff) {
        setToken(null);

        message.textContent = "You have been logged off.";

        appointmentsTable.replaceChildren([appointmentsTableHeader]);

        showLoginRegister();
      } else if (e.target.classList.contains("editButton")) {
        message.textContent = "";
        showAddEdit(e.target.dataset.id);
      } else if (e.target.classList.contains("deleteButton")) {
        enableInput(false);
        const id = e.target.dataset.id;

        try {
          const response = await fetch(`/api/v1/appointments/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.status === 200) {
            message.textContent = "Appointment deleted.";

            // Update appointment list
            await showAppointments();
          } else {
            const data = await response.json();
            message.textContent = data.msg;
          }
        } catch (err) {
          console.error(err);
          message.textContent = "Error deleting appointment.";
        } finally {
          enableInput(true);
        }
      }
    }
  });
};

export const showAppointments = async () => {
  try {
    enableInput(false);

    const response = await fetch("/api/v1/appointments", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    let children = [appointmentsTableHeader];

    if (response.status === 200) {
      if (data.count === 0) {
        appointmentsTable.replaceChildren(...children); // clear this for safety
      } else {
        for (let i = 0; i < data.appointments.length; i++) {
          let rowEntry = document.createElement("tr");

          // Format the date nicely
          let dateStr = "";
          if (data.appointments[i].date) {
            try {
              const d = new Date(data.appointments[i].date);
              dateStr = d.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              });
            } catch (err) {
              dateStr = data.appointments[i].date;
            }
          }

          let editButton = `<td><button type="button" class="editButton" data-id=${data.appointments[i]._id}>edit</button></td>`;
          let deleteButton = `<td><button type="button" class="deleteButton" data-id=${data.appointments[i]._id}>delete</button></td>`;
          let rowHTML = `
            <td>${data.appointments[i].reason}</td>
            <td>${data.appointments[i].doctor.name}</td>
            <td>${data.appointments[i].patient.name}</td>
            <td>${dateStr}</td>
            <td>${data.appointments[i].status}</td>
            <div>${editButton}${deleteButton}</div>`;

          rowEntry.innerHTML = rowHTML;
          children.push(rowEntry);
        }
        appointmentsTable.replaceChildren(...children);
      }
    } else {
      message.textContent = data.msg;
    }
  } catch (err) {
    console.log(err);
    message.textContent = "A communication error occurred.";
  }
  enableInput(true);
  setDiv(appointmentsDiv);
};
