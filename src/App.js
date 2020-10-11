import React from "react";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";

import Home from "./pages/Home";

//const REDDIT_SECRET = process.env.REDDIT_SECRET
//const link = `https://www.reddit.com/api/v1/authorize?client_id=${process.env.REACT_APP_REDDIT_APP_NAME}&response_type=code&state=RANDOM_STRING&redirect_uri=${process.env.REACT_APP_REDDIT_REDIRECT}/signup&duration=permanent&scope=privatemessages identity`;

export default function App() {
    return (
        <Router>
            <Switch>
                <Route path="/" component={Home}></Route>
            </Switch>
        </Router>
    );
}
