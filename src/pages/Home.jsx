import React, { useContext, useRef } from "react";
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
        console.log("Change");
        subreddit.current = currentSubreddit;
        navSet({ x: currentSubreddit === "all" ? 0 : -rowWidth });
    }

    return (
        <div className="app">
            <Navbar></Navbar>

            <animated.div className="home" style={{ x }}>
                <Posts subreddit="all" posts={allPosts}></Posts>
                <Posts subreddit="home" posts={homePosts}></Posts>
            </animated.div>

            <div className="deleteContainer">
                <div className="delete" onClick={() => getPosts("all")}>
                    Load All
                </div>
                <div className="delete" onClick={() => getPosts("home")}>
                    Load Home
                </div>
                <div className="delete" onClick={() => getPosts("funny")}>
                    Load funny
                </div>
                <div className="delete" onClick={() => getPosts("tifu")}>
                    Load tifu
                </div>
                <div className="delete" onClick={() => window.PubSub.emit("onPostsZoomChange", { subreddit: subreddit.current })}>
                    M
                </div>
            </div>
        </div>
    );
}
