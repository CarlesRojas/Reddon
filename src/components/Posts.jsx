import React, { useState, useContext, useRef, useEffect } from "react";
import { useSpring, useSprings, animated } from "react-spring";
import { useDrag } from "react-use-gesture";

import Post from "components/Post";
import { useInertia } from "components/Inertia";

// Contexts
import { Utils } from "contexts/Utils";

// Size of the viewport
const rowWidth = window.innerWidth;

export default function Posts(props) {
    // Props
    const { subreddit, posts } = props;

    // Contexts
    const { clamp } = useContext(Utils);

    // State
    const index = useRef(0);
    const totalWidth = useRef(posts.length * rowWidth);
    const gestureCancelled = useRef(false);

    // Inertia
    const [{ x }, setX] = useInertia({ x: 0 });

    // All springs
    const [postMode, setPostMode] = useState("normal"); // "normal", "small"
    const [{ scaleX, scaleY }, zoomSet] = useSpring(() => ({ scaleX: 1, scaleY: 1 }));
    const [properties, set] = useSprings(posts.length, (i) => ({ x: i * rowWidth, visible: i === index.current ? 1 : 0 }));

    // Set the gesture hook for the all posts
    const postsBind = useDrag(({ down, first, last, vxvy: [vx], movement: [mx], direction: [xDir], distance, cancel, canceled }) => {
        // Start the gesture -> Not cancelled
        if (first) gestureCancelled.current = false;

        // Snap to next post if the post is moved half the distance or is released at great speed
        if (!gestureCancelled.current && ((down && distance > rowWidth * 0.4) || (last && Math.abs(vx) > 0.15))) {
            gestureCancelled.current = true;

            const indexDir = xDir > 0 ? -1 : 1;
            const newIndex = clamp(index.current + indexDir, 0, posts.length - 1);

            // Set the new index X
            setX({ x: -newIndex * rowWidth, config: { decay: false, velocity: 0 } });

            // Do not change index if distance does not have the same direction as velocity
            cancel((index.current = newIndex));
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
    });

    // Set the gesture hook for the post container
    const containerBind = useDrag(
        ({ down, vxvy: [vx], movement: [mx] }) => {
            if (postMode === "small") {
                if (down) setX({ x: mx, config: { decay: false, velocity: 0 } });
                else setX({ x: mx, config: { inertia: true, bounds: { x: [rowWidth - totalWidth.current, 0] }, velocities: { x: vx } } });
            }
        },
        { initial: () => [x.get(), 0], bounds: { left: rowWidth - totalWidth.current, right: 0 }, rubberband: true }
    );

    const zoomChangeHandle = ({ subreddit: zoomSubreddit }) => {
        if (subreddit !== zoomSubreddit) return;

        zoomSet({ scaleX: postMode === "normal" ? 0.8 : 1, scaleY: postMode === "normal" ? 0.7 : 1 });
        setPostMode(postMode === "normal" ? "small" : "normal");
    };

    // Update the total width when the posts change
    useEffect(() => {
        totalWidth.current = posts.length * rowWidth;
    }, [posts]);

    // Listen for the zoom to change
    useEffect(() => {
        window.PubSub.sub("onPostsZoomChange", zoomChangeHandle);

        return function cleanup() {
            window.PubSub.unsub("onPostsZoomChange", zoomChangeHandle);
        };
    });

    if (postMode === "normal") var containerStyle = {};
    else containerStyle = { x };

    return (
        <animated.div {...containerBind()} className={"container" + (postMode === "small" ? " small" : "")} style={containerStyle}>
            {properties.map(({ x, visible }, i) => {
                if (postMode === "normal") var style = { x, display: visible.to((displ) => (displ === 0 ? "none" : "block")) };
                else style = {};

                return (
                    <animated.div key={i} className="posts" {...postsBind()} style={style}>
                        <animated.div className="zoom" style={{ scaleX, scaleY }}>
                            <Post></Post>
                        </animated.div>
                    </animated.div>
                );
            })}
        </animated.div>
    );
}
