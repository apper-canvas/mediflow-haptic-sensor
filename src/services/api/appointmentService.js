import { toast } from 'react-toastify';

class AppointmentService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'appointment_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "id_c"}},
          {"field": {"Name": "patient_id_c"}},
          {"field": {"Name": "doctor_id_c"}},
          {"field": {"Name": "department_c"}},
          {"field": {"Name": "date_time_c"}},
          {"field": {"Name": "duration_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      // Transform database fields to UI format
      return response.data.map(appointment => ({
        Id: appointment.Id,
        id: appointment.id_c || '',
        patientId: appointment.patient_id_c || '',
        doctorId: appointment.doctor_id_c || '',
        department: appointment.department_c || '',
        dateTime: appointment.date_time_c || '',
        duration: appointment.duration_c || 30,
        type: appointment.type_c || '',
        status: appointment.status_c || '',
        notes: appointment.notes_c || ''
      }));
    } catch (error) {
      console.error("Error fetching appointments:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "id_c"}},
          {"field": {"Name": "patient_id_c"}},
          {"field": {"Name": "doctor_id_c"}},
          {"field": {"Name": "department_c"}},
          {"field": {"Name": "date_time_c"}},
          {"field": {"Name": "duration_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}}
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
        patientId: response.data.patient_id_c || '',
        doctorId: response.data.doctor_id_c || '',
        department: response.data.department_c || '',
        dateTime: response.data.date_time_c || '',
        duration: response.data.duration_c || 30,
        type: response.data.type_c || '',
        status: response.data.status_c || '',
        notes: response.data.notes_c || ''
      };
    } catch (error) {
      console.error(`Error fetching appointment ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async create(appointmentData) {
    try {
      const timestamp = Date.now();
      const appointmentId = `A${String(timestamp).slice(-3)}`;
      
      const params = {
        records: [
          {
            // Only include Updateable fields
            id_c: appointmentId,
            patient_id_c: appointmentData.patientId || '',
            doctor_id_c: appointmentData.doctorId || '',
            department_c: appointmentData.department || '',
            date_time_c: appointmentData.dateTime || '',
            duration_c: appointmentData.duration || 30,
            type_c: appointmentData.type || '',
            status_c: appointmentData.status || 'Scheduled',
            notes_c: appointmentData.notes || ''
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
          console.error(`Failed to create ${failed.length} appointment records:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const created = successful[0].data;
          return {
            Id: created.Id,
            id: created.id_c || appointmentId,
            patientId: created.patient_id_c || appointmentData.patientId,
            doctorId: created.doctor_id_c || appointmentData.doctorId,
            department: created.department_c || appointmentData.department,
            dateTime: created.date_time_c || appointmentData.dateTime,
            duration: created.duration_c || appointmentData.duration,
            type: created.type_c || appointmentData.type,
            status: created.status_c || appointmentData.status,
            notes: created.notes_c || appointmentData.notes
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating appointment:", error?.response?.data?.message || error);
      return null;
    }
  }

  async update(id, appointmentData) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id),
            // Only include Updateable fields
            id_c: appointmentData.id,
            patient_id_c: appointmentData.patientId,
            doctor_id_c: appointmentData.doctorId,
            department_c: appointmentData.department,
            date_time_c: appointmentData.dateTime,
            duration_c: appointmentData.duration,
            type_c: appointmentData.type,
            status_c: appointmentData.status,
            notes_c: appointmentData.notes
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
          console.error(`Failed to update ${failed.length} appointment records:${JSON.stringify(failed)}`);
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
            patientId: updated.patient_id_c || '',
            doctorId: updated.doctor_id_c || '',
            department: updated.department_c || '',
            dateTime: updated.date_time_c || '',
            duration: updated.duration_c || 30,
            type: updated.type_c || '',
            status: updated.status_c || '',
            notes: updated.notes_c || ''
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating appointment:", error?.response?.data?.message || error);
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
          console.error(`Failed to delete ${failed.length} appointment records:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        return successful.length > 0;
      }
      return false;
    } catch (error) {
      console.error("Error deleting appointment:", error?.response?.data?.message || error);
      return false;
    }
  }

  async getByDateRange(startDate, endDate) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "id_c"}},
          {"field": {"Name": "patient_id_c"}},
          {"field": {"Name": "doctor_id_c"}},
          {"field": {"Name": "department_c"}},
          {"field": {"Name": "date_time_c"}},
          {"field": {"Name": "duration_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}}
        ],
        where: [
          {"FieldName": "date_time_c", "Operator": "GreaterThanOrEqualTo", "Values": [startDate]},
          {"FieldName": "date_time_c", "Operator": "LessThanOrEqualTo", "Values": [endDate]}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data.map(appointment => ({
        Id: appointment.Id,
        id: appointment.id_c || '',
        patientId: appointment.patient_id_c || '',
        doctorId: appointment.doctor_id_c || '',
        department: appointment.department_c || '',
        dateTime: appointment.date_time_c || '',
        duration: appointment.duration_c || 30,
        type: appointment.type_c || '',
        status: appointment.status_c || '',
        notes: appointment.notes_c || ''
      }));
    } catch (error) {
      console.error("Error fetching appointments by date range:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getByDepartment(department) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "id_c"}},
          {"field": {"Name": "patient_id_c"}},
          {"field": {"Name": "doctor_id_c"}},
          {"field": {"Name": "department_c"}},
          {"field": {"Name": "date_time_c"}},
          {"field": {"Name": "duration_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}}
        ],
        where: [{"FieldName": "department_c", "Operator": "EqualTo", "Values": [department]}]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data.map(appointment => ({
        Id: appointment.Id,
        id: appointment.id_c || '',
        patientId: appointment.patient_id_c || '',
        doctorId: appointment.doctor_id_c || '',
        department: appointment.department_c || '',
        dateTime: appointment.date_time_c || '',
        duration: appointment.duration_c || 30,
        type: appointment.type_c || '',
        status: appointment.status_c || '',
        notes: appointment.notes_c || ''
      }));
    } catch (error) {
      console.error("Error fetching appointments by department:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getTodaysAppointments() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const startOfDay = `${today}T00:00:00Z`;
      const endOfDay = `${today}T23:59:59Z`;
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "id_c"}},
          {"field": {"Name": "patient_id_c"}},
          {"field": {"Name": "doctor_id_c"}},
          {"field": {"Name": "department_c"}},
          {"field": {"Name": "date_time_c"}},
          {"field": {"Name": "duration_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}}
        ],
        where: [
          {"FieldName": "date_time_c", "Operator": "GreaterThanOrEqualTo", "Values": [startOfDay]},
          {"FieldName": "date_time_c", "Operator": "LessThanOrEqualTo", "Values": [endOfDay]}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data.map(appointment => ({
        Id: appointment.Id,
        id: appointment.id_c || '',
        patientId: appointment.patient_id_c || '',
        doctorId: appointment.doctor_id_c || '',
        department: appointment.department_c || '',
        dateTime: appointment.date_time_c || '',
        duration: appointment.duration_c || 30,
        type: appointment.type_c || '',
        status: appointment.status_c || '',
        notes: appointment.notes_c || ''
      }));
    } catch (error) {
      console.error("Error fetching today's appointments:", error?.response?.data?.message || error);
      return [];
    }
  }
}

export default new AppointmentService();
export default new AppointmentService();