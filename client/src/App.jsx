import React, {useState} from "react";
import {Routes, Route, Navigate, useNavigate} from "react-router-dom";
import Layout from "./layouts/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Jewellery from "./pages/Jewellery";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";

function Protected({children}) {
  const logged = localStorage.getItem("jewelora_auth")==="1";
  return logged ? children : <Navigate to="/login" replace />;
}

export default function App(){
  return <Routes>
    <Route path="/login" element={<Login/>}/>
    <Route path="/" element={<Protected><Layout/></Protected>}>
      <Route index element={<Dashboard/>}/>
      <Route path="jewellery" element={<Jewellery/>}/>
      <Route path="customers" element={<Customers/>}/>
      <Route path="suppliers" element={<Suppliers/>}/>
      <Route path="purchases" element={<Purchases/>}/>
      <Route path="sales" element={<Sales/>}/>
      <Route path="reports" element={<Reports/>}/>
    </Route>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>
}
