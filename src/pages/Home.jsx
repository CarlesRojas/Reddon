import React, { useState, useContext, useRef } from "react";
import { useSpring, useSprings, animated } from "react-spring";
import { useDrag } from "react-use-gesture";

import Navbar from "components/Navbar";
import Post from "components/Post";

// Contexts
import { Reddit } from "contexts/Reddit";
import { Utils } from "contexts/Utils";

// Size of the viewport
const rowWidth = window.innerWidth;

export default function Home() {
    // Contexts
    const { currentSubreddit, getPosts, allPosts, homePosts } = useContext(Reddit);
    const { clamp } = useContext(Utils);

    // State
    const allIndex = useRef(0);
    const homeIndex = useRef(0);
    const gestureCancelled = useRef(false);
    const subreddit = useRef("");

    // Navigation spring
    const [navAllProperties, navAllSet] = useSpring(() => ({ x: 0 }));
    const [navHomeProperties, navHomeSet] = useSpring(() => ({ x: rowWidth }));

    // All springs
    const [allPostMode, setAllPostMode] = useState("normal"); // "normal", "small"
    const [allZoomProperties, allZoomSet] = useSpring(() => ({ scale: 1 }));
    const [allProperties, allSet] = useSprings(allPosts.length, (i) => ({ x: i * rowWidth, display: "block" }));

    // Home springs
    const [homePostMode, setHomePostMode] = useState("normal"); // "normal", "small"
    const [homeZoomProperties, homeZoomSet] = useSpring(() => ({ scale: 1 }));
    const [homeProperties, homeSet] = useSprings(homePosts.length, (i) => ({ x: i * rowWidth, display: "block" }));

    // Set the gesture hook for the all posts
    const allBind = useDrag(({ down, first, last, vxvy: [vx], movement: [mx], direction: [xDir], distance, cancel }) => {
        // Start the gesture -> Not cancelled
        if (first) gestureCancelled.current = false;

        // Snap to next post if the post is moved half the distance or is released at great speed
        if (!gestureCancelled.current && ((down && distance > rowWidth * 0.4) || (last && Math.abs(vx) > 0.15))) {
            gestureCancelled.current = true;
            cancel((allIndex.current = clamp(allIndex.current + (xDir > 0 ? -1 : 1), 0, allPosts.length - 1)));
        }

        // Set the springs values
        allSet((i) => {
            if (i < allIndex.current - 1 || i > allIndex.current + 1) return { display: "none" };
            const x = (i - allIndex.current) * rowWidth + (down ? mx : 0);
            return { x, display: "block" };
        });
    });

    // Set the gesture hook for the home posts
    const homeBind = useDrag(({ down, first, last, vxvy: [vx], movement: [mx], direction: [xDir], distance, cancel }) => {
        // Start the gesture -> Not cancelled
        if (first) gestureCancelled.current = false;

        // Snap to next post if the post is moved half the distance or is released at great speed
        if (!gestureCancelled.current && ((down && distance > rowWidth * 0.4) || (last && Math.abs(vx) > 0.15))) {
            gestureCancelled.current = true;
            cancel((homeIndex.current = clamp(homeIndex.current + (xDir > 0 ? -1 : 1), 0, homePosts.length - 1)));
        }

        // Set the springs values
        homeSet((i) => {
            if (i < homeIndex.current - 1 || i > homeIndex.current + 1) return { display: "none" };
            const x = (i - homeIndex.current) * rowWidth + (down ? mx : 0);
            return { x, display: "block" };
        });
    });

    // Swap post mode
    const swapPostMode = () => {
        if (currentSubreddit === "all") {
            allZoomSet({ scale: allPostMode === "normal" ? 0.7 : 1 });
            setAllPostMode(allPostMode === "normal" ? "small" : "normal");
        } else {
            homeZoomSet({ scale: homePostMode === "normal" ? 0.7 : 1 });
            setHomePostMode(homePostMode === "normal" ? "small" : "normal");
        }
    };

    // If there is a change in subreddit -> Swap to that
    if (currentSubreddit !== subreddit.current) {
        subreddit.current = currentSubreddit;
        navAllSet({ x: currentSubreddit === "all" ? 0 : -rowWidth });
        navHomeSet({ x: currentSubreddit === "home" ? 0 : rowWidth });
    }

    return (
        <div className="app">
            <Navbar></Navbar>

            <div className={"home" + (currentSubreddit === "all" ? "" : " invisible")}>
                {allProperties.map(({ x, display }, i) => {
                    const { scale } = allZoomProperties;

                    return (
                        <animated.div className="container" {...allBind()} key={i} style={{ display, x, scale }}>
                            <Post></Post>
                        </animated.div>
                    );
                })}
            </div>

            <div className={"home" + (currentSubreddit === "home" ? "" : " invisible")}>
                {homeProperties.map(({ x, display }, i) => {
                    const { scale } = homeZoomProperties;

                    return (
                        <animated.div className="container" {...homeBind()} key={i} style={{ display, x, scale }}>
                            <Post></Post>
                        </animated.div>
                    );
                })}
            </div>

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
                <div className="delete" onClick={() => swapPostMode()}>
                    M
                </div>
            </div>
        </div>
    );
}
