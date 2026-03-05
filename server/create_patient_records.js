const pool = require('./src/config/db');

async function createTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS PatientRecords (
                id INT AUTO_INCREMENT PRIMARY KEY,
                q1 DATE COMMENT 'Admission Date',
                q2 TIME COMMENT 'Admission Time',
                q3 VARCHAR(255) COMMENT 'Patient Name',
                q4 INT COMMENT 'Age',
                q5 VARCHAR(255) COMMENT 'Address',
                q7 DATE COMMENT 'LMP',
                q8 DATE COMMENT 'EDD',
                q9 VARCHAR(255) COMMENT 'Facility Name',
                q10 VARCHAR(50) COMMENT 'Mode of Admission',
                q11 VARCHAR(50) COMMENT 'Gestational Age',
                q12 INT COMMENT 'Gravida',
                q13 INT COMMENT 'Para',
                q14 INT COMMENT 'Living',
                q15 INT COMMENT 'Abortion',
                q16 VARCHAR(255) COMMENT 'High Risk Factor',
                q17 VARCHAR(50) COMMENT 'Steroid Given',
                q18 VARCHAR(50) COMMENT 'Steroid Administered At',
                q19 DECIMAL(5,2) COMMENT 'Height',
                q20 DECIMAL(5,2) COMMENT 'Weight',
                q21 VARCHAR(255) COMMENT 'Blood Group',
                q22 DECIMAL(5,2) COMMENT 'Hemoglobin',
                q23 VARCHAR(50) COMMENT 'HIV Status',
                q24 VARCHAR(50) COMMENT 'VDRL/RPR Status',
                q25 VARCHAR(255) COMMENT 'FHS at Admission',
                q26 VARCHAR(255) COMMENT 'Cervical Dilatation',
                q27 VARCHAR(50) COMMENT 'Complications at Admission',
                q28 VARCHAR(255) COMMENT 'Pre-Eclampsia Management',
                q29 VARCHAR(255) COMMENT 'Eclampsia Management',
                q30 VARCHAR(255) COMMENT 'Obstructed Labour Management',
                q31 VARCHAR(50) COMMENT 'Decision Taken',
                q32 VARCHAR(255) COMMENT 'Reason for C-Section',
                q33 VARCHAR(50) COMMENT 'Who performed delivery',
                q34 VARCHAR(255) COMMENT 'Assistant Name',
                q35 VARCHAR(255) COMMENT 'Anesthetist Name',
                q36 VARCHAR(255) COMMENT 'Outcome of Labour',
                q37 VARCHAR(50) COMMENT 'Gender of Baby',
                timeOfDecision TIME COMMENT 'Time of Decision',
                timeOfIncision TIME COMMENT 'Time of Incision',
                dti_interval VARCHAR(50) COMMENT 'DTI Interval',
                is_timely VARCHAR(50) COMMENT 'Timely',
                delay_reason TEXT COMMENT 'Delay Reason',
                q38 VARCHAR(50) COMMENT 'Baby Cried Immediately',
                q39 VARCHAR(50) COMMENT 'Resuscitation Required',
                q40 VARCHAR(255) COMMENT 'Resuscitation Steps',
                q41 VARCHAR(50) COMMENT 'Vitamin K Given',
                q42 VARCHAR(50) COMMENT 'Eye Drops Given',
                q43 VARCHAR(50) COMMENT 'Initiation of Breastfeeding',
                q44 DECIMAL(5,2) COMMENT 'Birth Weight',
                q45 VARCHAR(50) COMMENT 'Birth Weight Unit',
                q46 VARCHAR(50) COMMENT 'Condition of Mother',
                q47 VARCHAR(255) COMMENT 'Postpartum Hemorrhage',
                q48 VARCHAR(255) COMMENT 'Other Maternal Complications',
                q49 VARCHAR(255) COMMENT 'Condition of Baby',
                q50 VARCHAR(255) COMMENT 'NICU Admission',
                q51 VARCHAR(255) COMMENT 'NICU Reason',
                q52 VARCHAR(255) COMMENT 'Discharge Status',
                q53 DATE COMMENT 'Discharge Date',
                q54 TIME COMMENT 'Discharge Time',
                q55 VARCHAR(255) COMMENT 'Advice on Discharge',
                q56 VARCHAR(255) COMMENT 'Family Planning Advice',
                q57 VARCHAR(255) COMMENT 'Follow-up Date',
                q58 VARCHAR(255) COMMENT 'PNC Checkup',
                q59 VARCHAR(255) COMMENT 'Immunization Given',
                q60 VARCHAR(255) COMMENT 'Danger Signs Explained',
                q61 VARCHAR(255) COMMENT 'Staff Name',
                q62 VARCHAR(255) COMMENT 'Staff Designation',
                q63 DATE COMMENT 'Record Date',
                q64 TIME COMMENT 'Record Time',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Table PatientRecords created successfully.");
    } catch (error) {
        console.error("Error creating table:", error);
    } finally {
        pool.end();
    }
}

createTable();
