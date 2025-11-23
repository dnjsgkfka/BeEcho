import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const setFavicon = () => {
  const existingLinks = document.querySelectorAll("link[rel*='icon']");
  existingLinks.forEach((link) => link.remove());

  const link = document.createElement("link");
  link.type = "image/svg+xml";
  link.rel = "icon";
  link.href = "/logo.svg";
  document.getElementsByTagName("head")[0].appendChild(link);

  if (document.title !== "BeEcho.") {
    document.title = "BeEcho.";
  }
};

setFavicon();

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
