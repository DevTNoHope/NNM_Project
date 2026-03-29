import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/sweetalert.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Web3Provider from "./hook/providers/Web3Provider";

createRoot(document.getElementById("root")).render(
  <Web3Provider>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </Web3Provider>,
);
