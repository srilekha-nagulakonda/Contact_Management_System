import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import React, { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Home from "./pages/Home";
import View from "./pages/View";
import Auth from "./pages/Auth";
import AddContact from "./pages/AddContact";
import UpdateContact from "./pages/UpdateContact";
import "./index.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (!token) {
      localStorage.removeItem("token");
    }
  }, [token]);

  return (
    <BrowserRouter>
      <div className="App">
        <ToastContainer />
        <Routes>
          <Route path="/home" element={<Home token={token} />} />
          <Route path="/" element={<Auth setToken={setToken} />} />
          <Route path="/view/:id" element={<View token={token} />} />
          <Route path="/add" element={<AddContact token={token} />} />
          <Route path="/update/:id" element={<UpdateContact token={token} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
