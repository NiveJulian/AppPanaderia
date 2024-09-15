import toast from "react-hot-toast";
import instance from "../../api/axiosConfig";

export const ALL_CLIENTS = "ALL_CLIENTS";
export const GET_CLIENT_BY_ID = "GET_CLIENT_BY_ID";
export const CREATE_CLIENT = "CREATE_CLIENT";

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
      dispatch(getClients());
      dispatch({
        type: CREATE_CLIENT,
        payload: response,
      });
    }
  } catch (error) {
    console.log({ errorCreateClient: error.message });
  }
};
