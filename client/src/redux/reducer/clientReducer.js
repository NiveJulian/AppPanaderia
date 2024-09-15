import { ALL_CLIENTS, GET_CLIENT_BY_ID } from "../actions/clientActions";

const initialState = {
  clientes: [],
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
    case GET_CLIENT_BY_ID:
      return{
        ...state,
        client: payload
      }
    default:
      return state;
  }
};

export default clientReducer;
