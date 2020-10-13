import React from "react";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";

import Home from "pages/Home";
import Landing from "pages/Landing";

export default function App() {
    // Set dark mode
    //document.body.classList.add("dark");
    //document.body.classList.remove("dark");

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
