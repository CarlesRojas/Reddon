import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
import EventsPubSub from "./EventsPubSub";
import UtilsProvider from "contexts/Utils";
import APIProvider from "contexts/API";

import "./index.scss";

// Register the PubSub
window.PubSub = new EventsPubSub();

ReactDOM.render(
    <UtilsProvider>
        <APIProvider>
            <App />
        </APIProvider>
    </UtilsProvider>,
    document.getElementById("root")
);
