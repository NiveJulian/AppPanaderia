import {
  ALL_CLIENTS,
  GET_CLIENT_BY_ID,
  GET_CLIENT_BY_USER_ID,
  GET_SALES_WEEKLY_BY_CLIENT_ID,
  CREATE_CLIENT,
  UPDATE_CLIENT,
  DELETE_CLIENT,
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
    case CREATE_CLIENT:
      return {
        ...state,
        clientes: [...state.clientes, payload],
        clientsForUsers: [...state.clientsForUsers, payload],
      };
    case UPDATE_CLIENT:
      return {
        ...state,
        clientes: state.clientes.map(client => 
          client.id === payload.id ? payload : client
        ),
        clientsForUsers: state.clientsForUsers.map(client => 
          client.id === payload.id ? payload : client
        ),
      };
    case DELETE_CLIENT:
      return {
        ...state,
        clientes: state.clientes.filter(client => client.id !== payload.id),
        clientsForUsers: state.clientsForUsers.filter(client => client.id !== payload.id),
      };
    default:
      return state;
  }
};

export default clientReducer;
