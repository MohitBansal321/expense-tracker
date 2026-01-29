import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import router from "./routes.jsx";
import store from "./store";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import ThemeProvider from "./context/ThemeContext.js";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <ThemeProvider>
                <RouterProvider router={router} />
                <ToastContainer />
            </ThemeProvider>
        </Provider>
    </React.StrictMode>
);
