import React, { useState, useContext } from "react";
import SVG from "react-inlinesvg";

// Contexts
import { Reddit } from "contexts/Reddit";

// Icons
import RefreshIcon from "resources/Refresh.svg";
import RecentIcon from "resources/Recent.svg";

export default function Navbar() {
    // Contexts
    const { currentSubreddit, setCurrentSubreddit } = useContext(Reddit);

    if (process.env.REACT_APP_DEBUG === "true") console.log("Render Navbar");

    // State
    const [pageSwapped, setPageSwapped] = useState(false);
    const [zoomed, setZoomed] = useState(false);

    // Swap page
    const swapPage = (page) => {
        setPageSwapped(true);
        setCurrentSubreddit(page);
    };

    // Animate the page buttons
    if (pageSwapped && currentSubreddit === "all") var backgroundStyle = " left";
    else if (pageSwapped) backgroundStyle = " right";
    else backgroundStyle = "";

    // Handle zoom click
    const onZoomClicked = () => {
        setZoomed(!zoomed);

        // Inform about a zoom change
        window.PubSub.emit("onZoomChange", { subreddit: currentSubreddit });
    };

    return (
        <div className="navbar">
            <SVG className="icon spin" src={RefreshIcon} />
            <div className="pageSelector">
                <div className={"background" + backgroundStyle}></div>
                <div className={"title" + (currentSubreddit === "all" ? " selected" : "")} onClick={() => swapPage("all")}>
                    all
                </div>
                <div className={"title" + (currentSubreddit === "homeSubreddit" ? " selected" : "")} onClick={() => swapPage("homeSubreddit")}>
                    home
                </div>
            </div>
            <SVG className={"icon" + (zoomed ? " active" : "")} src={RecentIcon} onClick={onZoomClicked} />
        </div>
    );
}
