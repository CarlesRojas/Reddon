import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
import EventsPubSub from "./EventsPubSub";

import "./index.scss";

// Register the PubSub
window.PubSub = new EventsPubSub();

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
);
