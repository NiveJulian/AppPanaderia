import { useDispatch, useSelector } from "react-redux";
import SalesWeeklyByClientId from "../../componentes/Dashboard/Sales/SalesWeeklyByClientId";
import { useState } from "react";
import { getSalesWeeklyByClientID } from "../../redux/actions/clientActions";
import { useParams } from "react-router-dom";
import { Layout } from "../../componentes/Dashboard/Layout/Layout";

export default function SalesWeeklyByClient() {
    const dispatch = useDispatch()
    const { id } = useParams();
    const isAuth = useSelector((state) => state.auth.isAuth);
    const data = useSelector((state) => state.client.clientes);

    useState(() => {
    dispatch(getSalesWeeklyByClientID(id))
    },[])

    return (
        <Layout isAuth={isAuth}>
            <div className="h-screen">

            <h1 className="text-5xl text-black">Historial</h1>
            <div className="mt-8">
                <SalesWeeklyByClientId data={data} />
            </div>
            </div>
        </Layout>
    )
}