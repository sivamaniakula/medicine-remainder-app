const CaregiverPatientLink = require("../models/CaregiverPatientLink");

// Checks that the given caregiver is actually linked to the given patient.
// Used before letting a caregiver view/edit that patient's medications,
// so caregivers can't access patients they aren't linked to.
// Returns true/false; does not send a response itself.
const isCaregiverLinkedToPatient = async (caregiverId, patientId) => {
  const link = await CaregiverPatientLink.findOne({ caregiverId, patientId });
  return !!link;
};

module.exports = { isCaregiverLinkedToPatient };
