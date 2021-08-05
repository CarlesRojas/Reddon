import React, { useState, useContext } from "react";
import randomstring from "randomstring";
import { Redirect } from "react-router-dom";
import qs from "qs";

// Contexts
import { Reddit } from "contexts/Reddit";
import { Utils } from "contexts/Utils";

// Icons
import Logo from "resources/ReddonLogo.svg";

export default function Landing(props) {
    // Contexts
    const { accessGranted, redirectUri, clientID, requestAccessToken, refreshAccessToken } = useContext(Reddit);
    const { setCookie, getCookies, clearCookies } = useContext(Utils);

    // State
    const [cookies] = useState(getCookies());

    // Get the url parameters
    const urlParams = qs.parse(props.location.search, { ignoreQueryPrefix: true });

    // Access is Granted -> Go to Home
    if (accessGranted.current) {
        // Reddirect to Home
        var render = <Redirect to="/home" />;
    }

    // Error in url params -> Restart
    else if (urlParams.error) {
        console.log("Login Error -> Start Again");

        // Remove all cookies and start again
        clearCookies();

        // Reddirect to Start with error log
        render = <Redirect to="/?loginError=true" />;
    }

    // Refresh Token Present -> Get a new Access Token and go to Home
    else if (cookies.reddon_refresh_token) {
        console.log("Refresh Token Present -> Get Access Token");

        // Get the access and refresh tokens for the first time
        accessGranted.current = refreshAccessToken();

        render = accessGranted.current ? <Redirect to="/home" /> : null;
    }

    // No Refresh Token -> Log in Process
    else {
        // State String Present -> Fetch Access and Refresh Tokens and go Home
        if (cookies.reddon_state && urlParams.state) {
            // Correct State Random String -> Fetch Access and Refresh Tokens
            if (urlParams.state && cookies.reddon_state === urlParams.state) {
                console.log("Login Done -> Fetch Access and Refresh Tokens");

                // Get the access and refresh tokens for the first time
                accessGranted.current = requestAccessToken(urlParams.code);

                render = accessGranted.current ? <Redirect to="/home" /> : null;
            }

            // Incorrect State Random String -> Delete cookies and start again
            else {
                console.log("Incorrect State String -> Start Again");

                // Remove all cookies and start again
                clearCookies();

                // Reddirect to Start with error log
                render = <Redirect to="/?loginError=true" />;
            }
        }

        // No State String -> Log in with Reddit
        else {
            console.log("First Time -> Log in with Reddit");

            // Create Oauth request link
            const RANDOM_STRING = randomstring.generate(50);
            const link = `https://www.reddit.com/api/v1/authorize.compact?client_id=${clientID}&response_type=code&state=${RANDOM_STRING}&redirect_uri=${redirectUri}&duration=permanent&scope=vote read`;

            // Save state random string
            setCookie("reddon_state", RANDOM_STRING);

            // Render Landing Page
            render = (
                <div className="landing">
                    <div className="logo">
                        <span className="appName">redd</span>
                        <img className="icon" src={Logo} alt="" />
                        <span className="appName">n</span>
                    </div>
                    <div className="flexGrow"></div>
                    {urlParams.loginError ? <div className="error">Login error, try again!</div> : null}
                    <a href={link} className="link">
                        Log in with Reddit
                    </a>
                </div>
            );
        }
    }

    return render;
}
