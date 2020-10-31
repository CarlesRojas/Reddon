import React, { useState, useContext, useRef } from "react";
import SVG from "react-inlinesvg";

// Contexts
import { Reddit } from "contexts/Reddit";

// Icons
import RefreshIcon from "resources/Refresh.svg";
import RecentIcon from "resources/Recent.svg";

export default function Navbar(props) {
    // Contexts
    const { zooms, setZooms, currentSubreddit, setCurrentSubreddit } = useContext(Reddit);

    // State
    const [pageSwapped, setPageSwapped] = useState(false);
    const lastPage = useRef("all");

    // Save last page
    if (currentSubreddit === "all" || currentSubreddit === "homeSubreddit") lastPage.current = currentSubreddit;

    // Swap page
    const swapPage = (page) => {
        setPageSwapped(true);
        setCurrentSubreddit(page);
    };

    // Animate the page buttons
    if (pageSwapped && currentSubreddit === "all") var backgroundStyle = " left";
    else if (pageSwapped) backgroundStyle = " right";
    else backgroundStyle = lastPage.current === "all" ? " left" : " right";

    // Reset swapped page
    if (pageSwapped) setPageSwapped(false);

    // Handle zoom click
    const onZoomClicked = () => {
        console.log("Zoom 1");
        if (currentSubreddit === "all") setZooms({ ...zooms, all: !zooms.all });
        else if (currentSubreddit === "homeSubreddit") setZooms({ ...zooms, homeSubreddit: !zooms.homeSubreddit });
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
            <SVG className={"icon" + (zooms[currentSubreddit] ? " active" : "")} src={RecentIcon} onClick={onZoomClicked} />
        </div>
    );
}
