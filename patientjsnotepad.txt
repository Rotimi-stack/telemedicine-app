// Function to filter the patient table based on search input and gender filter
function filterTable() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const genderFilter = document.getElementById('genderFilter').value;

    const table = document.getElementById('patientTable');
    const rows = table.getElementsByTagName('tr');

    // Loop through table rows (excluding header row) to filter based on input
    for (let i = 1; i < rows.length; i++) { // Start at 1 to skip header row
        const row = rows[i];
        const firstName = row.cells[1].textContent.toLowerCase();
        const lastName = row.cells[2].textContent.toLowerCase();
        const gender = row.cells[6].textContent;

        // Check if the row matches the search and gender filter criteria
        const matchesSearch = firstName.includes(searchInput) || lastName.includes(searchInput);
        const matchesGender = genderFilter === '' || gender === genderFilter;

        // Show or hide the row based on filters
        if (matchesSearch && matchesGender) {
            row.style.display = ''; // Show row
        } else {
            row.style.display = 'none'; // Hide row
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    console.log('Page loaded, fetching patient data...');

    fetchPatientData();

    // Function to fetch and display patients in the table
    function fetchPatientData() {
        fetch('/fetch-patients')
            .then(response => {
                console.log('Response status:', response.status); // Log the response status
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(patients => {
                console.log('Patients data received:', patients); // Log the data received
                const tableBody = document.getElementById('patientTable').getElementsByTagName('tbody')[0];
                tableBody.innerHTML = ''; // Clear existing rows

                // Check if patients exist
                if (patients.length === 0) {
                    const row = tableBody.insertRow();
                    row.insertCell(0).innerText = 'No patients found.';
                } else {
                    // Populate the table with patient data
                    patients.forEach(patient => {
                        console.log('Inserting patient into table:', patient); // Log each patient being inserted
                        const row = tableBody.insertRow();
                        row.insertCell(0).innerText = patient.id;
                        row.insertCell(1).innerText = patient.first_name;
                        row.insertCell(2).innerText = patient.last_name;
                        row.insertCell(3).innerText = patient.email;
                        row.insertCell(4).innerText = patient.phone;
                        row.insertCell(5).innerText = patient.date_of_birth;
                        row.insertCell(6).innerText = patient.gender;
                        row.insertCell(7).innerText = patient.address;
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching patients:', error); // Log any errors
            });
    }

    // Optional: Trigger search on pressing Enter key inside the search input
    document.getElementById('searchInput').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            filterTable(); // Trigger search
        }
    });
});
