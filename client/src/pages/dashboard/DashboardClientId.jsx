import { useEffect } from "react";
import { Layout } from "../../componentes/Dashboard/Layout/Layout";
import { useDispatch, useSelector } from "react-redux";
import DisplayProductDashboard from "../../componentes/Dashboard/Products/DisplayProductDashboard";
import {
  fetchSheetsByClient,
} from "../../redux/actions/productActions";
import { getClientById } from "../../redux/actions/clientActions";
import { useParams, useNavigate } from "react-router-dom";

const DashboardClientId = () => {
  const isAuth = useSelector((state) => state.auth.isAuth);
  const product = useSelector((state) => state.sheets.sheetsData);
  const user = useSelector((state) => state.auth.user);

  const { id } = useParams();
  const dispatch = useDispatch();
  const client = useSelector((state) => state.client.client);
  const navigate = useNavigate();

  // const isEmpty = (obj) => Object.keys(obj).length === 0;

  useEffect(() => {
    dispatch(fetchSheetsByClient(id));
    dispatch(getClientById(id));
  }, [dispatch, id]);

  useEffect(() => {
    // Si client es null, undefined, o un objeto vacío, redirige
    if (!client || Object.keys(client).length === 0) {
      if (user && user.uid) {
        navigate(`/dashboard/${user.uid}`);
      } else {
        navigate("/error");
      }
    }
    // Si usas soft delete, puedes validar: if (client.deletedAt) { ... }
  }, [client, navigate, user]);

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
