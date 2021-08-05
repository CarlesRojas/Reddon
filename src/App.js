import React, { useContext } from "react";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";

import Home from "pages/Home";
import Landing from "pages/Landing";

// Contexts
import { Utils } from "contexts/Utils";

export default function App() {
    // Contexts
    const { getCookie } = useContext(Utils);

    // Dark mode
    if (getCookie("reddon_dark_mode") !== "0") document.body.classList.add("dark");

    return (
        <Router>
            <Switch>
                {/* ################################# */}
                {/*   HOME PAGE                       */}
                {/* ################################# */}
                <Route path="/home" component={Home}></Route>

                {/* ################################# */}
                {/*   LANDING PAGE                    */}
                {/* ################################# */}
                <Route path="/" component={Landing}></Route>
            </Switch>
        </Router>
    );
}
