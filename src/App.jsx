import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import { useState, useEffect } from "react";
import LandingPage from "./pages/LandingPage/LandingPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import ClipLoader from "react-spinners/ClipLoader";
import Dashboard from "./pages/Dashboard/Dashboard";
import FormEditor from "./pages/FormEditor/FormEditor";
import FormBot from "./pages/FormBot/FormBot";
import ThankYou from "./pages/ThankYou/ThankYou";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard/" element={<Dashboard />} />
        <Route path="/login/" element={<LoginPage />} />
        <Route path="/editor/" element={<FormEditor />} />
        <Route path="/formbot" element={<FormBot />} />
        <Route path="/thankyou" element={<ThankYou />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
