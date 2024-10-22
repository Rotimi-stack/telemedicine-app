// Function to filter the doctor table based on search input
function filterDoctorTable() {
    const searchInput = document.getElementById('searchDoctor').value.toLowerCase();
    const table = document.getElementById('doctorTable');
    const rows = table.getElementsByTagName('tr');

    // Loop through table rows (excluding header row) to filter based on input
    for (let i = 1; i < rows.length; i++) { // Start at 1 to skip header row
        const row = rows[i];
        const firstName = row.cells[1].textContent.toLowerCase();
        const lastName = row.cells[2].textContent.toLowerCase();
        const specialization = row.cells[3].textContent.toLowerCase();

        // Check if the row matches the search criteria
        const matchesSearch = firstName.includes(searchInput) || lastName.includes(searchInput) || specialization.includes(searchInput);

        // Show or hide the row based on search input
        if (matchesSearch) {
            row.style.display = ''; // Show row
        } else {
            row.style.display = 'none'; // Hide row
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Fetch doctor data via AJAX request
    fetchDoctorData();

    // Attach the form submit handler for adding a new doctor
    document.getElementById('addDoctorForm').onsubmit = function (event) {
        event.preventDefault(); // Prevent default form submission behavior

        // Clear previous validation messages
        clearValidationMessages();

        const formData = new FormData(this); // Collect form data

        // Send a POST request to add a new doctor
        fetch('/add-doctor', {
            method: 'POST',
            body: new URLSearchParams(formData) // Convert form data to URL-encoded format
        })


            .then(response => response.json())
            .then(result => {
                if (result.errors) {
                    // If there are validation errors, display them
                    displayValidationMessages(result.errors);
                } else {
                    // If doctor is added successfully, show success message and refresh the form
                    console.log('Server Response:', result.message);
                    alert(result.message); // Notify user of the addition status
                    this.reset(); // Reset the form fields
                    fetchDoctorData(); // Refresh the list of doctors
                }
            })
            .catch(error => console.error('Error adding doctor:', error));
    };


    // Function to fetch and display doctors in the table
    function fetchDoctorData() {
        fetch('/fetch-doctors') // Call the API endpoint
            .then(response => {
                console.log('Response status:', response.status); // Check response status
                return response.json();
            })
            .then(doctors => {
                const tableBody = document.getElementById('doctorTable').getElementsByTagName('tbody')[0];
                tableBody.innerHTML = ''; // Clear existing rows

                // Populate the table with doctor data
                doctors.forEach(doctor => {
                    const row = tableBody.insertRow();
                    row.insertCell(0).innerText = doctor.id;
                    row.insertCell(1).innerText = doctor.first_name;
                    row.insertCell(2).innerText = doctor.last_name;
                    row.insertCell(3).innerText = doctor.specialization;
                    row.insertCell(4).innerText = doctor.email;
                    row.insertCell(5).innerText = doctor.phone;
                    row.insertCell(6).innerText = doctor.schedule;



                    // Add the "Edit" button in the last cell
                    const editButton = document.createElement('button');
                    editButton.className = 'edit-btn';
                    editButton.innerText = 'Edit';
                    editButton.dataset.id = doctor.id;
                    editButton.dataset.firstName = doctor.first_name;
                    editButton.dataset.lastName = doctor.last_name;
                    editButton.dataset.specialization = doctor.specialization;
                    editButton.dataset.email = doctor.email;
                    editButton.dataset.phone = doctor.phone;
                    editButton.dataset.schedule = doctor.schedule;

                    editButton.onclick = function () {
                        openEditModal(doctor); // Open modal with populated data
                    };

                    row.insertCell(7).appendChild(editButton);


                    // Adding Book Session Button
                    const bookCell = row.insertCell(8); // New cell for Book Session button
                    const bookButton = document.createElement('button');
                    bookButton.innerText = 'Book Session';
                    bookButton.onclick = () => openBookSessionModal(doctor); // Function to open the booking modal
                    bookCell.appendChild(bookButton);



                });
            })
            .catch(error => console.error('Error fetching doctors:', error));
    }

    //------------------------------------------------------------UPDATE DOCTOR-------------------------------
    // Function to open the modal and populate it with doctor data
    function openEditModal(doctor) {
        // Show the modal
        document.getElementById('editDoctorModal').style.display = 'block';

        // Populate the form with doctor data
        document.getElementById('doctorId').value = doctor.id;
        document.getElementById('editFirstName').value = doctor.first_name;
        document.getElementById('editLastName').value = doctor.last_name;
        document.getElementById('editSpecialization').value = doctor.specialization;
        document.getElementById('editEmail').value = doctor.email;
        document.getElementById('editPhone').value = doctor.phone;
        document.getElementById('editSchedule').value = doctor.schedule;
    }

    // Close modal when clicking the close button
    document.getElementById('closeModal').onclick = function () {
        document.getElementById('editDoctorModal').style.display = 'none';
    };

    // Handle form submission for updating doctor
    document.getElementById('editDoctorForm').onsubmit = function (event) {
        event.preventDefault(); // Prevent default form submission behavior

        const formData = new FormData(this); // Collect form data
        const doctorId = document.getElementById('doctorId').value; // Get doctor ID

        // Send a PUT request to update the doctor
        fetch(`/update-doctor/${doctorId}`, {
            method: 'PUT',
            body: new URLSearchParams(formData) // Convert form data to URL-encoded format
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(result => {
                alert(result); // Notify user of the update status
                document.getElementById('editDoctorModal').style.display = 'none'; // Hide the modal
                fetchDoctorData(); // Refresh the list of doctors
            })
            .catch(error => console.error('Error updating doctor:', error));
    };




    //-----------------------------------------------------------BOOK APPOINTMENT-----------------------------
    function openBookSessionModal(doctor) {
        // Debugging: Check the entire doctor object passed
        console.log('Doctor object passed to openBookSessionModal:', doctor);

        // Ensure doctor is not null or undefined
        if (!doctor || !doctor.id) {
            console.error('Invalid doctor object passed:', doctor);
            alert('An error occurred while trying to book an appointment. Please try again.');
            return; // Exit the function if the doctor object is invalid
        }

        document.querySelector('#bookingForm #doctorId').value = doctor.id;
        console.log('Doctor ID set in modal:', doctor.id); // Log the doctor ID

        // Set the patient ID from the logged-in session
        const loggedInPatientId = getLoggedInPatientId();
        console.log('Logged in Patient ID:', loggedInPatientId); // Confirm Patient ID

        document.getElementById('patientId').value = loggedInPatientId;

        // Show the booking modal
        document.getElementById('bookingModal').style.display = 'block';
    }

    function getLoggedInPatientId() {
        return sessionStorage.getItem('patientId'); // Ensure patient ID is stored in session storage upon login
    }

    // Close modal when clicking the close button
    document.getElementById('closeBookingModal').onclick = function () {
        closeBookingModal(); // Call a separate function to close the modal
    };

    // Function to close the booking modal
    function closeBookingModal() {
        document.getElementById('bookingModal').style.display = 'none'; // Hide the booking modal
    }

    document.getElementById("createAppointmentButton").addEventListener("click", createAppointment);

    function createAppointment() {
        console.log('createAppointment function called');

        // Clear previous validation messages
        clearValidationMessages();

        // Retrieve values from the input fields
        const patientId = document.getElementById('patientId').value;
        const doctorId = document.querySelector('#bookingForm #doctorId').value;
        const appointmentDate = document.getElementById('appointmentDate').value;
        const appointmentTime = document.getElementById('appointmentTime').value;
        const status = document.getElementById('status').value;

        // Array to store any validation errors
        let validationErrors = [];

        // Validate each field
        if (!patientId) {
            validationErrors.push({ field: 'patientId', message: 'Patient ID is required.' });
        }
        if (!doctorId) {
            validationErrors.push({ field: 'doctorId', message: 'Doctor ID is required.' });
        }
        if (!appointmentDate) {
            validationErrors.push({ field: 'appointmentDate', message: 'Appointment date is required.' });
        }
        if (!appointmentTime) {
            validationErrors.push({ field: 'appointmentTime', message: 'Appointment time is required.' });
        }
        if (!status) {
            validationErrors.push({ field: 'status', message: 'Status is required.' });
        }

        // If there are validation errors, display them and stop form submission
        if (validationErrors.length > 0) {
            displayValidationMessages(validationErrors);
            return;
        }

        // Prepare the appointment data for the fetch request
        const appointmentData = {
            patientId,
            doctorId,
            appointmentDate,
            appointmentTime,
            status,
        };

        console.log('Appointment Data to be sent:', appointmentData);

        // Send a POST request to create the appointment
        fetch('/create-appointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appointmentData),
        })
            .then((response) => {
                console.log('Response received:', response);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log('Response data:', data);
                if (data.success) {
                    alert('Appointment created successfully!');
                    closeBookingModal();
                } else {
                    alert('Error creating appointment: ' + data.message);
                }
            })
            .catch((error) => {
                console.error('Error creating appointment:', error);
            });
    }






    // Function to display validation messages on the form
    function displayValidationMessages(errors) {
        errors.forEach(error => {
            const field = document.getElementById(error.field);
            if (field) {
                const errorElement = document.createElement('div');
                errorElement.className = 'text-danger';
                errorElement.innerText = error.message;
                field.parentNode.appendChild(errorElement); // Display error below the field
            }
        });
    }

    // Function to clear previous validation messages
    function clearValidationMessages() {
        const errorMessages = document.querySelectorAll('.text-danger');
        errorMessages.forEach(errorElement => errorElement.remove());
    }

    // Optional: Trigger search on pressing Enter key inside the search input
    document.getElementById('searchDoctor').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            filterDoctorTable(); // Trigger search
        }

    });
});
