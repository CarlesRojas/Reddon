import React, { useState, useContext, useRef, useEffect } from "react";
import { animated } from "react-spring";
import { useDrag } from "react-use-gesture";

import Post from "components/Post";
import { useInertia } from "components/Inertia";

// Contexts
import { Utils } from "contexts/Utils";

// Constants
const ROW_WIDTH = window.innerWidth;
const ROW_WIDTH_SMALL = window.innerWidth * 0.75;
const BUFFER = 10;
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

        // Swap zoom scale and mode
        setZoomed(!zoomed);
    };

    // Listen for the events
    useEffect(() => {
        window.PubSub.sub("onZoomChange", zoomChangeHandle);

        return function cleanup() {
            window.PubSub.unsub("onZoomChange", zoomChangeHandle);
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

        // Set the current index
        if (zoomedRef.current) index.current = clamp(Math.round(-xDispl / ROW_WIDTH_SMALL), 0, postsLengthRef.current - 1);
    };

    // InertiaSpring
    const [{ x }, setX] = useInertia({ x: 0, onChange: onInertiaChangeHandle });

    // Scroll Gesture
    const gestureBind = useDrag(
        ({ down, first, last, vxvy: [vx], movement: [mx], direction: [xDir], distance, cancel }) => {
            // Zoomed -> Move with inertia
            if (zoomed) {
                // While gesture is active -> Move without inertia
                if (down) {
                    setX({ x: mx, config: { decay: false, velocity: 0 } });
                }

                // When the gesture ends -> Apply inertia
                else {
                    // Get max index displacement
                    const loadedBufferMin = Math.max(0, index.current - BUFFER + 1);
                    const loadedBufferMax = Math.min(posts.length - 1, index.current + BUFFER - 1);
                    const indexDispl = clamp(index.current + Math.round(vx * -1.1), loadedBufferMin, loadedBufferMax);

                    // Calculate the bounds for the spring
                    if (vx < 0) var bounds = [-ROW_WIDTH_SMALL * indexDispl, 0];
                    else bounds = [ROW_WIDTH_SMALL - totalWidth.current, -ROW_WIDTH_SMALL * indexDispl];

                    // Set the inertia
                    setX({ x: mx, config: { inertia: true, bounds: { x: bounds }, velocities: { x: vx } } });
                }
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
        { initial: () => [zoomed ? x.get() : 0, 0], rubberband: true }
    );

    // #################################################
    //   BUFFER UPDATE
    // #################################################

    // Current state settings
    const currRowWidth = zoomed ? ROW_WIDTH_SMALL : ROW_WIDTH;
    const numColumns = posts.length > 0 ? posts.length : PLACEHOLDERS;
    const startIndex = Math.max(0, Math.floor(scrollLeft / currRowWidth) - BUFFER);
    const endIndex = Math.min(startIndex + BUFFER * 2, numColumns);
    const totalWidth = currRowWidth * numColumns;
    const paddingLeft = startIndex * currRowWidth;

    // Elements to be rendered
    const renderedItems = [];
    let i = startIndex;

    // Add all items that will be shown
    while (i < endIndex) {
        if (i < posts.length) renderedItems.push(<Post key={posts[i].data.id} i={i} zoomed={zoomed}></Post>);
        else renderedItems.push(<Post key={i} i={-1} zoomed={zoomed}></Post>);
        ++i;
    }

    // #################################################
    //   RENDER
    // #################################################

    // Style for the container
    var containerStyle = {
        width: totalWidth - paddingLeft,
        paddingLeft: paddingLeft,
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
