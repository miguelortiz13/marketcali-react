import api from './client';

export const cashShiftService = {
    getActiveShift: async () => {
        const response = await api.get('/api/cash-shifts/active');
        return response.data; // Si es 204 No Content, axios retorna "" o null
    },

    openShift: async (data) => {
        const response = await api.post('/api/cash-shifts/open', data);
        return response.data;
    },

    registerMovement: async (shiftId, data) => {
        const response = await api.post(`/api/cash-shifts/${shiftId}/movements`, data);
        return response.data;
    },

    getShiftSummary: async (shiftId) => {
        const response = await api.get(`/api/cash-shifts/${shiftId}/summary`);
        return response.data;
    },

    closeShift: async (shiftId, data) => {
        const response = await api.post(`/api/cash-shifts/${shiftId}/close`, data);
        return response.data;
    },

    getAllShifts: async () => {
        const response = await api.get('/api/cash-shifts');
        return response.data;
    }
};

export default cashShiftService;
