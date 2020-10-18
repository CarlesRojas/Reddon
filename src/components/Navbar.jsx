import React, { useState, useContext } from "react";
import SVG from "react-inlinesvg";

// Contexts
import { Reddit } from "contexts/Reddit";

// Icons
import RefreshIcon from "resources/Refresh.svg";

export default function Navbar() {
    // Contexts
    const { currentSubreddit, setCurrentSubreddit } = useContext(Reddit);

    // State
    const [pageSwapped, setPageSwapped] = useState(false);

    // Swap page
    const swapPage = (page) => {
        setPageSwapped(true);
        setCurrentSubreddit(page);
    };

    // Animate the page buttons
    if (pageSwapped && currentSubreddit === "all") var backgroundStyle = " left";
    else if (pageSwapped) backgroundStyle = " right";
    else backgroundStyle = "";

    return (
        <div className="navbar">
            <SVG className="icon invisible" src={RefreshIcon} />
            <div className="pageSelector">
                <div className={"background" + backgroundStyle}></div>
                <div className={"title" + (currentSubreddit === "all" ? " selected" : "")} onClick={() => swapPage("all")}>
                    all
                </div>
                <div className={"title" + (currentSubreddit === "homeSubreddit" ? " selected" : "")} onClick={() => swapPage("homeSubreddit")}>
                    home
                </div>
            </div>
            <SVG className="icon spin" src={RefreshIcon} />
        </div>
    );
}
