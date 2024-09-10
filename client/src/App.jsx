import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  authenticateUserFromSession,
} from "./redux/actions/authActions";
import { useEffect } from "react";
import Login from "./pages/dashboard/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/dashboard/Products";
import Sales from "./pages/dashboard/Sales";
import Support from "./pages/dashboard/Support";
import Users from "./pages/dashboard/Users";
import Error from "./pages/dashboard/Error";
import Balance from "./pages/dashboard/Balance";
import PagePayment from "./pages/dashboard/PagePayment";


function App() {
  const dispatch = useDispatch();
  const isAuth = useSelector((state) => state.auth.isAuth);

  useEffect(() => {
    dispatch(authenticateUserFromSession());
  }, [dispatch]);
  return (
    <div>
      <Toaster
        toastOptions={{
          // Define default options
          className: "",
          duration: 1500,
          style: {
            background: "#363636",
            color: "#fff",
          },

          // Default options for specific types
          success: {
            duration: 1000,
            theme: {
              primary: "green",
              secondary: "black",
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Login />} />
        {isAuth ? (
          <Route>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/products" element={<Products />} />
            <Route path="/dashboard/sales" element={<Sales />} />
            <Route path="/dashboard/users" element={<Users />} />
            <Route path="/dashboard/balance" element={<Balance />} />
            <Route path="/dashboard/support" element={<Support />} />
            <Route path="/dashboard/pagepayment" element={<PagePayment />} />
          </Route>
        ) : (
          <Route path="/error" element={<Error />} />
        )}
      </Routes>
    </div>
  );
}

export default App;
