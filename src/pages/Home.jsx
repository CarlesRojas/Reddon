import React, { useContext, useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useSpring, animated } from "react-spring";

import Navbar from "components/Navbar";
import Posts from "components/Posts";

// Contexts
import { Utils } from "contexts/Utils";
import { Reddit } from "contexts/Reddit";

// Size of the viewport
const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

export default function Home() {
    // Contexts
    const { useForceUpdate } = useContext(Utils);
    const { currentSubreddit, setCurrentSubreddit, getPosts, allPosts, homePosts, subredditPosts } = useContext(Reddit);

    // #################################################
    //   ROUTER HISTORY AND BACK BUTTON
    // #################################################

    // Router history
    const prevSubreddit = useRef(currentSubreddit);

    // Intercept back button
    useEffect(() => {
        window.onpopstate = function (event) {
            if (event.state && event.type === "popstate") {
                setCurrentSubreddit(prevSubreddit.current);
            }
        };
        return () => {
            window.onpopstate = null;
        };
    }, []);

    // #################################################
    //   NAVIGATION SPRINGS
    // #################################################

    // Horizontal avigation spring
    const subreddit = useRef("");
    const [{ x }, horizontalNavigationSet] = useSpring(() => ({ x: 0 }));
    const [{ y }, verticalNavigationSet] = useSpring(() => ({ y: 0 }));

    // If there is a change in subreddit -> Swap to that
    if (currentSubreddit !== subreddit.current) {
        // If the subreddit is "all" or "homeSubreddit" -> Move to that subreddit
        if (currentSubreddit === "all" || currentSubreddit === "homeSubreddit") {
            horizontalNavigationSet({ x: currentSubreddit === "all" ? 0 : -SCREEN_WIDTH });
            verticalNavigationSet({ y: 0 });
        }
        // Otherwise, show the other subreddit
        else {
            window.history.pushState({}, "", "home");
            verticalNavigationSet({ y: SCREEN_HEIGHT });
        }

        // Update previous ans current subreddit
        if (subreddit.current === "all" || subreddit.current === "homeSubreddit") prevSubreddit.current = subreddit.current;
        subreddit.current = currentSubreddit;
    }

    // #################################################
    //   FETCH FIRST POSTS
    // #################################################

    // State
    const firstPostsLoaded = useRef(false);

    // Force update
    const forceUpdate = useForceUpdate();

    // Load new posts for the custom subreddit
    useEffect(() => {
        // Load fewer posts to show them faster to the user
        async function loadFirstPosts() {
            // Get first posts for "all" and "homeSubreddit"
            await getPosts(currentSubreddit, 8, true);

            // Force update
            forceUpdate();
        }

        // Load first posts
        if (!subredditPosts.length && currentSubreddit !== "all" && currentSubreddit !== "homeSubreddit") loadFirstPosts();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSubreddit]);

    // Component did mount
    useEffect(() => {
        // Load fewer posts to show them faster to the user
        async function loadFirstPosts() {
            // Get first posts for "all" and "homeSubreddit"
            await Promise.all([getPosts("all", 8, true), getPosts("homeSubreddit", 8)]);

            // Force update
            forceUpdate();

            // Get more posts for "all" and "homeSubreddit"
            await Promise.all([getPosts("all", 50), getPosts("homeSubreddit", 50)]);

            // Inform that the first posts have been loaded
            firstPostsLoaded.current = true;
        }

        // Load first posts
        loadFirstPosts();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="app">
            <animated.div className="home" style={{ x }}>
                <Posts subreddit="all" posts={allPosts} firstPostsLoaded={firstPostsLoaded}></Posts>
                <Posts subreddit="homeSubreddit" posts={homePosts} firstPostsLoaded={firstPostsLoaded}></Posts>
            </animated.div>

            <Navbar></Navbar>

            <animated.div className="subredditPopupContainer" style={{ y, width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
                <div className="subredditPopup">
                    <Posts subreddit={currentSubreddit} posts={subredditPosts} firstPostsLoaded={firstPostsLoaded}></Posts>
                </div>
            </animated.div>
        </div>
    );
}
