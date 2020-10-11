import React from "react";
import ReactDOM from "react-dom";
import { CookiesProvider } from "react-cookie";

import App from "./App";
import EventsPubSub from "./EventsPubSub";

import "./index.scss";

// Register the PubSub
window.PubSub = new EventsPubSub();

ReactDOM.render(
    <React.StrictMode>
        <CookiesProvider>
            <App />
        </CookiesProvider>
    </React.StrictMode>,
    document.getElementById("root")
);
