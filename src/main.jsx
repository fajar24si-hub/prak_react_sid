import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// 1. Import BrowserRouter dari react-router-dom
import { BrowserRouter } from "react-router-dom"; 
import "./pertemuan-5/assets/tailwind.css"; 
import App from "./App.jsx";

// ✅ Benar: Langsung merender BrowserRouter
createRoot(document.getElementById("root")).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
);