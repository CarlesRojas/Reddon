import React, { useContext, useRef } from "react";
import { animated } from "react-spring";

// Contexts
import { Utils } from "contexts/Utils";

// Constants
const ROW_WIDTH = window.innerWidth;

export default function Post(props) {
    // Props
    const { i, zoomed, x, subreddit } = props;

    // Contexts
    const { clamp } = useContext(Utils);

    // Animate the zoom in and out
    const isZoomed = useRef(zoomed);
    const animating = useRef(false);

    // Animate only when zoom changes
    if (isZoomed.current !== zoomed || animating.current) {
        if (isZoomed.current !== zoomed) isZoomed.current = zoomed;
        animating.current = true;

        // Stop animating in 0.2s
        setTimeout(() => {
            animating.current = false;
        }, 200);

        // 0.2s Animation
        var animatedScale = {
            transition: "transform 0.2s ease-in-out",
        };
    } else animatedScale = {};

    // If not zoomed, no springs
    var contentStyle = {};
    var animatedPositionStyle = {};

    // When zoomed, add springs
    if (zoomed) {
        // Scale spring
        contentStyle = {
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
        if (isZoomed.current) {
            window.PubSub.emit("onPostClicked", { subreddit, index: i });
        }
    };

    return (
        <div className="post">
            <animated.div className="animatedPosition" style={{ ...animatedPositionStyle, ...animatedScale }}>
                <animated.div className="content" style={{ ...contentStyle, ...animatedScale }} onClick={onPostClickHandle}>
                    {i}
                </animated.div>
            </animated.div>
        </div>
    );
}
