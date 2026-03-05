const fs = require('fs');
const pool = require('./server/src/config/db');

const mappings = {
    q1: 'observation_date', q2: 'case_id', q3: 'patient_name', q4: 'facility', q5: 'shift', q7: 'admission_date', q8: 'admission_time',
    q9: 'gravida', q10: 'parity', q11: 'gestational_age', q12: 'triage_under_30_min', q13: 'risk_status', q14: 'fhr_monitored', q15: 'abnormal_fhr_action', q16: 'partograph_filled', q17: 'ancs_given', q18: 'dose_count',
    q19: 'labour_augmentation', q20: 'indication_documented', q21: 'oxytocin_monitoring', q22: 'augmentation_appropriate', q23: 'fundal_pressure_applied',
    q24: 'complications_developed', q25: 'complication_type', q26: 'complication_description', q27: 'complication_managed', q28: 'senior_support_sought', q29: 'referral_status', q30: 'referral_delay',
    q31: 'delivery_mode', q32: 'csection_indication', q33: 'csection_indication_other', q34: 'assistant_name', q35: 'anesthetist_name', q36: 'outcome_of_labour', q37: 'gender_of_baby',
    q38: 'baby_cried_immediately', q39: 'episiotomy_given', q40: 'episiotomy_appropriate', q41: 'amtsl_followed', q42: 'eye_drops_given', q43: 'initiation_of_breastfeeding',
    q44: 'baby_stable', q45: 'baby_dried', q46: 'immediate_skin_to_skin', q47: 'delayed_cord_clamping', q48: 'baby_cried', q49: 'stimulation_if_no_cry', q50: 'bag_mask_if_needed', q51: 'early_breastfeeding', q52: 'clean_practices',
    q53: 'birth_weight_taken', q54: 'birth_weight_gms', q55: 'vit_k_given', q56: 'kmc_required', q57: 'mother_counselled_kmc', q58: 'kmc_given', q59: 'kmc_duration_lr', q60: 'kmc_provider',
    q61: 'newborn_resuscitated', q62: 'ref_nicu_sncu', q63: 'outcome_of_baby', q64: 'any_other_comments'
};

const keys = Object.values(mappings);
const calcFields = ['timeOfDecision', 'timeOfIncision', 'dti_interval', 'is_timely', 'delay_reason'];
const allFields = [...keys, ...calcFields];

let sqlContent = `USE sankalplr;

DROP TABLE IF EXISTS PatientRecords;
CREATE TABLE PatientRecords (
    id INT AUTO_INCREMENT PRIMARY KEY,
${allFields.map(f => `    ${f} TEXT`).join(',\n')},
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

fs.writeFileSync('./create_patient_records.sql', sqlContent);

async function run() {
    try {
        await pool.query('DROP TABLE IF EXISTS PatientRecords;');
        const createQuery = `CREATE TABLE PatientRecords (
            id INT AUTO_INCREMENT PRIMARY KEY,
        ${allFields.map(f => `    ${f} TEXT`).join(',\n')},
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`;
        await pool.query(createQuery);
        console.log('Successfully dropped and recreated PatientRecords table mapping perfectly with all frontend inputs as VARCHAR(255).');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        pool.end();
    }
}
run();
