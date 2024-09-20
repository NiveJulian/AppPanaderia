import React, { useEffect } from "react";
import { Layout } from "../../componentes/Dashboard/Layout/Layout";
import { useDispatch, useSelector } from "react-redux";
import DisplayProductDashboard from "../../componentes/Dashboard/Products/DisplayProductDashboard";
import { fetchSheets } from "../../redux/actions/productActions";
import { getClientById } from "../../redux/actions/clientActions";
import { useParams } from "react-router-dom";

const DashboardClientId = () => {
  const isAuth = useSelector((state) => state.auth.isAuth);
  const product = useSelector((state) => state.sheets.sheetsData);
  const user = useSelector((state) => state.auth.user);

  const { id } = useParams();
  const dispatch = useDispatch();

  const client = useSelector((state) => state.client.client);

  // const isEmpty = (obj) => Object.keys(obj).length === 0;

  useEffect(() => {
    dispatch(getClientById(id));
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(fetchSheets());
  }, [dispatch]);

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
