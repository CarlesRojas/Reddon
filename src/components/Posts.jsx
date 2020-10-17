import React, { useState, useContext, useRef, useEffect } from "react";
import { animated, useSpring } from "react-spring";
import { useDrag } from "react-use-gesture";

import Post from "components/Post";

// Contexts
import { Utils } from "contexts/Utils";

// Constants
const ROW_WIDTH = window.innerWidth;
const BUFFER = 2;
const PLACEHOLDERS = 0;

export default function Posts(props) {
    // Props
    const { subreddit, posts } = props;

    // Contexts
    const { clamp } = useContext(Utils);

    // #################################################
    //   ZOOM CHANGE
    // #################################################

    // Zoom state
    const [zoomed, setZoomed] = useState(false);

    // Handles a change in the zoom
    const zoomChangeHandle = ({ subreddit: zoomSubreddit }) => {
        if (subreddit !== zoomSubreddit) return;

        // Snap to current post
        if (zoomed) {
            index.current = clamp(Math.round(-x.get() / ROW_WIDTH), 0, postsLengthRef.current - 1);
            setX({ x: index.current * -ROW_WIDTH, config: { decay: false, velocity: 0 } });
        }

        // Swap zoom scale and mode
        setZoomed(!zoomed);
    };

    // Handles a click on a post while zoomed in
    const postClickedHandle = ({ subreddit: postSubreddit, index: postClickedIndex }) => {
        if (subreddit !== postSubreddit) return;

        // Snap to current post
        index.current = postClickedIndex;
        setX({ x: index.current * -ROW_WIDTH, config: { decay: false, velocity: 0 } });

        // Swap zoom scale and mode
        zoomedRef.current = false;
        setZoomed(false);
    };

    // Listen for the events
    useEffect(() => {
        window.PubSub.sub("onZoomChange", zoomChangeHandle);
        window.PubSub.sub("onPostClicked", postClickedHandle);

        return function cleanup() {
            window.PubSub.unsub("onZoomChange", zoomChangeHandle);
            window.PubSub.unsub("onPostClicked", postClickedHandle);
        };
    });

    // #################################################
    //   GESTURES WITH INERTIA
    // #################################################

    // Current gesture and position state
    const [scrollLeft, setScrollLeft] = useState(0);
    const index = useRef(0);
    const gestureCancelled = useRef(false);

    // Refs that mirror the state
    const zoomedRef = useRef(zoomed);
    const postsLengthRef = useRef(posts.length);

    // Update zoomed ref
    useEffect(() => {
        zoomedRef.current = zoomed;
    }, [zoomed]);

    // Update postsLength ref
    useEffect(() => {
        postsLengthRef.current = posts.length;
    }, [posts]);

    // Update the index when the inertia position changes
    const onInertiaChangeHandle = (xDispl) => {
        // Set the current scroll left
        setScrollLeft(-xDispl);

        if (zoomedRef.current) {
            // Set the current index
            index.current = clamp(Math.round(-xDispl / ROW_WIDTH), 0, postsLengthRef.current - 1);

            // Prevent from going out of bounds
            const bounds = [-ROW_WIDTH * (postsLengthRef.current - 1), 0];
            const bound = xDispl >= bounds[1] ? bounds[1] : xDispl <= bounds[0] ? bounds[0] : undefined;
            if (bound !== undefined) setX({ x: bound, config: { decay: false, velocity: x.velocity } });
        }
    };

    // InertiaSpring
    const [{ x }, setX] = useSpring(() => ({ x: 0, onChange: onInertiaChangeHandle }));

    // Scroll Gesture
    const gestureBind = useDrag(
        ({ down, first, last, vxvy: [vx], movement: [mx], direction: [xDir], distance, cancel }) => {
            // Zoomed -> Move with inertia
            if (zoomed) {
                // While gesture is active -> Move without inertia
                if (down) setX({ x: mx, config: { decay: false, velocity: 0 } });
                // When the gesture ends -> Apply inertia
                else setX({ x: mx, config: { decay: true, velocity: vx } });
            }

            // Not Zoomed -> Move a post at a time
            else {
                // Start the gesture -> Not cancelled
                if (first) gestureCancelled.current = false;

                // Cancel gesture and snap to next post
                if (!gestureCancelled.current && ((down && distance > ROW_WIDTH * 0.4) || (last && Math.abs(vx) > 0.15))) {
                    // Cancel the gesture
                    gestureCancelled.current = true;

                    // Get the new index
                    const newIndex = clamp(index.current + (xDir > 0 ? -1 : 1), 0, Math.max(posts.length - 1, PLACEHOLDERS - 1));

                    // Cancel the event
                    cancel((index.current = newIndex));
                }

                // Animation in progress -> Set the spring x value
                else {
                    setX({ x: index.current * -ROW_WIDTH + (down ? mx : 0) });
                }
            }
        },
        { initial: () => [zoomed ? x.get() : 0, 0], rubberband: true, bounds: { left: -ROW_WIDTH * (posts.length - 1), right: 0 } }
    );

    // #################################################
    //   BUFFER UPDATE
    // #################################################

    // Current state settings
    const numColumns = posts.length > 0 ? posts.length : PLACEHOLDERS;
    const startIndex = Math.max(0, Math.floor(scrollLeft / ROW_WIDTH) - BUFFER);
    const endIndex = Math.min(startIndex + BUFFER * 2, numColumns);
    const totalWidth = ROW_WIDTH * numColumns;
    const paddingLeft = startIndex * ROW_WIDTH;

    // Elements to be rendered
    const renderedItems = [];
    let i = startIndex;

    // Add all items that will be shown
    while (i < endIndex) {
        if (i < posts.length) renderedItems.push(<Post key={posts[i].data.id} i={i} zoomed={zoomed} x={x} subreddit={subreddit}></Post>);
        else renderedItems.push(null);
        ++i;
    }

    // #################################################
    //   RENDER
    // #################################################

    // Style for the container
    var containerStyle = {
        width: totalWidth - paddingLeft,
        paddingLeft,
        x,
    };

    return (
        <div className={"posts" + (subreddit === "all" ? "" : " right")}>
            <animated.div className="container" {...gestureBind()} style={containerStyle}>
                {renderedItems}
            </animated.div>
        </div>
    );
}
