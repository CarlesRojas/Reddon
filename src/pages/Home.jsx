import React, { useContext, useRef, useEffect } from "react";
import { useSpring, animated } from "react-spring";

import Navbar from "components/Navbar";
import Posts from "components/Posts";

// Contexts
import { Utils } from "contexts/Utils";
import { Reddit } from "contexts/Reddit";

// Size of the viewport
const rowWidth = window.innerWidth;

export default function Home() {
    // Contexts
    const { useForceUpdate } = useContext(Utils);
    const { currentSubreddit, getPosts, allPosts, homePosts } = useContext(Reddit);

    // #################################################
    //   NAVIGATION SPRING
    // #################################################

    // Navigation spring
    const subreddit = useRef("");
    const [{ x }, navSet] = useSpring(() => ({ x: 0 }));

    // If there is a change in subreddit -> Swap to that
    if (currentSubreddit !== subreddit.current) {
        subreddit.current = currentSubreddit;
        navSet({ x: currentSubreddit === "all" ? 0 : -rowWidth });
    }

    // #################################################
    //   FETCH FIRST POSTS
    // #################################################

    // State
    const firstPostsLoaded = useRef(false);

    // Force update
    const forceUpdate = useForceUpdate();

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
        </div>
    );
}
