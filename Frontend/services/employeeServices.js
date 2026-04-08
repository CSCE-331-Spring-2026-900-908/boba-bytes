import { API_BASE } from "../config/api.js";

const API = `${API_BASE}/employees`;

export const getEmployees = async () => {
  const res = await fetch(API);
  return res.json();
};

export const addEmployee = async (data) => {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateEmployee = async (id, data) => {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deactivateEmployee = async (id) => {
  const res = await fetch(`${API}/${id}/deactivate`, {
    method: "PATCH"
  });
  return res.json();
};
