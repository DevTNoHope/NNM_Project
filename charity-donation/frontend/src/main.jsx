import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Web3Provider from "./hook/providers/Web3Provider";

createRoot(document.getElementById("root")).render(
  <Web3Provider>
    <App />
  </Web3Provider>,
);
