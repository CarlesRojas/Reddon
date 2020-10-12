import React, { useRef, createContext, useContext } from "react";

import { Utils } from "contexts/Utils";

// API Context
export const API = createContext();

const APIProvider = (props) => {
    // Context
    const { setCookie, getCookie } = useContext(Utils);

    // State
    const refreshTimeout = useRef(null);

    // Check and return access token
    const getAccessToken = async () => {
        // Retrieve Access Token
        var accessToken = getCookie("reddon_access_token");
        if (accessToken) return accessToken;

        // Otherwise -> Refresh access token
        await refreshAccessToken();

        // Retrieve Access Token
        accessToken = getCookie("reddon_access_token");
        if (accessToken) return accessToken;
        return "";
    };

    // Refresh the access token
    const refreshAccessToken = async () => {
        // Retrieve Refresh Token
        var refreshToken = getCookie("reddon_refresh_token");

        // Return if we do not have a refresh token
        if (!refreshToken) return false;

        // Post data
        const POST_DATA = new FormData();
        POST_DATA.append("grant_type", "refresh_token");
        POST_DATA.append("refresh_token", refreshToken);

        // Fetch
        var rawResponse = await fetch("https://www.reddit.com/api/v1/access_token", {
            method: "post",
            headers: {
                Accept: "application/json, text/plain, */*",
                Authorization: `Basic ${btoa(unescape(encodeURIComponent(`${process.env.REACT_APP_CLIENT_ID}:`)))}`,
            },
            body: POST_DATA,
        });
        const response = await rawResponse.json();

        // Return error status
        if (response.error) return false;

        // Save data
        if (response.access_token) {
            setCookie("reddon_access_token", response.access_token, (1 / 24 / 60) * ((response.expires_in - 300) / 60));
            refreshTimeout.current = setTimeout(() => refreshAccessToken(), (response.expires_in - 300) * 1000);
        }

        return true;
    };

    // Retrieve the aacess and refresh tokens for the first time
    const requestAccessToken = async (code) => {
        // Post data
        const POST_DATA = new FormData();
        POST_DATA.append("code", code);
        POST_DATA.append("grant_type", "authorization_code");
        POST_DATA.append("redirect_uri", process.env.REACT_APP_REDIRECT_URI);

        // Fetch
        var rawResponse = await fetch("https://www.reddit.com/api/v1/access_token", {
            method: "post",
            headers: {
                Accept: "application/json, text/plain, */*",
                Authorization: `Basic ${btoa(unescape(encodeURIComponent(`${process.env.REACT_APP_CLIENT_ID}:`)))}`,
            },
            body: POST_DATA,
        });
        const response = await rawResponse.json();

        // Return error status
        if (response.error) return false;

        // Save data
        if (response.refresh_token && response.access_token) {
            setCookie("reddon_refresh_token", response.refresh_token);
            setCookie("reddon_access_token", response.access_token, (1 / 24 / 60) * ((response.expires_in - 300) / 60));
            refreshTimeout.current = setTimeout(() => refreshAccessToken(), (response.expires_in - 300) * 1000);
        }

        return true;
    };

    const getPostsAll = async () => {
        var accessToken = await getAccessToken();

        // Fetch
        var rawResponse = await fetch("https://oauth.reddit.com/r/all.json", {
            headers: {
                Accept: "application/json, text/plain, */*",
                Authorization: "bearer " + accessToken,
            },
        });
        const response = await rawResponse.json();

        console.log(response);
    };

    // Return the context
    return (
        <API.Provider
            value={{
                requestAccessToken,
                refreshAccessToken,
                getPostsAll,
            }}
        >
            {props.children}
        </API.Provider>
    );
};

export default APIProvider;
