import toast from "react-hot-toast";
import instance from "../../api/axiosConfig";

export const ALL_CLIENTS = "ALL_CLIENTS";
export const GET_CLIENT_BY_ID = "GET_CLIENT_BY_ID";
export const GET_CLIENT_BY_USER_ID = "GET_CLIENT_BY_USER_ID";
export const CREATE_CLIENT = "CREATE_CLIENT";
export const UPDATE_CLIENT = "UPDATE_CLIENT";
export const GET_SALES_WEEKLY_BY_CLIENT_ID = "GET_SALES_WEEKLY_BY_CLIENT_ID";
export const DELETE_CLIENT = "DELETE_CLIENT";

export const getClientById = (id) => async (dispatch) => {
  try {
    const response = await instance.get(`/api/clients/${id}`);
    // console.log(response);
    dispatch({
      type: GET_CLIENT_BY_ID,
      payload: response.data,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getClientByUserID = (uid) => async (dispatch) => {
  try {
    const response = await instance.get(`/api/clients/user/${uid}`);
    dispatch({
      type: GET_CLIENT_BY_USER_ID,
      payload: response.data,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getClients = () => async (dispatch) => {
  const token = localStorage.getItem("authToken");

  try {
    const response = await instance.get(`/api/clients/data`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({
      type: ALL_CLIENTS,
      payload: response.data,
    });
  } catch (error) {
    console.log({ errorGetClient: error });
  }
};

export const createClient = (data) => async (dispatch) => {
  try {
    toast.loading("Creando cliente...");
    const response = await instance.post(`/api/clients/`, data);

    if (response.status === 200) {
      toast.success("Cliente creado");
      dispatch({
        type: CREATE_CLIENT,
        payload: response,
      });
      dispatch(getClientByUserID(data.userId));
    }
  } catch (error) {
    console.log({ errorCreateClient: error.message });
  }
};

export const updateClient = (id, data) => async (dispatch) => {
  try {
    toast.loading("Actualizando cliente...");

    const response = await instance.put(`/api/clients/update/${id}`, data);

    if (response.status === 200) {
      toast.success("Cliente actualizado");

      dispatch({
        type: UPDATE_CLIENT,
        payload: response.data,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const getSalesWeeklyByClientID = (id) => async (dispatch) => {
  try {
    const response = await instance.get(`/api/clients/${id}/ventas-por-semana`);
    dispatch({
      type: GET_SALES_WEEKLY_BY_CLIENT_ID,
      payload: response.data,
    });
  } catch (error) {
    console.log(error);
  }
};

export const deleteClient = (id) => async (dispatch) => {
  try {
    const response = await instance.delete(`/api/clients/delete/${id}`);
    dispatch({
      type: DELETE_CLIENT,
      payload: response.data,
    });
  } catch (error) {
    console.log(error);
  }
};
