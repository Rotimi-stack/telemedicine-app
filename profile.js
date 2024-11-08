function getToken() {
  const token = localStorage.getItem('jwt');
  if (!token) {
    console.error('No token found in localStorage');
  }
  return token;
}


document.addEventListener("DOMContentLoaded", function () {
  // Fetch patient profile data via AJAX request
  fetchProfileData();

  // Attach the form submit handler
  document.getElementById('profileForm').onsubmit = function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    const formData = new FormData(this); // Collect form data
    const token = getToken(); // Get the token using the helper function

    if (!token) {
      return; // Don't continue if token is missing
    }

    // Convert FormData to a plain object
    const formObject = {};
    formData.forEach((value, key) => {
      formObject[key] = value;
    });


    fetch('/update-profile', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(formObject) // Convert form data to JSON
    })
      .then(response => {
        const contentType = response.headers.get("Content-Type");

        // Check if response is JSON; if not, handle as plain text
        if (contentType && contentType.includes("application/json")) {
          return response.json(); // Parse JSON response
        } else {
          return response.text(); // Parse text response
        }
      })
      .then(result => {
        // Check if result is an object (JSON) or string (text)
        if (typeof result === 'object') {
          alert(result.message); // Display JSON message
        } else {
          alert(result); // Display text message
        }
        fetchProfileData(); // Optionally, refresh the page after saving
      })
      .catch(error => console.error('Error saving profile:', error));
  };
});

document.getElementById('telemedicine-link-nav').addEventListener('click', redirectToTelemedicine);

/* INSTALL JWT DECODE TO DECODE JWT TOKEN: npm install jwt-decode */

function redirectToTelemedicine() {
  const token = localStorage.getItem('jwt');
  if (!token) {
    console.log('No token found in localStorage');
    return;
  }

  try {
    const decoded = jwt_decode(token);
    const patientId = decoded.id;

    if (patientId && window.location.pathname !== '/index.html') {
      window.location.href = 'index.html';
    } else {
      console.error('Invalid patient ID');
    }
  } catch (error) {
    console.error('Error decoding token:', error);
  }
}

// Function to fetch and display the patient's profile data
function fetchProfileData() {
  const token = getToken(); // Get the token using the helper function

  if (!token) {
    return; // Don't continue if token is missing
  }

  fetch('/fetch-profile', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(patient => {
      console.log('Fetched profile data:', patient); // Log data to confirm latest data is fetched


      const date = new Date(patient.date_of_birth);
      const formattedDate = date.toISOString().split('T')[0]; // Converts to YYYY-MM-DD


      // Populate form fields with fetched patient data
      document.getElementById("id").value = patient.id || '';
      document.getElementById("firstName").value = patient.first_name || '';
      document.getElementById("lastName").value = patient.last_name || '';
      document.getElementById("phone").value = patient.phone || '';
      document.getElementById("dob").value = formattedDate || '';
      document.getElementById("gender").value = patient.gender || '';
      document.getElementById("address").value = patient.address || '';
    })
    .catch(error => {
      console.error('Error fetching profile:', error);
      // Display error message to the user
    });
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
