import React, { useState, useContext, useRef } from "react";
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
    const [resting, setResting] = useState(true);

    // Handle end start
    const onRestHandle = () => {
        console.log("Rest");
        setResting(true);
    };

    // Navigation spring
    const [{ x }, navSet] = useSpring(() => ({ x: 0, onRest: onRestHandle }));

    // If there is a change in subreddit -> Swap to that
    if (currentSubreddit !== subreddit.current) {
        if (subreddit.current) setResting(false);

        subreddit.current = currentSubreddit;
        navSet({ x: currentSubreddit === "all" ? 0 : -rowWidth });
    }

    return (
        <div className="app">
            <Navbar></Navbar>

            <animated.div className="home" style={{ x }}>
                <Posts subreddit="all" focused={subreddit.current === "all" && resting} posts={allPosts}></Posts>
                <Posts subreddit="home" focused={subreddit.current === "home" && resting} posts={homePosts}></Posts>
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
                <div className="delete" onClick={() => window.PubSub.emit("onZoomChange", { subreddit: subreddit.current })}>
                    M
                </div>
            </div>
        </div>
    );
}
