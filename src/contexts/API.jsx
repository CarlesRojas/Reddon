import React, { useState, createContext, useContext } from "react";

import { Utils } from "contexts/Utils";

// API Context
export const API = createContext();

const APIProvider = (props) => {
    // Context
    const { setCookie } = useContext(Utils);

    // State
    const [accessToken, setAccessToken] = useState("");
    const [refreshToken, setRefreshToken] = useState("");

    // Retrieve the aacess and refresh tokens for the first time
    const getAccessToken = async (code, redirect_uri) => {
        // Post data
        const POST_DATA = new FormData();
        POST_DATA.append("code", code);
        POST_DATA.append("grant_type", "authorization_code");
        POST_DATA.append("redirect_uri", redirect_uri);

        // Fetch
        var rawResponse = await fetch("https://www.reddit.com/api/v1/access_token", {
            method: "post",
            headers: {
                Accept: "application/json, text/plain, */*",

                Authorization: "Basic " + btoa(unescape(encodeURIComponent(process.env.REACT_APP_CLIENT_ID + ":" + ""))),
            },
            body: POST_DATA,
        });
        const response = await rawResponse.json();

        // Return error status
        if (response.error) return false;

        // Save data
        if (response.refresh_token) setCookie("reddon_refresh_token", response.refresh_token);

        return true;
        /*
        access_token: "17103964428-Jyj2p83C6sIKRFOJYWLHsUPIcZk";
        expires_in: 3600;
        refresh_token: "17103964428-m93EVsv7g-zeW2rpiTJQw9oFjMc";
        scope: "vote";
        token_type: "bearer";
        */
        console.log(response);
    };

    return (
        <API.Provider
            value={{
                getAccessToken,
            }}
        >
            {props.children}
        </API.Provider>
    );
};

export default APIProvider;
