import React, { useState, useContext, useRef } from "react";
import SVG from "react-inlinesvg";

// Contexts
import { Reddit } from "contexts/Reddit";

// Icons
import CloseIcon from "resources/Close.svg";
import RecentIcon from "resources/Recent.svg";

export default function SubredditBar(props) {
    // Props
    const { prevSubreddit } = props;

    // Contexts
    const { zooms, setZooms, currentSubreddit, setCurrentSubreddit, subredditPosts } = useContext(Reddit);

    // Handle zoom click
    const onZoomClicked = () => {
        console.log("ZOOM SUBREDDIT");
        setZooms({ ...zooms, subreddit: !zooms.subreddit });
    };

    const onCloseClicked = () => {
        // Clear the posts
        subredditPosts.current = [];

        // Set the previous subreddit as the current one
        setCurrentSubreddit(prevSubreddit.current);
    };

    return (
        <div className="subredditBar">
            <SVG className="icon" src={CloseIcon} onClick={onCloseClicked} />
            <div className="currentSubreddit"></div>
            <SVG className={"icon" + (zooms[currentSubreddit] ? " active" : "")} src={RecentIcon} onClick={onZoomClicked} />
        </div>
    );
}
