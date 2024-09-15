CREATE DATABASE hospital_db;
USE hospital_db;

CREATE TABLE Patients(
PatientID INT PRIMARY KEY AUTO_INCREMENT,
FisrtName VARCHAR(255) NOT NULL,
LastName VARCHAR(255) NOT NULL,
DateOfBirth DATE NOT NULL,
Gender VARCHAR(255),
Language VARCHAR(255)
);


CREATE TABLE Providers(
ProviderID INT PRIMARY KEY AUTO_INCREMENT,
FisrtName VARCHAR(255) NOT NULL,
LastName VARCHAR(255) NOT NULL,
ProviiderSpeciality VARCHAR(255) NOT NULL,
Email VARCHAR(255),
PhoneNO VARCHAR(255),
DateJoined DATE NOT NULL
);

CREATE TABLE Visits(
VisitID INT PRIMARY KEY AUTO_INCREMENT,
PatientID INT,
ProviderID INT,
DateOfVisit DATE NOT NULL,
DateScheduled DATE NOT NULL,
VisitDepartmentID INT NOT NULL,
VisitType VARCHAR(255) NOT NULL,
BloodPressureSystollic INT,
BloodPressureDiastollic decimal,
Pulse decimal,
VisitStatus VARCHAR(255) NOT NULL,

FOREIGN KEY (PatientID) REFERENCES Patients(PatientID),
FOREIGN KEY (ProviderID) REFERENCES Providers(ProviderID)
);

CREATE TABLE Ed_Visits(
EdVisitID INT PRIMARY KEY AUTO_INCREMENT,
VisitID INT,
PatientID INT,
Acuity INT NOT NULL,
ReasonForVisit Varchar(255) NOT NULL,
Disposition Varchar(255) NULL,

FOREIGN KEY (PatientID) REFERENCES Patients(PatientID),
FOREIGN KEY (VisitID) REFERENCES Visits(VisitID)
);

CREATE TABLE Admissions(
AdmissionID INT PRIMARY KEY AUTO_INCREMENT,
PatientID INT,
AdmissionDate DATE NOT NULL,
DischargeDate DATE NOT NULL,
DischargeDisposition Varchar(255) NULL,
Service VARCHAR(255) NOT NULL,
PrimaryDiagnosis VARCHAR(255) NOT NULL,

FOREIGN KEY (PatientID) REFERENCES Patients(PatientID)
);

CREATE TABLE Discharges(
DischargeID INT PRIMARY KEY AUTO_INCREMENT,
AdmissionID INT,
PatientID INT,
DischargeDate DATE NOT NULL,
DischargeDisposition Varchar(255) NULL,

FOREIGN KEY (PatientID) REFERENCES Patients(PatientID),
FOREIGN KEY (AdmissionID) REFERENCES Admissions(AdmissionID)
);



Part 1: Basic Data Retrieval
SELECT FirstName, LastName, DateOfBirth
FROM Patients;


1.2: Retrieve the ProviderID, FirstName, and ProviderSpecialty from the Providers table:
SELECT ProviderID, FirstName, ProviderSpecialty
FROM Providers;

Part 2: Pattern-Based Filtering
SELECT FirstName, LastName
FROM Patients
WHERE FirstName LIKE 'Ab%';


2.2) Retrieve all providers whose specialties end with the letter "y":
SELECT ProviderID, FirstName, ProviderSpecialty
FROM Providers
WHERE ProviderSpecialty LIKE '%y';


Part 3: Comparison Operators
SELECT FirstName, LastName, DateOfBirth
FROM Patients
WHERE DateOfBirth > '1980-01-01';


SELECT VisitID, PatientID, Acuity, ReasonForVisit
FROM Ed_Visits
WHERE Acuity >= 2;


Part 4: WHERE Clause with Logical Operators
SELECT FirstName, LastName
FROM Patients
WHERE Language = 'Spanish';


4.2) Retrieve visits where the reason is "Migraine" and the disposition is "Admitted":
SELECT VisitID, PatientID, ReasonForVisit, Disposition
FROM Ed_Visits
WHERE ReasonForVisit = 'Migraine' AND Disposition = 'Admitted';


4.3) Find patients born between 1975 and 1980:
SELECT FirstName, LastName, DateOfBirth
FROM Patients
WHERE DateOfBirth BETWEEN '1975-01-01' AND '1980-12-31';


Part 5: Sorting Data
SELECT FirstName, LastName
FROM Patients
ORDER BY LastName ASC;


5.2) List all visits sorted by the date of the visit, starting from the most recent:
SELECT VisitID, PatientID, DateOfVisit, VisitType
FROM Visits
ORDER BY DateOfVisit DESC;




Part 6: Advanced Filtering
6.1) Retrieve all admissions where the primary diagnosis is "Stroke" and the discharge disposition is "Home":

SELECT AdmissionID, PatientID, PrimaryDiagnosis, DischargeDisposition
FROM Admissions
WHERE PrimaryDiagnosis = 'Stroke' AND DischargeDisposition = 'Home';


Find providers who joined after 1995 and specialize in either Pediatrics or Cardiology:
SELECT ProviderID, FirstName, ProviderSpecialty
FROM Providers
WHERE DateJoined > '1995-01-01' AND ProviderSpecialty IN ('Pediatrics', 'Cardiology');


List all discharges where the patient was discharged home and the discharge date is within the first week of March 2018:
SELECT DischargeID, PatientID, DischargeDate, DischargeDisposition
FROM Discharges
WHERE DischargeDisposition = 'Home' AND DischargeDate BETWEEN '2018-03-01' AND '2018-03-07';
