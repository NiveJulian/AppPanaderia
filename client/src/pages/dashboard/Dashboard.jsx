import { useDispatch, useSelector } from "react-redux";
import { Layout } from "../../componentes/Dashboard/Layout/Layout";
import { useEffect, useState } from "react";
import {
  getClientByUserID,
  getClients,
} from "../../redux/actions/clientActions";
import { Link, useParams } from "react-router-dom";
import TabCreateClient from "../../componentes/Dashboard/Popup/TabCreateClient";

const Dashboard = () => {
  const isAuth = useSelector((state) => state.auth.isAuth);
  const clientsForUsers = useSelector((state) => state.client.clientsForUsers);
  const { uid } = useParams();
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const [activeForm, setActiveForm] = useState(false);

  const toggleModal = () => {
    setActiveForm(!activeForm);
  };

  useEffect(() => {
    dispatch(getClientByUserID(uid));
  }, [dispatch, uid]);

  return (
    <Layout isAuth={isAuth}>
      {activeForm && (
        <TabCreateClient uid={uid} isOpen={activeForm} onClose={toggleModal} />
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-xl text-white">Panel de control</h1>
      </div>
      <div className="mt-5">
        <div className="flex lg:flex-row flex-col shadow-lg">
          {/* Clientes */}
          <div className="lg:w-full h-screen overflow-y-scroll">
            <div className="flex flex-row justify-between items-center px-4 mt-5">
              <div className="flex items-center">
                <button
                  onClick={() => toggleModal()}
                  className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded"
                >
                  Crear cliente
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 lg:grid-cols-5 px-3 py-3 gap-4 mt-5 overflow-y-auto border rounded-md m-2 h-auto">
              {clientsForUsers &&
                clientsForUsers?.map((client, i) => {
                  return (
                    <Link
                      key={i}
                      to={`/dashboard/client/${client.id}`}
                      className="flex h-32 border cursor-pointer shadow-md rounded-md p-2 flex-col items-center justify-center w-full mx-auto hover:shadow-xl active:shadow-lg active:translate-y-[2px]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-10"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
                        />
                      </svg>

                      <h4 className="mt-2 text-sm uppercase font-medium text-primary">
                        {client.name}
                      </h4>
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
