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