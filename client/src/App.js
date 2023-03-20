import "./App.css";
import React, { Component } from "react";
// import { BrowserRouter as Router, Route } from "react-router-dom";
import Footer from "./components/layout/Footer";
import Landing from "./components/layout/Landing";
import Navbar from "./components/layout/Navbar";
function App() {
  return (
    <div className="App">
      <Navbar></Navbar>
      <Landing></Landing>
      <Footer></Footer>
    </div>
  );
}

export default App;
