import { toast } from 'react-toastify';

class PatientService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'patient_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "id_c"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "date_of_birth_c"}},
          {"field": {"Name": "gender_c"}},
          {"field": {"Name": "contact_c"}},
          {"field": {"Name": "emergency_contact_c"}},
          {"field": {"Name": "blood_type_c"}},
          {"field": {"Name": "allergies_c"}},
          {"field": {"Name": "current_ward_c"}},
          {"field": {"Name": "bed_number_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "admission_date_c"}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      // Transform database fields to UI format
      return response.data.map(patient => ({
        Id: patient.Id,
        id: patient.id_c || '',
        name: patient.name_c || '',
        dateOfBirth: patient.date_of_birth_c || '',
        gender: patient.gender_c || '',
        contact: patient.contact_c || '',
        emergencyContact: patient.emergency_contact_c || '',
        bloodType: patient.blood_type_c || '',
        allergies: patient.allergies_c ? patient.allergies_c.split(',').map(a => a.trim()) : [],
        currentWard: patient.current_ward_c || '',
        bedNumber: patient.bed_number_c || '',
        status: patient.status_c || '',
        admissionDate: patient.admission_date_c || ''
      }));
    } catch (error) {
      console.error("Error fetching patients:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "id_c"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "date_of_birth_c"}},
          {"field": {"Name": "gender_c"}},
          {"field": {"Name": "contact_c"}},
          {"field": {"Name": "emergency_contact_c"}},
          {"field": {"Name": "blood_type_c"}},
          {"field": {"Name": "allergies_c"}},
          {"field": {"Name": "current_ward_c"}},
          {"field": {"Name": "bed_number_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "admission_date_c"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response?.data) {
        return null;
      }
      
      // Transform database fields to UI format
      return {
        Id: response.data.Id,
        id: response.data.id_c || '',
        name: response.data.name_c || '',
        dateOfBirth: response.data.date_of_birth_c || '',
        gender: response.data.gender_c || '',
        contact: response.data.contact_c || '',
        emergencyContact: response.data.emergency_contact_c || '',
        bloodType: response.data.blood_type_c || '',
        allergies: response.data.allergies_c ? response.data.allergies_c.split(',').map(a => a.trim()) : [],
        currentWard: response.data.current_ward_c || '',
        bedNumber: response.data.bed_number_c || '',
        status: response.data.status_c || '',
        admissionDate: response.data.admission_date_c || ''
      };
    } catch (error) {
      console.error(`Error fetching patient ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async create(patientData) {
    try {
      const timestamp = Date.now();
      const patientId = `P${String(timestamp).slice(-3)}`;
      
      const params = {
        records: [
          {
            // Only include Updateable fields
            id_c: patientId,
            name_c: patientData.name || '',
            date_of_birth_c: patientData.dateOfBirth || '',
            gender_c: patientData.gender || '',
            contact_c: patientData.contact || '',
            emergency_contact_c: patientData.emergencyContact || '',
            blood_type_c: patientData.bloodType || '',
            allergies_c: Array.isArray(patientData.allergies) ? patientData.allergies.join(', ') : (patientData.allergies || ''),
            current_ward_c: patientData.currentWard || '',
            bed_number_c: patientData.bedNumber || '',
            status_c: patientData.status || 'Stable',
            admission_date_c: patientData.admissionDate || new Date().toISOString().split('T')[0]
          }
        ]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} patient records:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const created = successful[0].data;
          return {
            Id: created.Id,
            id: created.id_c || patientId,
            name: created.name_c || patientData.name,
            dateOfBirth: created.date_of_birth_c || patientData.dateOfBirth,
            gender: created.gender_c || patientData.gender,
            contact: created.contact_c || patientData.contact,
            emergencyContact: created.emergency_contact_c || patientData.emergencyContact,
            bloodType: created.blood_type_c || patientData.bloodType,
            allergies: created.allergies_c ? created.allergies_c.split(',').map(a => a.trim()) : [],
            currentWard: created.current_ward_c || patientData.currentWard,
            bedNumber: created.bed_number_c || patientData.bedNumber,
            status: created.status_c || patientData.status,
            admissionDate: created.admission_date_c || patientData.admissionDate
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating patient:", error?.response?.data?.message || error);
      return null;
    }
  }

  async update(id, patientData) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id),
            // Only include Updateable fields
            id_c: patientData.id,
            name_c: patientData.name,
            date_of_birth_c: patientData.dateOfBirth,
            gender_c: patientData.gender,
            contact_c: patientData.contact,
            emergency_contact_c: patientData.emergencyContact,
            blood_type_c: patientData.bloodType,
            allergies_c: Array.isArray(patientData.allergies) ? patientData.allergies.join(', ') : patientData.allergies,
            current_ward_c: patientData.currentWard,
            bed_number_c: patientData.bedNumber,
            status_c: patientData.status,
            admission_date_c: patientData.admissionDate
          }
        ]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} patient records:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const updated = successful[0].data;
          return {
            Id: updated.Id,
            id: updated.id_c || '',
            name: updated.name_c || '',
            dateOfBirth: updated.date_of_birth_c || '',
            gender: updated.gender_c || '',
            contact: updated.contact_c || '',
            emergencyContact: updated.emergency_contact_c || '',
            bloodType: updated.blood_type_c || '',
            allergies: updated.allergies_c ? updated.allergies_c.split(',').map(a => a.trim()) : [],
            currentWard: updated.current_ward_c || '',
            bedNumber: updated.bed_number_c || '',
            status: updated.status_c || '',
            admissionDate: updated.admission_date_c || ''
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating patient:", error?.response?.data?.message || error);
      return null;
    }
  }

  async delete(id) {
    try {
      const params = { 
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} patient records:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        return successful.length > 0;
      }
      return false;
    } catch (error) {
      console.error("Error deleting patient:", error?.response?.data?.message || error);
      return false;
    }
  }

  async search(query) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "id_c"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "date_of_birth_c"}},
          {"field": {"Name": "gender_c"}},
          {"field": {"Name": "contact_c"}},
          {"field": {"Name": "emergency_contact_c"}},
          {"field": {"Name": "blood_type_c"}},
          {"field": {"Name": "allergies_c"}},
          {"field": {"Name": "current_ward_c"}},
          {"field": {"Name": "bed_number_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "admission_date_c"}}
        ],
        whereGroups: [{
          "operator": "OR",
          "subGroups": [
            {
              "conditions": [
                {"fieldName": "name_c", "operator": "Contains", "values": [query]},
                {"fieldName": "id_c", "operator": "Contains", "values": [query]},
                {"fieldName": "contact_c", "operator": "Contains", "values": [query]}
              ],
              "operator": "OR"
            }
          ]
        }]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data.map(patient => ({
        Id: patient.Id,
        id: patient.id_c || '',
        name: patient.name_c || '',
        dateOfBirth: patient.date_of_birth_c || '',
        gender: patient.gender_c || '',
        contact: patient.contact_c || '',
        emergencyContact: patient.emergency_contact_c || '',
        bloodType: patient.blood_type_c || '',
        allergies: patient.allergies_c ? patient.allergies_c.split(',').map(a => a.trim()) : [],
        currentWard: patient.current_ward_c || '',
        bedNumber: patient.bed_number_c || '',
        status: patient.status_c || '',
        admissionDate: patient.admission_date_c || ''
      }));
    } catch (error) {
      console.error("Error searching patients:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getByStatus(status) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "id_c"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "date_of_birth_c"}},
          {"field": {"Name": "gender_c"}},
          {"field": {"Name": "contact_c"}},
          {"field": {"Name": "emergency_contact_c"}},
          {"field": {"Name": "blood_type_c"}},
          {"field": {"Name": "allergies_c"}},
          {"field": {"Name": "current_ward_c"}},
          {"field": {"Name": "bed_number_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "admission_date_c"}}
        ],
        where: [{"FieldName": "status_c", "Operator": "EqualTo", "Values": [status]}]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data.map(patient => ({
        Id: patient.Id,
        id: patient.id_c || '',
        name: patient.name_c || '',
        dateOfBirth: patient.date_of_birth_c || '',
        gender: patient.gender_c || '',
        contact: patient.contact_c || '',
        emergencyContact: patient.emergency_contact_c || '',
        bloodType: patient.blood_type_c || '',
        allergies: patient.allergies_c ? patient.allergies_c.split(',').map(a => a.trim()) : [],
        currentWard: patient.current_ward_c || '',
        bedNumber: patient.bed_number_c || '',
        status: patient.status_c || '',
        admissionDate: patient.admission_date_c || ''
      }));
    } catch (error) {
      console.error("Error fetching patients by status:", error?.response?.data?.message || error);
      return [];
    }
  }
}

export default new PatientService();