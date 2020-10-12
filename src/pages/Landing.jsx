import React, { useState, useContext } from "react";
import randomstring from "randomstring";
import { Redirect } from "react-router-dom";
import qs from "qs";

// Contexts
import { API } from "contexts/API";
import { Utils } from "contexts/Utils";

export default function Landing(props) {
    // Contexts
    const { getAccessToken } = useContext(API);
    const { setCookie, getCookies, clearCookies, deleteCookie } = useContext(Utils);

    // State
    const [accessGranted, setAccessGranted] = useState(false);
    const [cookies] = useState(getCookies());

    // Get the url parameters
    const urlParams = qs.parse(props.location.search, { ignoreQueryPrefix: true });

    // Access is Granted -> Go to Home
    if (accessGranted) {
        // Reddirect to Home
        var render = <Redirect to="/home" />;
    }

    // Error in url params -> Restart
    else if (urlParams.error) {
        console.log("Login Error -> Start Again");

        // Remove all cookies and start again
        clearCookies();

        // Reddirect to Start with error log
        var render = <Redirect to="/?loginError=true" />;
    }

    // Refresh Token Present -> Get a new Access Token and go to Home
    else if (cookies.refresh_token) {
        // There is an Access Token
        if (cookies.access_token) {
            console.log("Refresh and Aceess Tokens Present -> Remember Me");
            render = null;
        } else {
            console.log("Refresh Token Present -> Get Access Token");
            render = null;
        }
    }

    // No Refresh Token -> Log in Process
    else {
        // State String Present -> Fetch Access and Refresh Tokens and go Home
        if (cookies.reddon_state && urlParams.state) {
            // Correct State Random String -> Fetch Access and Refresh Tokens
            if (urlParams.state && cookies.reddon_state === urlParams.state) {
                console.log("Login Done -> Fetch Access and Refresh Tokens");

                // Get the access and refresh tokens for the first time
                setAccessGranted(getAccessToken(urlParams.code, process.env.REACT_APP_REDIRECT_URI));

                render = null;
            }

            // Incorrect State Random String -> Delete cookies and start again
            else {
                console.log("Incorrect State String -> Start Again");

                // Remove all cookies and start again
                clearCookies();

                // Reddirect to Start with error log
                var render = <Redirect to="/?loginError=true" />;
            }
        }

        // No State String -> Log in with Reddit
        else {
            console.log("First Time -> Log in with Reddit");

            // Create Oauth request link
            const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;
            const REACT_APP_CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
            const RANDOM_STRING = randomstring.generate(50);
            const link = `https://www.reddit.com/api/v1/authorize.compact?client_id=${REACT_APP_CLIENT_ID}&response_type=code&state=${RANDOM_STRING}&redirect_uri=${REDIRECT_URI}&duration=permanent&scope=vote`;

            // Save state random string
            setCookie("reddon_state", RANDOM_STRING);

            console.log(urlParams);

            // Render Landing Page
            render = (
                <div>
                    {urlParams.loginError ? <p>Login Error</p> : null}
                    <a href={link} className="link">
                        Log in with Reddit
                    </a>
                </div>
            );
        }
    }

    return render;
}
