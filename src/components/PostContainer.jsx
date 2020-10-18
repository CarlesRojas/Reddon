import React, { useContext, useRef } from "react";
import { animated } from "react-spring";

import Post from "./Post";

// Contexts
import { Utils } from "contexts/Utils";

// Constants
const ROW_WIDTH = window.innerWidth;

export default function PostContainer(props) {
    // Props
    const { i, zoomed, x, subreddit, postData } = props;

    // Contexts
    const { clamp } = useContext(Utils);

    // Animate the zoom in and out
    const isZoomed = useRef(zoomed);
    const animating = useRef(false);

    // Styles
    var transitionStyle = {};
    var animatedScaleStyle = {};
    var animatedPositionStyle = {};

    // Animate only when zoom changes
    if (isZoomed.current !== zoomed || animating.current) {
        if (isZoomed.current !== zoomed) isZoomed.current = zoomed;
        animating.current = true;

        // Stop animating in 0.2s
        setTimeout(() => {
            animating.current = false;
        }, 200);

        // Apply the 0.2s transition
        transitionStyle = {
            transition: "transform 0.2s ease-in-out",
        };
    }

    // When zoomed, add springs
    if (zoomed) {
        // Scale spring
        animatedScaleStyle = {
            transform: x.to((x) => {
                // When closeness is one, the i item at the center of the screen
                var closeness = 1 - clamp(Math.abs(-x - i * ROW_WIDTH), 0, ROW_WIDTH * 4) / (ROW_WIDTH * 4);

                // Set the scale
                return `scale(${closeness * 0.75})`;
            }),
        };

        // Position spring
        animatedPositionStyle = {
            transform: x.to((x) => {
                // True if the post is on the left of the screen
                var onTheLeft = -x - i * ROW_WIDTH > 0;

                // When closeness is zero, the i item at the center of the screen
                var closeness = clamp(Math.abs(-x - i * ROW_WIDTH), 0, ROW_WIDTH * 3) / (ROW_WIDTH * 3);

                // Width displacement
                var widthDispl = closeness * ROW_WIDTH * (onTheLeft ? 1 : -1) * 0.8;

                // Set the scale
                return `translate(${widthDispl}px, 0px)`;
            }),
        };
    }

    // Handle a click on the post
    const onPostClickHandle = () => {
        if (isZoomed.current) window.PubSub.emit("onPostClicked", { subreddit, index: i });
    };

    return (
        <div className="postContainer">
            <animated.div className="animatedPosition" style={{ ...animatedPositionStyle, ...transitionStyle }}>
                <animated.div className="animatedScale" style={{ ...animatedScaleStyle, ...transitionStyle }} onClick={onPostClickHandle}>
                    <Post postData={postData} zoomed={zoomed}></Post>
                </animated.div>
            </animated.div>
        </div>
    );
}
