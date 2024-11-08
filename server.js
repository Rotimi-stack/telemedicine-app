// Import required packages
const https = require('https'); // Changed from 'http' to 'https'
const cors = require('cors');
const fs = require('fs'); // To handle file system operations
const path = require('path'); // To resolve file paths
const db = require('./database'); // Import the database connection
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');



//DBMS Mysql
const mysql = require('mysql2');

//initialize
const app = express();

//Cross origin resource sharing
app.use(cors());

// Middleware to serve static files (like CSS, JS)
app.use(express.static(__dirname));

// Set up session management
app.use(session({
    secret: 'your-secret-key', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true } // Set to true if using HTTPS
}));
app.use(express.json()); // For parsing application/json

const jwt = require('jsonwebtoken');
const SECRET_KEY = 'victortelemedapp07#'; // Replace with a strong secret key




// Check user session
app.get('/check-session', (req, res) => {
    // Check if the user is logged in
    if (req.session.adminId) {
        return res.json({ role: 'admin' }); // User is an admin
    } else if (req.session.patientId) {
        return res.json({ role: 'patient' }); // User is a patient
    } else {
        return res.status(401).json({ message: 'Unauthorized' }); // User not logged in
    }
});

// Body parser middleware to parse form data from POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Define the paths for the certificate and key files
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'server.key')), // Path to server.key
    cert: fs.readFileSync(path.join(__dirname, 'server.cert'))  // Path to server.crt
};


//authentication middleare that performs validation of the token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Expecting "Bearer <token>"

    if (!token) return res.status(401).json({ message: 'Access token required' });

    console.log('Token received:', token);  // Log the token for debugging

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });

        // Check if it's an admin or a patient
        if (decoded.role) {
            // It's an admin, role is available
            req.user = { id: decoded.id, role: decoded.role };
        } else {
            // It's a patient, only id is available
            req.user = { id: decoded.id };
        }

        next();  // Proceed to the next middleware/route handler
    });
}



// Serve the index.html page
app.get('/index', (req, res) => {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.status(500).send('Error loading index.html');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data); // Send index.html content
        }
    });
});



// Serve the admin.html page 
// Protect the /admin route with JWT authentication
app.get('/admin', authenticateToken, (req, res) => {
    // Check if the authenticated user is an admin
    if (req.user.role !== 'admin') {
        // If not an admin, respond with a 403 Forbidden status
        return res.status(403).json({ success: false, message: 'Forbidden: Admin access only' });
    }

    // Serve the admin.html page
    const filePath = path.join(__dirname, 'admin.html');
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.status(500).send('Error loading admin.html');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data); // Send admin.html content
        }
    });
});



//-----------------------------------------------Serve registration.html page-------------------------------------
app.get('/registration', (req, res) => {
    const filePath = path.join(__dirname, 'registration.html');
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.status(500).send('Error loading registration.html');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data); // Serve the registration page
        }
    });
});

// Handle registration form submission (POST request)
app.post('/register', (req, res) => {
    console.log(req.body);
    const { firstName, lastName, email, password, phone, address, dob, gender } = req.body;

    // Hash the password
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error hashing password' });
        }



        const sql = `INSERT INTO patients (first_name, last_name, email, password_hash, phone,address, date_of_birth, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(sql, [firstName, lastName, email, password, phone, address, dob, gender,], (err) => {
            if (err) {
                console.log(err.stack)
                return res.status(500).send('Error during registration.');
            }
            res.redirect('/login.html'); // Redirect to login page after successful registration
        });
    });
});


//-----------------------------------------------------Serve login.html page------------------------------------
app.get('/login', (req, res) => {

    const filePath = path.join(__dirname, 'login.html');
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.status(500).send('Error loading login.html');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data); // Serve the login page
        }
    });
});

app.post('/login', (req, res) => {
    console.log('Request Body:', req.body);
    const { loginemail, loginpassword } = req.body;

    // Define SQL queries for patients and admin
    const patientQuery = `SELECT id FROM patients WHERE email = ?`;
    const adminQuery = `SELECT id, role FROM admin WHERE username = ?`;

    // Check if user exists in the patients table
    db.query(patientQuery, [loginemail], (err, patientRows) => {
        if (err) {
            console.error('Error querying patients:', err);
            return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
        }

        if (patientRows.length > 0) {
            // Patient found, redirect to index
            const patient = patientRows[0];
            const token = jwt.sign({ id: patient.id }, SECRET_KEY, { expiresIn: '1h' });
            console.log('JWT Token:', token);  // Log the token to the console
            req.session.patientId = patient.id;
            return res.json({ success: true, token, redirect: '/index' });
        }

        // If not found in patients, check in the admin table
        db.query(adminQuery, [loginemail], (err, adminRows) => {
            if (err) {
                console.error('Error querying admin:', err);
                return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
            }

            if (adminRows.length === 0) {
                // No user found in either table
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            // User found in admin table, check role
            const admin = adminRows[0];
            const token = jwt.sign({ id: admin.id, role: admin.role }, SECRET_KEY, { expiresIn: '1h' });
            req.session.adminId = admin.id;

            if (admin.role === 'admin') {
                // If the role is admin, redirect to Patient.html
                return res.json({ success: true, token, redirect: '/admin.html' });
            } else {
                return res.status(403).json({ success: false, message: 'Access restricted to admins.' });
            }
        });
    });
});




// ---------------------------------------------Serve profile.html page (when the user navigates to the profile)--------------------------
app.get('/profile', (req, res) => {
    if (!req.session.patientId && !req.session.adminId) {  // Check for either patientId or adminId
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    const filePath = path.join(__dirname, 'profile.html');
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.status(500).send('Error loading profile.html');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data); // Serve the profile HTML file
        }
    });
});

// Fetch patient profile data via AJAX request
app.get('/fetch-profile', authenticateToken,(req, res) => {
    const patientId = req.user.id; // Get the patient's ID from the JWT
    const sql = `SELECT id, first_name, last_name, phone, date_of_birth, gender, address FROM patients WHERE id = ?`;

    db.query(sql, [patientId], (err, rows) => {
        if (err) {
            console.error('Error fetching profile data:', err);
            return res.status(500).send('Error fetching profile data.');
        }

        console.log('Fetched profile data:', rows);

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).send('Patient not found.');
        }
    });
});


// Handle updating patient profile data
app.post('/update-profile',authenticateToken, (req, res) => {
    const patientId = req.user.id; // Get the patient's ID from the JWT
    const { firstName, lastName, phone, dateOfBirth, gender, address } = req.body;

    // Log the incoming data for debugging
    console.log('Request body:', req.body);

    const sql = `UPDATE patients SET first_name = ?, last_name = ?, phone = ?, date_of_birth = ?, gender = ?, address = ? WHERE id = ?`;
    // Log the SQL query and parameters
    console.log('Executing SQL:', sql);
    console.log('With parameters:', [firstName, lastName, phone, dateOfBirth, gender, address, patientId]);


    db.query(sql, [firstName, lastName, phone, dateOfBirth, gender, address, patientId], (err) => {
        if (err) {
            console.error('Error updating profile:', err);
            return res.status(500).send('Error updating profile.');
        }
        res.send('Profile updated successfully'); // Respond to the frontend
    });
});




//-----------------------------------------------------------Serve patient.html page--------------------------------------
app.get('/patient', (req, res) => {
    if (!req.session.adminId) {  // Check for either patientId or adminId
        return res.redirect('/login'); // Redirect to login if not authenticated
    }

    const filePath = path.join(__dirname, 'patient.html');
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.status(500).send('Error loading patient.html');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data); // Serve the patient page
        }
    });
});

// Fetch all patients
app.get('/fetch-patients', authenticateToken,(req, res) => {
    const patientId = req.user.id; // Assuming the patient's ID is stored in the JWT payload.
    const role = req.user.role;    // Assuming role (admin or undefined for patient) is stored in the JWT payload.

    // Check if the user is a patient or admin based on the role
    let userRole;
    if (role && role === 'admin') {
        userRole = 'admin';
        console.log("Admin:",req.user.role)
    } else if (patientId) {
        userRole = 'patient';
        console.log("Patient:",req.user.id)
        return res.status(403).send('Forbidden'); // If neither role nor patientId is found, block access
    } 


    const sql = 'SELECT id, first_name, last_name, email, phone, date_of_birth, gender, address FROM Patients';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length > 0) {
            res.json(results); // Send the array of patients
        } else {
            res.status(404).json({ success: false, message: 'No patients found.' });
        }
    });
});








// Endpoint to add a new doctor-------------------------------------DOCTOR-----------------------------------------
// Serve doctor.html page
app.get('/doctor', (req, res) => {
    if (!req.session.patientId && !req.session.adminId) {  // Check for either patientId or adminId
        return res.redirect('/login'); // Redirect to login if not authenticated
    }


    // Determine user type based on session ID
    const userType = req.session.adminId ? 'admin' : 'patient';

    const filePath = path.join(__dirname, 'doctor.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error loading doctor.html');
        }

        // Inject the userType variable into the HTML
        const modifiedData = data.replace(
            '</head>',
            `<script>var userType = "${userType}";</script></head>`
        );

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(modifiedData); // Serve the modified HTML with userType injected
    });
});

// Fetch doctors
app.get('/fetch-doctors', authenticateToken, (req, res) => {

    const patientId = req.user.id; // Assuming the patient's ID is stored in the JWT payload.
    const role = req.user.role;    // Assuming role (admin or undefined for patient) is stored in the JWT payload.

    // Check if the user is a patient or admin based on the role
    let userRole;
    if (role && role === 'admin') {
        userRole = 'admin';
        console.log("Admin:",req.user.role)
    } else if (patientId) {
        userRole = 'patient';
        console.log("Patient:",req.user.id)
    } else {
        return res.status(403).send('Forbidden'); // If neither role nor patientId is found, block access
    }


    const sql = 'SELECT id, first_name, last_name, specialization, email, phone, schedule FROM Doctors';

    db.query(sql, (err, rows) => {
        if (err) {
            return res.status(500).send('Error fetching doctors data.');
        }

        console.log('Fetched doctors data:', rows);

        if (rows.length > 0) {
            res.json(rows); // Send the array of doctors
        } else {
            res.status(404).send('No doctors found.');
        }
    });
});

//Add Doctor
app.post('/add-doctor', authenticateToken,(req, res) => {

    const role = req.user.role;    // Assuming role (admin or undefined for patient) is stored in the JWT payload.

    // Check if the user is a patient or admin based on the role
    let userRole;
    if (role && role === 'admin') {
        userRole = 'admin';
    }
     else {
        return res.status(403).send('Forbidden'); // If neither role nor patientId is found, block access
    }

    const { firstName, lastName, specialization, email, phone, schedule } = req.body;

    // Initialize an array to store validation errors
    let validationErrors = [];

    // Validate the input data
    if (!firstName) validationErrors.push({ field: 'firstName', message: 'First name is required.' });
    if (!lastName) validationErrors.push({ field: 'lastName', message: 'Last name is required.' });
    if (!specialization) validationErrors.push({ field: 'specialization', message: 'Specialization is required.' });
    if (!email) validationErrors.push({ field: 'email', message: 'Email is required.' });
    if (!phone) validationErrors.push({ field: 'phone', message: 'Phone number is required.' });
    if (!schedule) validationErrors.push({ field: 'schedule', message: 'Schedule is required.' });

    // If there are validation errors, send them as a JSON response
    if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
    }

    // SQL query to insert a new doctor
    const sql = `INSERT INTO Doctors (first_name, last_name, specialization, email, phone, schedule) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sql, [firstName, lastName, specialization, email, phone, schedule], (err, result) => {
        if (err) {
            console.error('Error inserting doctor:', err);
            return res.status(500).json({ message: 'Error adding new doctor.' });
        }

        // Return success response
        res.status(201).json({ message: 'Doctor added successfully!' });
    });
});

//update doctors
app.put('/update-doctor/:id', authenticateToken, (req, res) => {
    const userRole = req.user.role;    // Role is available if it's an admin

    // Ensure that only admins can update doctors
    if (userRole && userRole === 'admin') {
        const { id } = req.params;
        const { firstName, lastName, specialization, email, phone, schedule } = req.body;

        const sql = `UPDATE Doctors SET first_name = ?, last_name = ?, specialization = ?, email = ?, phone = ?, schedule = ? WHERE id = ?`;

        db.query(sql, [firstName, lastName, specialization, email, phone, schedule, id], (err, result) => {
            if (err) {
                console.error('Error updating doctor:', err);
                return res.status(500).json({ message: 'Error updating doctor.' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Doctor not found.' });
            }

            res.status(200).json({ message: 'Doctor updated successfully!' });
        });
    } else {
        return res.status(403).send('Forbidden: Only admins can update doctor data.');
    }
});








// ----------------------------------------------------Serve appointment.html page----------------------------
app.get('/appointment', (req, res) => {
    if (!req.session.patientId && !req.session.adminId) {  // Check for either patientId or adminId
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    const filePath = path.join(__dirname, 'appointment.html');
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.status(500).send('Error loading appointment.html');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data); // Serve the appointment page
        }
    });
});


// Fetch all appointments
app.get('/fetch-appointments', authenticateToken, (req, res) => {
    const patientId = req.user.id; // Assuming the patient's ID is stored in the JWT payload as 'id'
    const role = req.user.role;    // Assuming role (admin or undefined for patient) is stored in the JWT payload

    // Check if the user is a patient or admin based on the token payload
    if (role && role === 'admin') {
        // Fetch all appointments for admin
        const sql = `
            SELECT 
                appointments.id, 
                appointments.patient_id, 
                patients.first_name AS patient_firstname,
                patients.last_name AS patient_lastname,
                appointments.doctor_id,
                doctors.first_name AS doctor_firstname, 
                doctors.last_name AS doctor_lastname, 
                appointments.appointment_date, 
                appointments.appointment_time,
                appointments.status
            FROM 
                appointments
            JOIN 
                patients ON appointments.patient_id = patients.id
            JOIN 
                doctors ON appointments.doctor_id = doctors.id;
        `;

        db.query(sql, (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            res.json(results);
        });

    } else if (patientId) {
        // Fetch appointments specific to the patient
        const query = `
            SELECT 
                appointments.id, 
                appointments.patient_id, 
                patients.first_name AS patient_firstname,
                patients.last_name AS patient_lastname,
                appointments.doctor_id,
                doctors.first_name AS doctor_firstname, 
                doctors.last_name AS doctor_lastname, 
                appointments.appointment_date, 
                appointments.appointment_time,
                appointments.status
            FROM 
                appointments
            JOIN 
                patients ON appointments.patient_id = patients.id
            JOIN 
                doctors ON appointments.doctor_id = doctors.id
            WHERE 
                appointments.patient_id = ?;
        `;

        db.query(query, [patientId], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            res.json(results);
        });

    } else {
        // If neither role nor patientId is found, block access
        res.status(403).json({ success: false, message: 'Forbidden' });
    }
});




// Fetch specific appointment by ID
app.get('/get-appointment/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM Appointments WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        res.json(results[0]);
    });
});

// Create Appointment
app.post('/create-appointment', authenticateToken, (req, res) => {
    const { role, id: patientId } = req.user; // Extract role and patientId from token payload

    // Only allow patients (non-admin users) to create appointments
    if (role === 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden: Only patients can create appointments' });
    }

    try {
        const { doctorId, appointmentDate, appointmentTime, status } = req.body;

        // Validate input data
        if (!doctorId || !appointmentDate || !appointmentTime || !status) {
            return res.status(400).json({ success: false, message: 'Invalid request data' });
        }

        // Check if the provided doctor ID exists
        db.query('SELECT id FROM Doctors WHERE id = ?', [doctorId], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            if (result.length === 0) {
                return res.status(400).json({ success: false, message: 'Invalid doctor ID' });
            }

            // Insert the new appointment
            const sql = 'INSERT INTO Appointments SET ?';
            const values = {
                patient_id: patientId, // Use the patient's ID from the token
                doctor_id: doctorId,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                status
            };

            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, message: 'Error creating appointment' });
                }
                res.json({ success: true, message: 'Appointment created successfully' });
            });
        });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


// Update appointment by ID
// Update Appointment
app.put('/update-appointment/:id', authenticateToken, (req, res) => {
    const { id } = req.params; // Appointment ID from URL
    const { role, id: userId } = req.user; // Extract role and user ID from token
    const { patientId, doctorId, appointmentDate, appointmentTime, status } = req.body;

    // Define the query for updating the appointment
    const sql = 'UPDATE Appointments SET patient_id = ?, doctor_id = ?, appointment_date = ?, appointment_time = ?, status = ? WHERE id = ?';
    const values = [patientId, doctorId, appointmentDate, appointmentTime, status, id];

    // If the user is an admin, proceed with the update
    if (role === 'admin') {
        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Error updating appointment' });
            }
            res.json({ success: true, message: 'Appointment updated successfully' });
        });
    } 
    // If the user is a patient, ensure they are only updating their own appointments
    else {
        const checkPatientQuery = 'SELECT patient_id FROM Appointments WHERE id = ?';
        
        db.query(checkPatientQuery, [id], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            
            // Check if the patient is updating their own appointment
            if (results.length > 0 && results[0].patient_id === userId) {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ success: false, message: 'Error updating appointment' });
                    }
                    res.json({ success: true, message: 'Appointment updated successfully' });
                });
            } else {
                res.status(403).json({ success: false, message: 'Forbidden: You can only update your own appointments' });
            }
        });
    }
});







// Handle logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('sessionId'); // Clear any session cookies
        res.redirect('/login'); // Redirect to login page after logout
    });
});




// Serve the CSS files dynamically
app.get('/:fileName.css', (req, res) => {
    const cssPath = path.join(__dirname, req.params.fileName + '.css');
    fs.readFile(cssPath, (err, data) => {
        if (err) {
            res.status(500).send(`Error loading ${req.params.fileName}.css`);
        } else {
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(data);
        }
    });
});


// Handle invalid routes
app.get('*', (req, res) => {
    res.status(404).send('Page not found');
});




/* Listen on port 3000
app.listen(3000, () => {
    console.log('Server is running on https://localhost:3000/index');
});*/

// Start the HTTPS server
https.createServer(sslOptions, app).listen(3000, () => {
    console.log('HTTPS Server running at https://localhost:3000');
});








// --------------------------------------------------Create the server-----------------------------------------------




// --------------------------------------------------SQL QUERIES-----------------------------------------------

