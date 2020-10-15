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
    const { subreddit, posts, focused } = props;

    // Contexts
    const { clamp } = useContext(Utils);

    // State
    const [currIndex, setCurrIndex] = useState(0);
    const index = useRef(0);
    const postLength = useRef(0);
    const totalWidth = useRef(posts.length * rowWidthSmall);
    const gestureCancelled = useRef(false);

    // All springs
    const currMode = useRef("normal"); // "normal", "small"
    const [postMode, setPostMode] = useState("normal"); // "normal", "small"
    const [{ scale }, zoomSet] = useSpring(() => ({ scale: 1 }));
    const [properties, set] = useSprings(posts.length, (i) => ({ x: i * rowWidth, visible: i === index.current ? 1 : 0 }));

    // Handle inertia change
    const onInertiaChangeHandle = (xDispl) => {
        if (currMode.current === "small") {
            // Set the current index
            var newIndex = clamp(Math.round(-xDispl / rowWidthSmall), 0, postLength.current - 1);
            index.current = newIndex;
            setCurrIndex(newIndex);
        }
    };

    // Inertia
    const [{ x }, setX] = useInertia({
        x: 0,
        onChange: onInertiaChangeHandle,
    });

    // Set the gesture hook for the all posts
    const postsBind = useDrag(({ down, first, last, vxvy: [vx], movement: [mx], direction: [xDir], distance, cancel, canceled }) => {
        if (postMode === "normal") {
            // Start the gesture -> Not cancelled
            if (first) gestureCancelled.current = false;

            // Snap to next post if the post is moved half the distance or is released at great speed
            if (!gestureCancelled.current && ((down && distance > rowWidth * 0.4) || (last && Math.abs(vx) > 0.15))) {
                gestureCancelled.current = true;

                const indexDir = xDir > 0 ? -1 : 1;
                const newIndex = clamp(index.current + indexDir, 0, posts.length - 1);

                // Set the new index X
                setX({ x: -newIndex * rowWidthSmall, config: { decay: false, velocity: 0 } });

                // Do not change index if distance does not have the same direction as velocity
                cancel((index.current = newIndex));
                setCurrIndex(newIndex);
            }

            // Last frame
            if (canceled || last) {
                // Set the springs values
                set((i) => {
                    const xValue = (i - index.current) * rowWidth + (down ? mx : 0);
                    const visible = i === index.current ? 1 : 0;
                    return { x: xValue, visible };
                });
            }

            // Animate
            else {
                // Set the springs values
                set((i) => {
                    const xValue = (i - index.current) * rowWidth + (down ? mx : 0);
                    const visible = i === index.current || index.current + 1 === i || index.current - 1 === i ? 1 : 0;
                    return { x: xValue, visible };
                });
            }
        }
    });

    // Set the gesture hook for the post container
    const containerBind = useDrag(
        ({ down, vxvy: [vx], movement: [mx] }) => {
            if (postMode === "small") {
                if (down) setX({ x: mx, config: { decay: false, velocity: 0 } });
                else {
                    // Get max index displacement
                    const indexDispl = Math.round(vx * -1.1);
                    const clampedIndexDispl = clamp(index.current + indexDispl, 0, posts.length - 1);
                    if (vx < 0) var bounds = [-rowWidthSmall * clampedIndexDispl, 0];
                    else bounds = [rowWidthSmall - totalWidth.current, -rowWidthSmall * clampedIndexDispl];

                    // Set the inertia
                    setX({ x: mx, config: { inertia: true, bounds: { x: bounds }, velocities: { x: vx } } });
                }
            }
        },
        { initial: () => [x.get(), 0], bounds: { left: rowWidthSmall - totalWidth.current, right: 0 }, rubberband: true }
    );

    // Handles a change in the zoom
    const zoomChangeHandle = ({ subreddit: zoomSubreddit }) => {
        if (subreddit !== zoomSubreddit) return;

        console.log("ZOOM CHANGE");

        zoomSet({ scale: postMode === "normal" ? 0.7 : 1 });
        currMode.current = postMode === "normal" ? "small" : "normal";
        setPostMode(postMode === "normal" ? "small" : "normal");
    };

    // Update the total width when the posts change
    useEffect(() => {
        totalWidth.current = posts.length * rowWidthSmall;
        postLength.current = posts.length;
    }, [posts]);

    // Update position when index changes
    useEffect(() => {
        if (postMode === "small") {
            set((i) => {
                const xValue = (i - currIndex) * rowWidth;
                const visible = i === currIndex ? 1 : 0;
                return { x: xValue, visible };
            });
        }
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

    // Container Class
    if (subreddit === "all") var containerClass = "container" + (postMode === "small" ? " small" : "") + (focused ? "" : " notFocused");
    else containerClass = "container right" + (postMode === "small" ? " small" : "") + (focused ? "" : " notFocused");

    return (
        <animated.div {...containerBind()} className={containerClass} style={containerStyle}>
            {properties.map(({ x, visible }, i) => {
                // Style if not zoomed
                if (postMode === "normal") var style = { x, display: visible.to((displ) => (displ === 0 ? "none" : "block")) };
                else style = {};

                // Class if not focused
                if (!focused && i !== index.current && postMode === "small") var notFucusedClass = " invisible";
                else notFucusedClass = "";

                return (
                    <animated.div key={i} className={"posts" + notFucusedClass} {...postsBind()} style={style}>
                        <animated.div className="zoom" style={{ scale }}>
                            <Post i={i}></Post>
                        </animated.div>
                    </animated.div>
                );
            })}
        </animated.div>
    );
}
