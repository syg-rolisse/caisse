// src/services/auth.service.js
import api from '../config/axiosConfig';

const all = async (params) => {
  const response = await api.get(`depense/all?page=${params.page}&perpage=${params.perPage}`);
  return response;
};

const create = async (user) => {
  const response = await api.post('depense/create', user);
  return response;
};

const update = async (id, user) => {
  const response = await api.put(`depense/update?depenseId=${id}`, user);
  return response;
};

const show = async (id) => {
  const response = await api.get(`depense/show/${id}`);
  return response;
};

const deleteDepense = async (id) => {
  const response = await api.delete(`depense/delete?depenseId=${id}`);
  return response;
};

export const depenseService = { all, create, update, deleteDepense, show };