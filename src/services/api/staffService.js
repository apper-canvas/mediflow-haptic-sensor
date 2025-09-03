import { toast } from 'react-toastify';

class StaffService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'staff_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "id_c"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "role_c"}},
          {"field": {"Name": "department_c"}},
          {"field": {"Name": "shift_c"}},
          {"field": {"Name": "contact_c"}},
          {"field": {"Name": "specialization_c"}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      // Transform database fields to UI format
      return response.data.map(staff => ({
        Id: staff.Id,
        id: staff.id_c || '',
        name: staff.name_c || '',
        role: staff.role_c || '',
        department: staff.department_c || '',
        shift: staff.shift_c || '',
        contact: staff.contact_c || '',
        specialization: staff.specialization_c || ''
      }));
    } catch (error) {
      console.error("Error fetching staff:", error?.response?.data?.message || error);
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
          {"field": {"Name": "role_c"}},
          {"field": {"Name": "department_c"}},
          {"field": {"Name": "shift_c"}},
          {"field": {"Name": "contact_c"}},
          {"field": {"Name": "specialization_c"}}
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
        role: response.data.role_c || '',
        department: response.data.department_c || '',
        shift: response.data.shift_c || '',
        contact: response.data.contact_c || '',
        specialization: response.data.specialization_c || ''
      };
    } catch (error) {
      console.error(`Error fetching staff ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async create(staffData) {
    try {
      const prefix = staffData.role === "Doctor" ? "D" : staffData.role === "Nurse" ? "N" : "A";
      const timestamp = Date.now();
      const staffId = `${prefix}${String(timestamp).slice(-3)}`;
      
      const params = {
        records: [
          {
            // Only include Updateable fields
            id_c: staffId,
            name_c: staffData.name || '',
            role_c: staffData.role || '',
            department_c: staffData.department || '',
            shift_c: staffData.shift || '',
            contact_c: staffData.contact || '',
            specialization_c: staffData.specialization || ''
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
          console.error(`Failed to create ${failed.length} staff records:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const created = successful[0].data;
          return {
            Id: created.Id,
            id: created.id_c || staffId,
            name: created.name_c || staffData.name,
            role: created.role_c || staffData.role,
            department: created.department_c || staffData.department,
            shift: created.shift_c || staffData.shift,
            contact: created.contact_c || staffData.contact,
            specialization: created.specialization_c || staffData.specialization
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating staff:", error?.response?.data?.message || error);
      return null;
    }
  }

  async update(id, staffData) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id),
            // Only include Updateable fields
            id_c: staffData.id,
            name_c: staffData.name,
            role_c: staffData.role,
            department_c: staffData.department,
            shift_c: staffData.shift,
            contact_c: staffData.contact,
            specialization_c: staffData.specialization
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
          console.error(`Failed to update ${failed.length} staff records:${JSON.stringify(failed)}`);
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
            role: updated.role_c || '',
            department: updated.department_c || '',
            shift: updated.shift_c || '',
            contact: updated.contact_c || '',
            specialization: updated.specialization_c || ''
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating staff:", error?.response?.data?.message || error);
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
          console.error(`Failed to delete ${failed.length} staff records:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        return successful.length > 0;
      }
      return false;
    } catch (error) {
      console.error("Error deleting staff:", error?.response?.data?.message || error);
      return false;
    }
  }

  async getByDepartment(department) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "id_c"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "role_c"}},
          {"field": {"Name": "department_c"}},
          {"field": {"Name": "shift_c"}},
          {"field": {"Name": "contact_c"}},
          {"field": {"Name": "specialization_c"}}
        ],
        where: [{"FieldName": "department_c", "Operator": "EqualTo", "Values": [department]}]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data.map(staff => ({
        Id: staff.Id,
        id: staff.id_c || '',
        name: staff.name_c || '',
        role: staff.role_c || '',
        department: staff.department_c || '',
        shift: staff.shift_c || '',
        contact: staff.contact_c || '',
        specialization: staff.specialization_c || ''
      }));
    } catch (error) {
      console.error("Error fetching staff by department:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getByRole(role) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "id_c"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "role_c"}},
          {"field": {"Name": "department_c"}},
          {"field": {"Name": "shift_c"}},
          {"field": {"Name": "contact_c"}},
          {"field": {"Name": "specialization_c"}}
        ],
        where: [{"FieldName": "role_c", "Operator": "EqualTo", "Values": [role]}]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data.map(staff => ({
        Id: staff.Id,
        id: staff.id_c || '',
        name: staff.name_c || '',
        role: staff.role_c || '',
        department: staff.department_c || '',
        shift: staff.shift_c || '',
        contact: staff.contact_c || '',
        specialization: staff.specialization_c || ''
      }));
    } catch (error) {
      console.error("Error fetching staff by role:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getByShift(shift) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "id_c"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "role_c"}},
          {"field": {"Name": "department_c"}},
          {"field": {"Name": "shift_c"}},
          {"field": {"Name": "contact_c"}},
          {"field": {"Name": "specialization_c"}}
        ],
        where: [{"FieldName": "shift_c", "Operator": "EqualTo", "Values": [shift]}]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data.map(staff => ({
        Id: staff.Id,
        id: staff.id_c || '',
        name: staff.name_c || '',
        role: staff.role_c || '',
        department: staff.department_c || '',
        shift: staff.shift_c || '',
        contact: staff.contact_c || '',
        specialization: staff.specialization_c || ''
      }));
    } catch (error) {
      console.error("Error fetching staff by shift:", error?.response?.data?.message || error);
      return [];
    }
  }
}

export default new StaffService();