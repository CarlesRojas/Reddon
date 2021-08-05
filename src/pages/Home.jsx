import React, { useContext, useRef, useEffect } from "react";
import { useSpring, animated } from "react-spring";
import { Redirect } from "react-router-dom";
import { useDrag } from "react-use-gesture";

import Navbar from "components/Navbar";
import Posts from "components/Posts";
import SubredditBar from "components/SubredditBar";

// Contexts
import { Utils } from "contexts/Utils";
import { Reddit } from "contexts/Reddit";

// Size of the viewport
const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

export default function Home() {
    // Contexts
    const { useForceUpdate, invlerp } = useContext(Utils);
    const { accessGranted, currentSubreddit, setCurrentSubreddit, getPosts, allPosts, homePosts, subredditPosts, setZooms, zooms } = useContext(Reddit);

    // Router history
    const prevSubreddit = useRef(currentSubreddit);

    // Access is not Granted -> Go to Landing Page
    if (!accessGranted) {
        // Reddirect to Landing Page
        var backToLanding = <Redirect to="/" />;
    }

    // #################################################
    //   NAVIGATION SPRINGS
    // #################################################

    // Handle navigation rest for the vertical navigation
    const verticalNavigationRestHandle = (data) => {
        if (data.value <= 5) {
            // Clear the posts
            subredditPosts.current = [];

            // Remove zoom
            setZooms({ ...zooms, subreddit: false });

            // Set the previous subreddit as the current one
            setCurrentSubreddit(prevSubreddit.current);
        }
    };

    // Horizontal avigation spring
    const subreddit = useRef("");
    const [{ x }, horizontalNavigationSet] = useSpring(() => ({ x: 0 }));
    const [{ y }, verticalNavigationSet] = useSpring(() => ({ y: 0, onRest: verticalNavigationRestHandle }));

    // If there is a change in subreddit -> Swap to that
    if (currentSubreddit !== subreddit.current) {
        // If the subreddit is "all" or "homeSubreddit" -> Move to that subreddit
        if (currentSubreddit === "all" || currentSubreddit === "homeSubreddit") {
            horizontalNavigationSet({ x: currentSubreddit === "all" ? 0 : -SCREEN_WIDTH });
            verticalNavigationSet({ y: 0 });
        }
        // Otherwise, show the other subreddit
        else {
            window.history.pushState({}, "", "home");
            verticalNavigationSet({ y: SCREEN_HEIGHT });
        }

        // Update previous ans current subreddit
        if (subreddit.current === "all" || subreddit.current === "homeSubreddit") prevSubreddit.current = subreddit.current;
        subreddit.current = currentSubreddit;
    }

    // #################################################
    //   NAVIGATION GESTURE
    // #################################################

    const gestureBind = useDrag(
        ({ down, first, last, vxvy: [vx, vy], movement: [, my], distance, cancel, canceled }) => {
            // If gesture is horizontal -> Cancel event
            if (first && Math.abs(vx) >= Math.abs(vy)) cancel();

            // Complete gesture
            if (!canceled && ((down && distance > SCREEN_HEIGHT * 0.5) || (last && vy < -0.15))) {
                verticalNavigationSet({ y: 0 });
                cancel();
            }

            // Animation in progress -> Set the spring y value
            else if (!canceled) verticalNavigationSet({ y: SCREEN_HEIGHT + (down ? Math.min(my, 0) : 0) });
        },
        { rubberband: true, filterTaps: true }
    );

    // #################################################
    //   FETCH FIRST POSTS
    // #################################################

    // State
    const firstPostsLoaded = useRef(false);

    // Force update
    const forceUpdate = useForceUpdate();

    // Load new posts for the custom subreddit
    // useEffect(() => {
    //     // Load fewer posts to show them faster to the user
    //     async function loadFirstPosts() {
    //         // Get first posts for "all" and "homeSubreddit"
    //         await getPosts(currentSubreddit, 8, true);

    //         // Force update
    //         forceUpdate();
    //     }

    //     // Load first posts
    //     if (!subredditPosts.length && currentSubreddit !== "all" && currentSubreddit !== "homeSubreddit") loadFirstPosts();

    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [currentSubreddit]);

    // Component did mount
    // useEffect(() => {
    //     // Load fewer posts to show them faster to the user
    //     async function loadFirstPosts() {
    //         // Get first posts for "all" and "homeSubreddit"
    //         await Promise.all([getPosts("all", 8, true), getPosts("homeSubreddit", 8)]);

    //         // Force update
    //         forceUpdate();

    //         // Get more posts for "all" and "homeSubreddit"
    //         await Promise.all([getPosts("all", 50), getPosts("homeSubreddit", 50)]);

    //         // Inform that the first posts have been loaded
    //         firstPostsLoaded.current = true;
    //     }

    //     // Load first posts
    //     //loadFirstPosts();

    //     // Register Back button
    //     window.onpopstate = function (event) {
    //         if (event.state && event.type === "popstate") {
    //             // Clear the posts
    //             subredditPosts.current = [];

    //             // Remove zoom
    //             setZooms({ ...zooms, subreddit: false });

    //             // Set the previous subreddit as the current one
    //             setCurrentSubreddit(prevSubreddit.current);
    //         }
    //     };

    //     return () => {
    //         window.onpopstate = null;
    //     };

    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    if (backToLanding) return backToLanding;

    return (
        <div className="app">
            <animated.div className="home" style={{ x }}>
                <Posts subreddit="all" posts={allPosts} firstPostsLoaded={firstPostsLoaded}></Posts>
                <Posts subreddit="homeSubreddit" posts={homePosts} firstPostsLoaded={firstPostsLoaded}></Posts>
            </animated.div>

            <Navbar></Navbar>

            <animated.div
                className="opacityScreen"
                style={{
                    opacity: y.to((y) => invlerp(0, SCREEN_HEIGHT, y)),
                    width: SCREEN_WIDTH,
                    height: SCREEN_HEIGHT,
                }}
            ></animated.div>
            <animated.div className="subredditPopupContainer" style={{ y, width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
                <div className="subredditPopup">
                    <Posts subreddit={currentSubreddit !== "all" && currentSubreddit !== "homeSubreddit" ? currentSubreddit : ""} posts={subredditPosts} firstPostsLoaded={firstPostsLoaded}></Posts>
                </div>
                <div {...gestureBind()}>
                    <SubredditBar prevSubreddit={prevSubreddit}></SubredditBar>
                </div>
            </animated.div>
        </div>
    );
}
