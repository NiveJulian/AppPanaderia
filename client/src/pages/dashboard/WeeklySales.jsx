import { useSelector } from "react-redux";
import { Layout } from "../../componentes/Dashboard/Layout/Layout";
import SheetsWeeklySales from "../../componentes/Dashboard/Sheets/SheetsWeeklySales";

export default function WeeklySales() {
    const isAuth = useSelector((state) => state.auth.isAuth);

    return (
        <Layout isAuth={isAuth}>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Ventas Semanales por Cliente
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Resumen de todas las ventas realizadas esta semana, organizadas por cliente
                        </p>
                    </div>
                    
                    <SheetsWeeklySales />
                </div>
            </div>
        </Layout>
    );
} 