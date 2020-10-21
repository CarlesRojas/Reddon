import React, { useState, useContext, useRef, useEffect } from "react";
import { animated, useSpring } from "react-spring";
import { useDrag } from "react-use-gesture";

import PostContainer from "components/PostContainer";

// Contexts
import { Utils } from "contexts/Utils";
import { Reddit } from "contexts/Reddit";

// Constants
const ROW_WIDTH = window.innerWidth;
const BUFFER = 10;
const PLACEHOLDERS = 0;
const LOAD_MORE_BUFFER = 30;

export default function Posts(props) {
    // Props
    const { subreddit, posts, firstPostsLoaded } = props;

    // Contexts
    const { clamp } = useContext(Utils);
    const { getPosts } = useContext(Reddit);

    if (process.env.REACT_APP_DEBUG === "true") console.log("Render Posts");

    // #################################################
    //   LOAD MORE POSTS
    // #################################################

    // True if posts for this subreddit are already getting loaded
    const loadingPostsTimeout = useRef(false);

    // Gets the next posts for this subreddit
    const loadMorePosts = async () => {
        // Return if we are already loading more posts
        if (loadingPostsTimeout.current || !firstPostsLoaded.current) return;

        // Start loading posts
        loadingPostsTimeout.current = true;
        await getPosts(subreddit, 50, true);
        loadingPostsTimeout.current = false;
    };

    // #################################################
    //   ZOOM CHANGE
    // #################################################

    // Zoom state
    const [zoomed, setZoomed] = useState(false);

    // Handles a change in the zoom
    const zoomChangeHandle = ({ subreddit: zoomSubreddit }) => {
        if (subreddit !== zoomSubreddit) return;

        // Snap to current post
        if (zoomedRef.current) {
            index.current = clamp(Math.round(-x.get() / ROW_WIDTH), 0, posts.current.length - 1);
            setX({ x: index.current * -ROW_WIDTH, config: { decay: false, velocity: 0 } });

            // Load posts if needed
            if (index.current > posts.current.length - LOAD_MORE_BUFFER) loadMorePosts();

            // Inform about the index change
            window.PubSub.emit("onIndexChange", { subreddit, index: index.current });
        }

        // Swap zoom scale and mode
        setZoomed(!zoomedRef.current);
    };

    // Handles a click on a post while zoomed in
    const postClickedHandle = ({ subreddit: postSubreddit, index: postClickedIndex }) => {
        if (subreddit !== postSubreddit) return;

        // Snap to current post
        index.current = postClickedIndex;
        setX({ x: index.current * -ROW_WIDTH, config: { decay: false, velocity: 0 } });

        // Load posts if needed
        if (index.current > posts.current.length - LOAD_MORE_BUFFER) loadMorePosts();

        // Inform about the index change
        window.PubSub.emit("onIndexChange", { subreddit, index: index.current });

        // Swap zoom scale and mode
        zoomedRef.current = false;
        setZoomed(false);
    };

    // Listen for events
    useEffect(() => {
        window.PubSub.sub("onZoomChange", zoomChangeHandle);
        window.PubSub.sub("onPostClicked", postClickedHandle);

        return function cleanup() {
            window.PubSub.unsub("onZoomChange", zoomChangeHandle);
            window.PubSub.unsub("onPostClicked", postClickedHandle);
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // #################################################
    //   GESTURES WITH INERTIA
    // #################################################

    // Current gesture and position state
    const [scrollLeft, setScrollLeft] = useState(0);
    const index = useRef(0);
    const gestureCancelled = useRef(false);

    // Refs that mirror the state
    const zoomedRef = useRef(zoomed);

    // Update zoomed ref
    useEffect(() => {
        zoomedRef.current = zoomed;
    }, [zoomed]);

    // Update the index when the inertia position changes
    const onInertiaChangeHandle = (xDispl) => {
        // Set the current scroll left
        setScrollLeft(-xDispl);

        if (zoomedRef.current) {
            // Set the current index
            index.current = clamp(Math.round(-xDispl / ROW_WIDTH), 0, posts.current.length - 1);

            // Load posts if needed
            if (index.current > posts.current.length - LOAD_MORE_BUFFER) loadMorePosts();

            // Inform about the index change
            window.PubSub.emit("onIndexChange", { subreddit, index: index.current });

            // Prevent from going out of bounds
            const bounds = [-ROW_WIDTH * (posts.current.length - 1), 0];
            const bound = xDispl >= bounds[1] ? bounds[1] : xDispl <= bounds[0] ? bounds[0] : undefined;
            if (bound !== undefined) setX({ x: bound, config: { decay: false, velocity: x.velocity } });
        }
    };

    // InertiaSpring
    const [{ x }, setX] = useSpring(() => ({ x: 0, onChange: onInertiaChangeHandle }));

    // Scroll Gesture
    const gestureBind = useDrag(
        ({ down, first, last, vxvy: [vx, vy], movement: [mx], direction: [xDir], distance, cancel }) => {
            // If gesture is vertical -> Cancel event
            if (first && Math.abs(vy) >= Math.abs(vx)) cancel();

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
                    const newIndex = clamp(index.current + (xDir > 0 ? -1 : 1), 0, Math.max(posts.current.length - 1, PLACEHOLDERS - 1));

                    // Cancel the event
                    cancel((index.current = newIndex));

                    // Inform about the index change
                    window.PubSub.emit("onIndexChange", { subreddit, index: index.current });

                    // Load posts if needed
                    if (index.current > posts.current.length - LOAD_MORE_BUFFER) loadMorePosts();
                }

                // Animation in progress -> Set the spring x value
                else {
                    setX({ x: index.current * -ROW_WIDTH + (down ? mx : 0) });
                }
            }
        },
        { initial: () => [zoomed ? x.get() : 0, 0], rubberband: true, filterTaps: true }
    );

    // #################################################
    //   BUFFER UPDATE
    // #################################################

    // Current state settings
    const numColumns = posts.current.length > 0 ? posts.current.length : PLACEHOLDERS;
    const startIndex = Math.max(0, Math.floor(scrollLeft / ROW_WIDTH) - BUFFER);
    const endIndex = Math.min(startIndex + BUFFER * 2, numColumns);
    const totalWidth = ROW_WIDTH * numColumns;
    const paddingLeft = startIndex * ROW_WIDTH;

    // Elements to be rendered
    const renderedItems = [];
    let i = startIndex;

    // Add all items that will be shown
    while (i < endIndex) {
        if (i < posts.current.length)
            renderedItems.push(
                <PostContainer
                    key={subreddit + i + posts.current[i].data.id}
                    i={i}
                    zoomed={zoomed}
                    x={x}
                    subreddit={subreddit}
                    postData={posts.current[i].data}
                ></PostContainer>
            );
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
