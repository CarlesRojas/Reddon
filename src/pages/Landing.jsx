import React from "react";
import randomstring from "randomstring";
import { Redirect } from "react-router-dom";
import { useCookies } from "react-cookie";
import qs from "qs";

export default function Landing(props) {
    // Is the app running in debug mode
    const debug = true;

    // Use cookies
    const [cookies, setCookie, removeCookie] = useCookies();

    // Get the url parameters
    const urlParams = qs.parse(props.location.search, { ignoreQueryPrefix: true });

    // Refresh Token Present -> Get a new Access Token and go to Home
    if (cookies.refresh_token) {
        // There is an Access Token
        if (cookies.access_token) {
            console.log("Refresh and Aceess Tokens Present -> Remember Me");
            var render = null;
        } else {
            console.log("Refresh Token Present -> Get Access Token");
            render = null;
        }
    }

    // No Refresh Token -> Login Process
    else {
        // State String Present -> Fetch Access and Refresh Tokens and go Home
        if (cookies.reddon_state) {
            // Correct State Random String -> Fetch Access and Refresh Tokens
            if (urlParams.state && cookies.reddon_state === urlParams.state) {
                console.log("Log In Done -> Fetch Access and Refresh Tokens");

                // Delete state random string
                removeCookie("reddon_state");

                // CARLES -> Continue Here

                render = null;
            }

            // Incorrect State Random String -> Delete cookies and start again
            else {
                console.log("Incorrect State String -> Start Again");

                // Remove all cookies and start again
                Object.keys(cookies).map((cookie) => removeCookie(cookie));
                render = <Redirect to="/" />;
            }
        }

        // No State String -> Login with Reddit
        else {
            console.log("First Time -> Log In with Reddit");

            // Create Oauth request link
            const REDIRECT_URI = debug ? "http://localhost:3000" : process.env.REACT_APP_REDIRECT_URI;
            const REACT_APP_CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
            const RANDOM_STRING = randomstring.generate(50);
            const link = `https://www.reddit.com/api/v1/authorize.compact?client_id=${REACT_APP_CLIENT_ID}&response_type=code&state=${RANDOM_STRING}&redirect_uri=${REDIRECT_URI}&duration=permanent&scope=vote`;

            // Save state random string
            setCookie("reddon_state", RANDOM_STRING);

            render = (
                <a href={link} className="link">
                    Reddit Logg In
                </a>
            );
        }
    }

    return render;
}
