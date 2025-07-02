import toast from "react-hot-toast";
import instance from "../../api/axiosConfig";
import { sendEmailChangeStateOrder } from "./emailActions";

export const GET_SALES = "GET_SALES";
export const GET_SALE_BY_ID = "GET_SALE_BY_ID";
export const GET_SALE_BY_USER_ID = "GET_SALE_BY_USER_ID";
export const GET_SALE_BY_CLIENT_ID = "GET_SALE_BY_CLIENT_ID";
export const GET_SALE_BY_WEEKLY = "GET_SALE_BY_WEEKLY";
export const GET_SALE_BY_WEEKLY_BY_USER = "GET_SALE_BY_WEEKLY_BY_USER";
export const CREATED_SALE = "CREATED_SALE";
export const CREATED_SALE_DASHBOARD = "CREATED_SALE_DASHBOARD";
export const DELETE_SALE_ROW = "DELETE_SALE_ROW";
export const GET_SALE_CHANGE_STATE = "GET_SALE_CHANGE_STATE";

export const getSaleInfo = (id) => async (dispatch) => {
  try {
    const res = await instance.get(`/api/sheets/sale/id/${id}`);
    dispatch({
      type: GET_SALE_BY_ID,
      payload: res.data,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getSaleChangeState = (id, state) => async (dispatch) => {
  try {
    // Primero obtenemos la información de la venta
    const saleInfoResponse = await instance.get(`/api/sheets/sale/id/${id}`);
    const saleInfo = saleInfoResponse.data;

    // Luego actualizamos el estado de la venta
    const res = await instance.put(
      `/api/sheets/sale/${id}/changestate/${state}`
    );
    if (res.status === 200) {
      // Después de actualizar el estado, obtenemos la información del usuario
      const userMail = saleInfo[0].correo; // Asegúrate de que esto sea correcto según tu API
      const paymentDetail = {
        orderNumber: saleInfo[0].id,
        newStatus: state,
        cliente: { nombre: saleInfo[0].cliente }, // Datos del cliente
      };

      // Enviamos el correo electrónico
      await sendEmailChangeStateOrder(userMail, paymentDetail);

      // Actualizamos la información en el store de Redux
      dispatch(getSales());
      dispatch({
        type: GET_SALE_CHANGE_STATE,
        payload: res.data,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const getSaleByUserID = (uid) => async (dispatch) => {
  try {
    const res = await instance.get(`/api/sheets/sales/${uid}`);
    if (res.status === 200) {
      const salesData = res.data;
      // Asegurarse de que salesData sea un array
      const safeSalesData = Array.isArray(salesData) ? salesData : [];
      // Filtrar las ventas para que solo haya una por cada ID
      const uniqueSales = Object.values(
        safeSalesData.reduce((acc, sale) => {
          acc[sale.id] = sale; // Si el ID ya existe, lo sobrescribe
          return acc;
        }, {})
      );
      // Invertir el orden para que la más reciente esté al principio
      const reversedSales = uniqueSales.reverse();
      dispatch({
        type: GET_SALE_BY_USER_ID,
        payload: reversedSales,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const getSaleByClientID = (id) => async (dispatch) => {
  try {
    const res = await instance.get(`/api/sheets/sales/client/${id}`);
    if (res.status === 200) {
      dispatch({
        type: GET_SALE_BY_CLIENT_ID,
        payload: res.data,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const getSaleByWeekly = () => async (dispatch) => {
  try {
    const res = await instance.get(`/api/sheets/sales/weekly`);
    if (res.status === 200) {
      dispatch({
        type: GET_SALE_BY_WEEKLY,
        payload: res.data.total,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const getSaleByWeeklyByUser = (uid) => async (dispatch) => {
  try {
    const res = await instance.get(`/api/sheets/sales/weekly/${uid}`);
    if (res.status === 200) {
      dispatch({
        type: GET_SALE_BY_WEEKLY_BY_USER,
        payload: res.data.total,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const getSales = () => async (dispatch) => {
  try {
    const res = await instance.get(`/api/sheets/sale`);
    const salesData = res.data;

    dispatch({
      type: GET_SALES,
      payload: salesData,
    });
  } catch (error) {
    console.log(error);
  }
};

export const createSaleDashboard = (data) => async (dispatch) => {
  try {
    const res = await instance.post(`/api/sheets/sale/dashboard`, data);
    if (res.status === 200) {
      toast.success("Venta creada exitosamente...");

      dispatch({
        type: CREATED_SALE_DASHBOARD,
        payload: res,
      });
    }
  } catch (error) {
    console.log({ error: error.message });
    toast.error("Error al crear la venta");
  }
};

export const generateWeeklySalesPDF = (clientData) => async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/ticket/generate-weekly`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(clientData),
      }
    );

    if (!response.ok) {
      throw new Error("Error al generar el PDF");
    }

    // Crear un blob del PDF y descargarlo
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `ventas_semanales_${clientData.clientName}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success("PDF generado exitosamente");
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Error al generar el PDF");
  }
};

export const deleteSaleRow = (rowIndex) => async (dispatch) => {
  try {
    const res = await instance.delete(`/api/sheets/sale/permanent/${rowIndex}`);
    if (res.status === 200) {
      toast.success("Eliminado definitivamente");
      dispatch(getSales());
      dispatch({
        type: DELETE_SALE_ROW,
        payload: rowIndex,
      });
      dispatch(getSales());
    }
  } catch (error) {
    console.log(error);
    toast.error("Error al eliminar la venta definitivamente");
  }
};
