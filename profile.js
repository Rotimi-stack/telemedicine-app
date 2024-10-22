document.addEventListener("DOMContentLoaded", function () {
    // Fetch patient profile data via AJAX request
    fetchProfileData();

    // Attach the form submit handler
    document.getElementById('profileForm').onsubmit = function (event) {
        event.preventDefault(); // Prevent default form submission behavior

        const formData = new FormData(this); // Collect form data

        fetch('/update-profile', {
            method: 'POST',
            body: new URLSearchParams(formData) // Convert form data to URL-encoded format
        })
            .then(response => response.text())
            .then(result => {
                alert(result); // Notify user of the update status
                window.location.reload(); // Optionally, refresh the page after saving
            })
            .catch(error => console.error('Error saving profile:', error));
    };
});

// Function to fetch and display the patient's profile data
function fetchProfileData() {
    fetch('/fetch-profile')  // Correct route to fetch data
        .then(response => response.json())
        .then(patient => {
            // Format date to YYYY-MM-DD
            const dob = new Date(patient.date_of_birth);
            const formattedDate = dob.toISOString().split('T')[0]; // Converts to YYYY-MM-DD

           
            document.getElementById('id').value = patient.id; // Set Id field
            document.getElementById('firstName').value = patient.first_name;
            document.getElementById('lastName').value = patient.last_name;
            document.getElementById('phone').value = patient.phone;
            document.getElementById('dob').value = formattedDate; // Set the formatted date
            document.getElementById('gender').value = patient.gender;
            document.getElementById('address').value = patient.address;
        })
        .catch(error => console.error('Error fetching profile:', error));
}

// Enable editing of the form fields
function enableEdit() {
    document.getElementById("firstName").readOnly = false;
    document.getElementById("lastName").readOnly = false;
    document.getElementById("phone").readOnly = false;
    $('#dob').removeAttr('readonly');
    document.getElementById("gender").disabled = false;
    document.getElementById("address").readOnly = false;

    document.getElementById("saveButton").disabled = false; // Enable Save button

    // Ensure the Id field remains read-only
    document.getElementById("id").readOnly = true; // Keep the Id field uneditable
}

// Placeholder for deleteAccount function
function deleteAccount() {
    // Implement delete account logic here
    alert('Delete account functionality not implemented yet.');
}
