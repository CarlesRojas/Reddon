import React, { useState, useRef, createContext, useContext } from "react";

import { Utils } from "contexts/Utils";

// Reddit Context
export const Reddit = createContext();

const RedditProvider = (props) => {
    // Context
    const { setCookie, getCookie } = useContext(Utils);

    // Refresh token timeout
    const refreshTimeout = useRef(null);

    // Current subreddit
    const [currentSubreddit, setCurrentSubreddit] = useState("all");

    // All posts and next
    const [allPosts, setAllPosts] = useState([]);
    const allAfter = useRef("");

    // Home posts and next
    const [homePosts, setHomePosts] = useState([]);
    const homeAfter = useRef("");

    // Custom subreddit posts and next
    const subredditName = useRef("");
    const [subredditPosts, setSubredditPosts] = useState([]);
    const subredditAfter = useRef("");

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

    // Retrieve the access and refresh tokens for the first time
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

    // Retrieve the next posts of the specified subreddit
    const getPosts = async (subreddit) => {
        var accessToken = await getAccessToken();

        // Set default parameters
        if (!subreddit) subreddit = "all";

        // Set the after parameter
        if (subreddit === "all" && allAfter.current) var after = `&after=${allAfter.current}`;
        else if (subreddit === "home" && homeAfter.current) after = `&after=${homeAfter.current}`;
        else if (subreddit === subredditName.current && subredditAfter.current) after = `&after=${subredditAfter.current}`;
        else after = "";

        // Fetch
        var rawResponse = await fetch(`https://oauth.reddit.com/r/${subreddit}.json?raw_json=1&limit=10${after}`, {
            headers: {
                Accept: "application/json, text/plain, */*",
                Authorization: "bearer " + accessToken,
            },
        });
        const response = await rawResponse.json();

        // Save posts to all
        if (subreddit === "all") {
            setAllPosts([...allPosts, ...response.data.children]);
            allAfter.current = response.data.after;
        }

        // Save posts to home
        else if (subreddit === "home") {
            setHomePosts([...homePosts, ...response.data.children]);
            homeAfter.current = response.data.after;
        }

        // Save posts to home
        else {
            // If its the same subreddit -> Add posts to the list
            if (subredditName.current === subreddit) {
                setSubredditPosts([...subredditPosts, ...response.data.children]);
                subredditAfter.current = response.data.after;
            }

            // New subreddit -> Clear list and add save the posts
            else {
                subredditName.current = subreddit;
                setSubredditPosts(response.data.children);
                subredditAfter.current = response.data.after;
            }
        }

        console.log(response);
    };

    // Return the context
    return (
        <Reddit.Provider
            value={{
                currentSubreddit,
                setCurrentSubreddit,
                allPosts,
                homePosts,
                subredditPosts,
                requestAccessToken,
                refreshAccessToken,
                getPosts,
            }}
        >
            {props.children}
        </Reddit.Provider>
    );
};

export default RedditProvider;
