import React, { useState, useContext, useRef } from "react";
import { useSprings, animated } from "react-spring";
import { useDrag } from "react-use-gesture";

import Navbar from "components/Navbar";
import Post from "components/Post";

// Contexts
import { Reddit } from "contexts/Reddit";
import { Utils } from "contexts/Utils";

export default function Home() {
    // Contexts
    const { currentSubreddit, getPosts, allPosts, homePosts, subredditPosts } = useContext(Reddit);
    const { clamp } = useContext(Utils);

    // State
    const subreddit = useRef("");
    const index = useRef(0);
    const list = currentSubreddit === "all" ? allPosts : currentSubreddit === "home" ? homePosts : subredditPosts;

    // If there is a change in subreddit -> Reset counter
    if (currentSubreddit !== subreddit.current) {
        console.log("Change");
        subreddit.current = currentSubreddit;
        index.current = 0;
    }

    // Springs for each post
    const [properties, setSprings] = useSprings(list.length, (i) => ({
        x: i * window.innerWidth,
        scale: 1,
        display: "block",
    }));

    // Set the gesture hook
    const bind = useDrag(({ down, vxvy: [vx], movement: [mx], direction: [xDir], distance, cancel }) => {
        // Snap to next post if the post is moved half the distance or with great speed
        if (down && (distance > window.innerWidth / 2 || Math.abs(vx) > 0.8)) {
            cancel((index.current = clamp(index.current + (xDir > 0 ? -1 : 1), 0, list.length - 1)));
        }

        // Set the springs values
        setSprings((i) => {
            if (i < index.current - 1 || i > index.current + 1) return { display: "none" };
            const x = (i - index.current) * window.innerWidth + (down ? mx : 0);
            const scale = down ? 1 - (distance / window.innerWidth) * 0.25 : 1;
            if (i === 0) console.log({ x, scale, display: "block" });
            return { x, scale, display: "block" };
        });
    });

    return (
        <div className="app">
            <Navbar></Navbar>

            <div className="page">
                {properties.map(({ x, display, scale }, i) => {
                    return (
                        <animated.div className="scroll" {...bind()} key={i} style={{ display, x }}>
                            <animated.div className="container" style={{ scale }} />
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
            </div>
        </div>
    );
}
/*

import React, { useState, useContext, useRef } from "react";
import { useSpring, a, config } from "react-spring";
import { useDrag } from "react-use-gesture";

import Navbar from "components/Navbar";
import Post from "components/Post";

// Contexts
import { Reddit } from "contexts/Reddit";

// Size of the viewport
const rowWidth = window.innerWidth;

export default function Home(props) {
    // Contexts
    const { currentSubreddit, getPosts, allPosts, homePosts, subredditPosts } = useContext(Reddit);

    // State
    const subreddit = useRef("");
    const [scrollLeft, setScrollLeft] = useState(0);

    // If there is a change in subreddit -> Reset counter
    if (currentSubreddit !== subreddit.current) {
        subreddit.current = currentSubreddit;
    }

    //getPosts("all");

    const list = currentSubreddit === "all" ? allPosts : currentSubreddit === "home" ? homePosts : subredditPosts;
    const numColumns = list.length > 0 ? list.length : 20;

    const startIndex = Math.max(0, Math.floor(scrollLeft / rowWidth) - 2);
    const endIndex = Math.min(startIndex + 5, numColumns);
    const totalWidth = rowWidth * numColumns;
    const paddingLeft = startIndex * rowWidth;

    // List to be rendered
    const renderedItems = [];
    let index = startIndex;

    // Add all items that will be shown
    while (index < endIndex) {
        if (index < list.length) {
            renderedItems.push(<Post key={index} info={list[index]}></Post>);
        } else {
            renderedItems.push(<Post key={index}></Post>);
        }
        ++index;
    }

    return (
        <div className="app">
            <Navbar></Navbar>
            <div
                className="pageContainer"
                onScroll={(event) => {
                    setScrollLeft(event.target.scrollLeft);
                }}
            >
                <div className="scroll" style={{ width: totalWidth - paddingLeft, paddingLeft: paddingLeft }}>
                    <ol className="list">{renderedItems}</ol>
                </div>
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
            </div>
        </div>
    );
}
*/
