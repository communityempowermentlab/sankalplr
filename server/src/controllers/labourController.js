const pool = require('../config/db');
const { logSystemActivity } = require('../utils/systemLogger');

exports.addPatient = async (req, res) => {
    try {
        const data = req.body;

        const safeData = {};
        const allFields = ["observation_date", "case_id", "patient_name", "facility", "shift", "admission_date", "admission_time", "gravida", "parity", "gestational_age", "triage_under_30_min", "risk_status", "fhr_monitored", "abnormal_fhr_action", "partograph_filled", "ancs_given", "dose_count", "labour_augmentation", "indication_documented", "oxytocin_monitoring", "augmentation_appropriate", "fundal_pressure_applied", "complications_developed", "complication_type", "complication_description", "complication_managed", "senior_support_sought", "referral_status", "referral_delay", "delivery_mode", "csection_indication", "csection_indication_other", "assistant_name", "anesthetist_name", "outcome_of_labour", "gender_of_baby", "baby_cried_immediately", "episiotomy_given", "episiotomy_appropriate", "amtsl_followed", "av_oxytocin", "av_placenta", "eye_drops_given", "initiation_of_breastfeeding", "baby_stable", "baby_dried", "immediate_skin_to_skin", "delayed_cord_clamping", "baby_cried", "stimulation_if_no_cry", "bag_mask_if_needed", "early_breastfeeding", "clean_practices", "birth_weight_taken", "birth_weight_gms", "vit_k_given", "kmc_required", "mother_counselled_kmc", "kmc_given", "kmc_duration_lr", "kmc_provider", "newborn_resuscitated", "ref_nicu_sncu", "outcome_of_baby", "any_other_comments", "timeOfDecision", "timeOfIncision", "dti_interval", "is_timely", "delay_reason"];
        for (const field of allFields) {
            safeData[field] = (data[field] === undefined || data[field] === '') ? null : data[field];
        }

        const query = `
            INSERT INTO PatientRecords (
                observation_date, case_id, patient_name, facility, shift, admission_date, admission_time, gravida, parity, gestational_age, triage_under_30_min, risk_status, fhr_monitored, abnormal_fhr_action, partograph_filled, ancs_given, dose_count, labour_augmentation, indication_documented, oxytocin_monitoring, augmentation_appropriate, fundal_pressure_applied, complications_developed, complication_type, complication_description, complication_managed, senior_support_sought, referral_status, referral_delay, delivery_mode, csection_indication, csection_indication_other, assistant_name, anesthetist_name, outcome_of_labour, gender_of_baby, baby_cried_immediately, episiotomy_given, episiotomy_appropriate, amtsl_followed, av_oxytocin, av_placenta, eye_drops_given, initiation_of_breastfeeding, baby_stable, baby_dried, immediate_skin_to_skin, delayed_cord_clamping, baby_cried, stimulation_if_no_cry, bag_mask_if_needed, early_breastfeeding, clean_practices, birth_weight_taken, birth_weight_gms, vit_k_given, kmc_required, mother_counselled_kmc, kmc_given, kmc_duration_lr, kmc_provider, newborn_resuscitated, ref_nicu_sncu, outcome_of_baby, any_other_comments, timeOfDecision, timeOfIncision, dti_interval, is_timely, delay_reason, created_by
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `;

        const values = allFields.map(f => safeData[f]);
        values.push(req.user ? req.user.id : null); // Append matched user id
        const [result] = await pool.execute(query, values);

        if (req.user) {
            const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            // Global System Activity Log
            await logSystemActivity(
                req.user.id,
                req.user.name || req.user.username,
                req.user.role_type,
                'Patient Records',
                `Added new patient record for ${data.patient_name || 'Unknown Patient'}`,
                ipAddress,
                data.case_id
            );
        }

        res.status(201).json({ message: 'Patient record created successfully', patientId: result.insertId });
    } catch (error) {
        console.error('Error in addPatient:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'This Case ID already exists. Please use a unique Case ID.', error: error.message });
        }
        res.status(500).json({ message: 'Error saving patient record', error: error.message });
    }
};

exports.updatePatient = async (req, res) => {
    try {
        const patientId = req.params.id;
        const data = req.body;

        const safeData = {};
        const allFields = ["observation_date", "case_id", "patient_name", "facility", "shift", "admission_date", "admission_time", "gravida", "parity", "gestational_age", "triage_under_30_min", "risk_status", "fhr_monitored", "abnormal_fhr_action", "partograph_filled", "ancs_given", "dose_count", "labour_augmentation", "indication_documented", "oxytocin_monitoring", "augmentation_appropriate", "fundal_pressure_applied", "complications_developed", "complication_type", "complication_description", "complication_managed", "senior_support_sought", "referral_status", "referral_delay", "delivery_mode", "csection_indication", "csection_indication_other", "assistant_name", "anesthetist_name", "outcome_of_labour", "gender_of_baby", "baby_cried_immediately", "episiotomy_given", "episiotomy_appropriate", "amtsl_followed", "av_oxytocin", "av_placenta", "eye_drops_given", "initiation_of_breastfeeding", "baby_stable", "baby_dried", "immediate_skin_to_skin", "delayed_cord_clamping", "baby_cried", "stimulation_if_no_cry", "bag_mask_if_needed", "early_breastfeeding", "clean_practices", "birth_weight_taken", "birth_weight_gms", "vit_k_given", "kmc_required", "mother_counselled_kmc", "kmc_given", "kmc_duration_lr", "kmc_provider", "newborn_resuscitated", "ref_nicu_sncu", "outcome_of_baby", "any_other_comments", "timeOfDecision", "timeOfIncision", "dti_interval", "is_timely", "delay_reason"];

        for (const field of allFields) {
            safeData[field] = (data[field] === undefined || data[field] === '') ? null : data[field];
        }

        const setClause = allFields.map(f => `${f} = ?`).join(', ');
        const query = `UPDATE PatientRecords SET ${setClause} WHERE id = ?`;

        const values = allFields.map(f => safeData[f]);
        values.push(patientId);

        const [result] = await pool.execute(query, values);

        if (req.user) {
            const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            await logSystemActivity(
                req.user.id,
                req.user.name || req.user.username,
                req.user.role_type,
                'Patient Records',
                `Updated patient record for ${data.patient_name || 'Unknown Patient'} (Case ID: ${data.case_id})`,
                ipAddress,
                data.case_id
            );
        }

        res.status(200).json({ message: 'Patient record updated successfully' });
    } catch (error) {
        console.error('Error in updatePatient:', error);
        res.status(500).json({ message: 'Error updating patient record', error: error.message });
    }
};

exports.getPatients = async (req, res) => {
    try {
        let query = `
            SELECT p.*, u.name AS added_by_name 
            FROM PatientRecords p
            LEFT JOIN Users u ON p.created_by = u.id
        `;
        let values = [];

        // If user is Staff (role_type 2), only fetch their own records
        if (req.user && req.user.role_type === 2) {
            query += ` WHERE p.created_by = ?`;
            values.push(req.user.id);
        }

        query += ` ORDER BY p.created_at DESC;`;

        const [rows] = await pool.execute(query, values);

        // Map database fields to what the frontend expects, keeping all raw fields.
        const formattedRows = rows.map(r => ({
            ...r,
            id: r.id,
            name: r.patient_name,
            age: 'N/A', // No age field in DB
            regDate: r.admission_date,
            admDate: r.observation_date,
            facility: r.facility,
            status: r.outcome_of_labour || 'N/A',
            risk: r.risk_status || 'N/A',
            gest: r.gestational_age || 'N/A',
            mode: r.delivery_mode || 'N/A',
            staff: 'None', // No specific staff assignment field in Add Patient form
            babyWt: (r.birth_weight_taken && r.birth_weight_gms) ? `${r.birth_weight_taken} ${r.birth_weight_gms}` : 'N/A',
            updatedAt: r.created_at,
            addedBy: r.added_by_name || 'System',
            createdBy: r.created_by,
            notes: r.any_other_comments || 'N/A'
        }));

        res.status(200).json(formattedRows);
    } catch (error) {
        console.error("Error fetching patients:", error);
        res.status(500).json({ message: 'Error fetching patient records', error: error.message });
    }
};

exports.checkCaseId = async (req, res) => {
    try {
        const { case_id } = req.query;
        if (!case_id) return res.status(400).json({ message: 'Missing case_id' });

        const [rows] = await pool.execute('SELECT id FROM PatientRecords WHERE case_id = ?', [case_id]);
        if (rows.length > 0) {
            return res.status(200).json({ exists: true });
        }
        res.status(200).json({ exists: false });
    } catch (error) {
        console.error("Error checking case id:", error);
        res.status(500).json({ message: 'Error checking case id', error: error.message });
    }
};
