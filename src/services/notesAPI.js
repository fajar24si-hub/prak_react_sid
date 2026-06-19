import axios from 'axios';

const API_URL = "https://efekbmcgcekjngbxfhyf.supabase.co/rest/v1/note";
const API_KEY = "sb_publishable_4Gmy-xKg_uXeutIJ1wlDhw_LU7Zyukb";

const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

export const notesAPI = {
  async fetchNotes() {
    try {
      const response = await axios.get(API_URL, { headers });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message);
    }
  },

  async createNote(data) {
    try {
      const response = await axios.post(API_URL, data, { headers });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message);
    }
  },

  async deleteNote(id) {
    try {
      const response = await axios.delete(`${API_URL}?id=eq.${id}`, { headers });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message);
    }
  }
};
