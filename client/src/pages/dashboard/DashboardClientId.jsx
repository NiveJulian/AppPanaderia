import { useEffect, useState } from "react";
import { Layout } from "../../componentes/Dashboard/Layout/Layout";
import { useDispatch, useSelector } from "react-redux";
import DisplayProductDashboard from "../../componentes/Dashboard/Products/DisplayProductDashboard";
import { fetchSheetsByClient } from "../../redux/actions/productActions";
import { getClientById } from "../../redux/actions/clientActions";
import { useParams, useNavigate } from "react-router-dom";

const DashboardClientId = () => {
  const isAuth = useSelector((state) => state.auth.isAuth);
  const product = useSelector((state) => state.sheets.sheetsData);
  const user = useSelector((state) => state.auth.user);
  const client = useSelector((state) => state.client.client);

  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.uid && id) {
      setIsLoading(true);
      dispatch(fetchSheetsByClient(user.uid));
      dispatch(getClientById(id));
    }
  }, [dispatch, id, user?.uid]);

  useEffect(() => {
    // Solo redirigir si no está cargando y no hay cliente
    if (!isLoading && (!client || Object.keys(client).length === 0)) {
      if (user?.uid) {
        navigate(`/dashboard/${user.uid}`);
      } else {
        navigate("/error");
      }
    } else if (client && Object.keys(client).length > 0) {
      setIsLoading(false);
    }
  }, [client, navigate, user?.uid, isLoading]);

  // Mostrar loading mientras se carga
  if (isLoading) {
    return (
      <Layout isAuth={isAuth}>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAuth={isAuth}>
      <div className="flex justify-between items-center">
        <h1 className="text-xl text-white">Panel de control</h1>
      </div>
      <div className="mt-5">
        <DisplayProductDashboard
          products={product}
          client={client}
          user={user}
        />
      </div>
    </Layout>
  );
};

export default DashboardClientId;
