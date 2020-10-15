import React, { useState, useContext, useRef, useEffect } from "react";
import { useSpring, useSprings, animated } from "react-spring";
import { useDrag } from "react-use-gesture";

import Post from "components/Post";
import { useInertia } from "components/Inertia";

// Contexts
import { Utils } from "contexts/Utils";

// Size of the viewport
const rowWidth = window.innerWidth;
const rowWidthSmall = window.innerWidth * 0.75;

export default function Posts(props) {
    // Props
    const { subreddit, posts } = props;

    // Contexts
    const { clamp } = useContext(Utils);

    // State
    const [currIndex, setCurrIndex] = useState(0);
    const index = useRef(0);
    const postLength = useRef(0);
    const totalWidth = useRef(posts.length * rowWidthSmall);
    const gestureCancelled = useRef(false);
    const currMode = useRef("normal"); // "normal", "small"

    // All springs
    const [postMode, setPostMode] = useState("normal"); // "normal", "small"
    const [{ scale }, zoomSet] = useSpring(() => ({ scale: 1 }));
    const [properties, set] = useSprings(posts.length, (i) => ({ x: i * rowWidth }));

    // Handle inertia change
    const onInertiaChangeHandle = (xDispl) => {
        if (currMode.current !== "small") return;

        // Set the current index
        var newIndex = clamp(Math.round(-xDispl / rowWidthSmall), 0, postLength.current - 1);
        index.current = newIndex;
        setCurrIndex(newIndex);
    };

    // Inertia
    const [{ x }, setX] = useInertia({ x: 0, onChange: onInertiaChangeHandle });

    // Set the gesture hook for the all posts
    const postsBind = useDrag(({ down, first, last, vxvy: [vx], movement: [mx], direction: [xDir], distance, cancel, canceled }) => {
        if (postMode !== "normal") return;

        // Start the gesture -> Not cancelled
        if (first) gestureCancelled.current = false;

        // Cancel gesture and snap to next post
        if (!gestureCancelled.current && ((down && distance > rowWidth * 0.4) || (last && Math.abs(vx) > 0.15))) {
            // Cancel the gesture
            gestureCancelled.current = true;

            // Get the new index
            const newIndex = clamp(index.current + (xDir > 0 ? -1 : 1), 0, posts.length - 1);

            // Set the new index X
            setX({ x: -newIndex * rowWidthSmall, config: { decay: false, velocity: 0 } });
            cancel((index.current = newIndex));
            setCurrIndex(newIndex);
        }

        // Animation in progress -> Set the spring x value
        else {
            set((i) => {
                return { x: (i - index.current) * rowWidth + (down ? mx : 0) };
            });
        }
    });

    // Set the gesture hook for the post container
    const containerBind = useDrag(
        ({ down, vxvy: [vx], movement: [mx] }) => {
            if (postMode !== "small") return;

            // While gesture is active -> Move without inertia
            if (down) {
                setX({ x: mx, config: { decay: false, velocity: 0 } });
            }

            // When the gesture ends -> Apply inertia
            else {
                // Get max index displacement
                const indexDispl = clamp(index.current + Math.round(vx * -1.1), 0, posts.length - 1);

                // Calculate the bounds for the spring
                if (vx < 0) var bounds = [-rowWidthSmall * indexDispl, 0];
                else bounds = [rowWidthSmall - totalWidth.current, -rowWidthSmall * indexDispl];

                // Set the inertia
                setX({ x: mx, config: { inertia: true, bounds: { x: bounds }, velocities: { x: vx } } });
            }
        },
        { initial: () => [x.get(), 0], bounds: { left: rowWidthSmall - totalWidth.current, right: 0 }, rubberband: true }
    );

    // Handles a change in the zoom
    const zoomChangeHandle = ({ subreddit: zoomSubreddit }) => {
        if (subreddit !== zoomSubreddit) return;

        // Swap zoom scale and mode
        zoomSet({ scale: postMode === "normal" ? 0.7 : 1 });
        currMode.current = postMode === "normal" ? "small" : "normal";
        setPostMode(postMode === "normal" ? "small" : "normal");
    };

    // On posts change -> Update the total width and posts length
    useEffect(() => {
        totalWidth.current = posts.length * rowWidthSmall;
        postLength.current = posts.length;
    }, [posts]);

    // On index change -> Update position
    useEffect(() => {
        if (postMode !== "small") return;

        // Set the current position
        set((i) => {
            return { x: (i - currIndex) * rowWidth };
        });
    }, [currIndex, postMode, set]);

    // Listen for the events
    useEffect(() => {
        window.PubSub.sub("onZoomChange", zoomChangeHandle);

        return function cleanup() {
            window.PubSub.unsub("onZoomChange", zoomChangeHandle);
        };
    });

    // Container style
    if (postMode === "normal") var containerStyle = {};
    else containerStyle = { x };

    return (
        <div className={"clipPath" + (subreddit === "all" ? "" : " right")}>
            <animated.div {...containerBind()} className={"container " + postMode} style={containerStyle}>
                {properties.map(({ x }, i) => (
                    <animated.div key={i} className="posts" {...postsBind()} style={postMode === "normal" ? { x } : {}}>
                        <animated.div className="zoom" style={{ scale }}>
                            <Post i={i}></Post>
                        </animated.div>
                    </animated.div>
                ))}
            </animated.div>
        </div>
    );
}
