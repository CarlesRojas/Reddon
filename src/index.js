import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
import * as serviceWorker from "./serviceWorker";
import EventsPubSub from "./EventsPubSub";
import UtilsProvider from "contexts/Utils";
import RedditProvider from "contexts/Reddit";
import "fonts/VAGRoundedStd-Light.ttf";

import "./index.scss";

// Register the PubSub
window.PubSub = new EventsPubSub();

ReactDOM.render(
    <UtilsProvider>
        <RedditProvider>
            <App />
        </RedditProvider>
    </UtilsProvider>,
    document.getElementById("root")
);

// Register service worker
serviceWorker.register();
