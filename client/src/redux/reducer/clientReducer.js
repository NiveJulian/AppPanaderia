import {
  ALL_CLIENTS,
  GET_CLIENT_BY_ID,
  GET_CLIENT_BY_USER_ID,
  GET_SALES_WEEKLY_BY_CLIENT_ID,
} from "../actions/clientActions";

const initialState = {
  clientes: [],
  clientsForUsers: [],
  client: {},
  isAuth: false,
};

const clientReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case ALL_CLIENTS:
      return {
        ...state,
        clientes: payload,
      };
    case GET_CLIENT_BY_USER_ID:
      return {
        ...state,
        clientes: Array.isArray(payload) ? payload : [],
        clientsForUsers: Array.isArray(payload) ? payload : [],
      };
    case GET_CLIENT_BY_ID:
      return {
        ...state,
        client: payload,
      };
    case GET_SALES_WEEKLY_BY_CLIENT_ID:
      return {
        ...state,
        clientes: payload,
      };
    default:
      return state;
  }
};

export default clientReducer;
