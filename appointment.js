// Function to filter the appointment table based on search input and status filter
function filterAppointmentTable() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('appointmentFilter').value.toLowerCase(); // Convert filter value to lowercase

    const table = document.getElementById('appointmentTable');
    const rows = table.getElementsByTagName('tr');

    // Loop through table rows (excluding header row) to filter based on input and status
    for (let i = 1; i < rows.length; i++) { // Start at 1 to skip header row
        const row = rows[i];
        const patientName = row.cells[1].textContent.trim().toLowerCase(); // Trim to remove any extra spaces
        const doctorName = row.cells[2].textContent.trim().toLowerCase(); // Trim to remove any extra spaces
        const appointmentStatus = row.cells[5].textContent.toLowerCase(); // Convert status to lowercase

        // Convert searchInput to a string for comparison
        const searchStr = searchInput.trim();

        // Check if the row matches the search input and status filter criteria
        const matchesSearch = patientName.includes(searchStr) || doctorName.includes(searchStr);
        const matchesStatus = statusFilter === '' || appointmentStatus === statusFilter; // Use lowercase comparison

        // Show or hide the row based on filters
        if (matchesSearch && matchesStatus) {
            row.style.display = ''; // Show row
        } else {
            row.style.display = 'none'; // Hide row
        }
    }
}


function redirectToTelemedicine() {
    // Fetch the user session to determine the role
    fetch('/check-session')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.role === 'admin') {
                window.location.href = 'admin'; // Redirect to admin.html
            } else {
                window.location.href = 'index'; // Redirect to index.html
            }
        })
        .catch(error => {
            console.error('Error checking session:', error);
            // Optionally redirect to a generic page or show an error message
        });
}

document.addEventListener("DOMContentLoaded", function () {

    fetchAppointmentData();

    // Function to fetch and display appointments in the table
    function fetchAppointmentData() {
        fetch('/fetch-appointments')
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(appointments => {
                console.log(appointments);
                const tableBody = document.getElementById('appointmentTable').getElementsByTagName('tbody')[0];
                tableBody.innerHTML = ''; // Clear existing rows


                // Check if appointments exist
                if (appointments.length === 0) {
                    const row = tableBody.insertRow();
                    row.insertCell(0).innerText = 'No appointments found.';
                } else {
                    // Populate the table with appointment data
                    appointments.forEach(appointment => {
                        const row = tableBody.insertRow();

                        // Format the appointment date to show only the date part
                        const formattedDate = new Date(appointment.appointment_date).toISOString().split('T')[0];

                        // Format the time to 12-hour format
                        const formattedTime = formatTime12Hour(appointment.appointment_time);

                        row.insertCell(0).innerText = (appointment.id);
                        row.insertCell(1).innerText = appointment.patient_firstname + ' ' + appointment.patient_lastname; // Display Patient Name
                        row.insertCell(2).innerText = appointment.doctor_firstname + ' ' + appointment.doctor_lastname;   // Display Doctor Name
                        row.insertCell(3).innerText = formattedDate;
                        row.insertCell(4).innerText = formattedTime;
                        row.insertCell(5).innerText = appointment.status;


                        // Add an "Edit" button
                        const editButton = document.createElement('button');
                        editButton.className = 'edit-btn';
                        editButton.innerText = 'Edit';
                        editButton.dataset.Id = (appointment.id);
                        editButton.dataset.patientId = appointment.patient_id;
                        editButton.dataset.doctorId = appointment.doctor_id;
                        editButton.dataset.date = appointment.appointment_date;
                        editButton.dataset.time = appointment.appointment_time;
                        editButton.dataset.status = appointment.status;
                        editButton.onclick = function () {
                            openEditAppointmentModal(appointment);
                        };
                        row.insertCell(6).appendChild(editButton);


                        // Add a "Cancel" button
                        
                        const cancelCell = row.insertCell(7);
                        const cancelButton = document.createElement('button');
                        cancelButton.className = 'cancel-btn';
                        cancelButton.innerText = 'Cancel';
                        cancelButton.onclick = () => cancelAppointment(appointment);
                        cancelCell.appendChild(cancelButton);
                    });
                }
            })
            .catch(error => console.error('Error fetching appointments:', error));


    }

    // Function to format time to 12-hour format
    function formatTime12Hour(time24) {
        const [hours, minutes] = time24.split(':');
        const hours12 = (hours % 12) || 12; // Convert 24-hour format to 12-hour format
        const amPm = hours < 12 ? 'AM' : 'PM'; // Determine AM or PM
        return `${hours12}:${minutes} ${amPm}`;
    }


    // Open modal and fill the form with appointment data
    function openEditAppointmentModal(appointment) {

        const date = new Date(appointment.appointment_date);
        const formattedDate = date.toISOString().split('T')[0]; // Converts to YYYY-MM-DD


        document.getElementById('appointmentId').value = appointment.id;
        document.getElementById('editPatientId').value = appointment.patient_id;
        document.getElementById('editDoctorId').value = appointment.doctor_id;
        document.getElementById('editAppointmentDate').value = formattedDate;
        document.getElementById('editAppointmentTime').value = appointment.appointment_time;
        document.getElementById('editStatus').value = appointment.status;

        // Show the modal
        document.getElementById('editAppointmentModal').style.display = 'block';
    }


    // Close the edit appointment modal
    document.getElementById('closeAppointmentModal').onclick = function () {
        document.getElementById('editAppointmentModal').style.display = 'none';
    };



    ///Submit updated appointment
    document.getElementById('editAppointmentForm').onsubmit = function (event) {
        event.preventDefault();

        const appointmentData = {
            id: document.getElementById('appointmentId').value,
            patientId: document.getElementById('editPatientId').value,
            doctorId: document.getElementById('editDoctorId').value,
            appointmentDate: document.getElementById('editAppointmentDate').value,
            appointmentTime: document.getElementById('editAppointmentTime').value,
            status: document.getElementById('editStatus').value,
        };

        fetch(`/update-appointment/${appointmentData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appointmentData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Appointment updated successfully!');
                    document.getElementById('editAppointmentModal').style.display = 'none';
                    fetchAppointmentData(); // Refresh the table
                } else {
                    alert('Error updating appointment: ' + data.message);
                }
            })
            .catch(error => console.error('Error updating appointment:', error));
    };

    // Optional: Trigger search on pressing Enter key inside the search input
    document.getElementById('searchInput').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            filterAppointmentTable(); // Trigger search
        }
    });


});







