import React, { useState, useContext, useRef, useEffect } from "react";
import { animated, useSpring } from "react-spring";
import { useDrag } from "react-use-gesture";

import Post from "./Post";

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
    const animating = useRef(false);

    // Handles a change in the zoom
    const zoomInOut = ({ subreddit: zoomSubreddit }) => {
        if (subreddit !== zoomSubreddit) return;

        // Snap to current post
        if (zoomedRef.current) {
            index.current = clamp(Math.round(-x.get() / ROW_WIDTH), 0, posts.current.length - 1);
            setX({ x: index.current * -ROW_WIDTH, config: { decay: false, velocity: 0 } });

            // Load posts if needed
            if (index.current > posts.current.length - LOAD_MORE_BUFFER) loadMorePosts();

            // Inform about the index change
            window.PubSub.emit("onIndexChange", { subreddit, index: index.current });

            // Inform about the zoom being disabled
            window.PubSub.emit("onPostClicked");
        }

        // Swap zoom scale and mode
        setZoomed(!zoomedRef.current);
    };

    // Handles a click on a post while zoomed in
    const postClickedHandle = (postClickedIndex) => {
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
        window.PubSub.sub("onZoomChange", zoomInOut);

        return function cleanup() {
            window.PubSub.unsub("onZoomChange", zoomInOut);
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // #################################################
    //   GESTURES WITH INERTIA
    // #################################################

    // Current gesture and position state
    const [scrollLeft, setScrollLeft] = useState(0);
    const index = useRef(0);

    // Refs that mirror the state
    const zoomedRef = useRef(zoomed);

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
        ({ down, first, last, vxvy: [vx, vy], movement: [mx], direction: [xDir], distance, cancel, canceled }) => {
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
                // Cancel gesture and snap to next post
                if (!canceled && ((down && distance > ROW_WIDTH * 0.4) || (last && Math.abs(vx) > 0.15))) {
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
    //   SPRING STYLES
    // #################################################

    // Style
    var transitionStyle = {};

    // Animate only when zoom changes
    if (zoomedRef.current !== zoomed || animating.current) {
        if (zoomedRef.current !== zoomed) zoomedRef.current = zoomed;
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

    // Add all items that will be shown
    for (let i = startIndex; i < endIndex; i++) {
        // Post inside limits
        if (i < posts.current.length) {
            // Post styles
            var animatedScaleStyle = {};
            var animatedPositionStyle = {};

            // Get the style for the post
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

            // Add a post to render
            renderedItems.push(
                <div className="postContainer" key={subreddit + i + posts.current[i].data.id}>
                    <animated.div className="animatedPosition" style={{ ...animatedPositionStyle, ...transitionStyle }}>
                        <animated.div
                            className="animatedScale"
                            style={{ ...animatedScaleStyle, ...transitionStyle }}
                            onClick={() => postClickedHandle(i)}
                        >
                            <Post postData={posts.current[i].data} zoomed={zoomed} index={i} currSubreddit={subreddit}></Post>
                        </animated.div>
                    </animated.div>
                </div>
            );
        }

        // Push a null object
        else renderedItems.push(null);
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
