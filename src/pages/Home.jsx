import React, { useContext, useRef, useEffect } from "react";
import { useSpring, animated } from "react-spring";

import Navbar from "components/Navbar";
import Posts from "components/Posts";

// Contexts
import { Reddit } from "contexts/Reddit";

// Size of the viewport
const rowWidth = window.innerWidth;

export default function Home() {
    // Contexts
    const { currentSubreddit, getPosts, allPosts, homePosts } = useContext(Reddit);

    // State
    const subreddit = useRef("");

    // Navigation spring
    const [{ x }, navSet] = useSpring(() => ({ x: 0 }));

    // If there is a change in subreddit -> Swap to that
    if (currentSubreddit !== subreddit.current) {
        subreddit.current = currentSubreddit;
        navSet({ x: currentSubreddit === "all" ? 0 : -rowWidth });
    }

    // Component did mount
    useEffect(() => {
        // Get posts for "all"
        getPosts("all", 3).then(() => {
            getPosts("all");
        });

        // Get posts fror "homeSubreddit"
        getPosts("homeSubreddit", 3).then(() => {
            getPosts("homeSubreddit");
        });
    }, []);

    return (
        <div className="app">
            <Navbar></Navbar>

            <animated.div className="home" style={{ x }}>
                <Posts subreddit="all" posts={allPosts}></Posts>
                <Posts subreddit="homeSubreddit" posts={homePosts}></Posts>
            </animated.div>

            <div className="deleteContainer">
                <div className="delete" onClick={() => getPosts("all")}>
                    Load All
                </div>
                <div className="delete" onClick={() => getPosts("homeSubreddit")}>
                    Load Home
                </div>
                <div className="delete" onClick={() => getPosts("funny")}>
                    Load funny
                </div>
                <div className="delete" onClick={() => getPosts("tifu")}>
                    Load tifu
                </div>
                <div className="delete" onClick={() => window.PubSub.emit("onZoomChange", { subreddit: subreddit.current })}>
                    M
                </div>
            </div>
        </div>
    );
}
