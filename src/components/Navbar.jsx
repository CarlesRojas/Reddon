import React, { useState, useContext, useRef, useEffect } from "react";
import SVG from "react-inlinesvg";

// Contexts
import { Reddit } from "contexts/Reddit";
import { Utils } from "contexts/Utils";

// Icons
import DarkModeIcon from "resources/DarkMode.svg";
import RecentIcon from "resources/Recent.svg";

export default function Navbar() {
    // Contexts
    const { zooms, setZooms, currentSubreddit, setCurrentSubreddit } = useContext(Reddit);
    const { setCookie } = useContext(Utils);

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
        if (currentSubreddit === "all") setZooms({ ...zooms, all: !zooms.all });
        else if (currentSubreddit === "homeSubreddit") setZooms({ ...zooms, homeSubreddit: !zooms.homeSubreddit });
    };

    // Dark Mode
    const [darkMode, setDarkMode] = useState(document.body.classList.contains("dark"));
    useEffect(() => {
        // Set the dark mode
        if (darkMode) document.body.classList.add("dark");
        else document.body.classList.remove("dark");

        // Save it in a cookie
        setCookie("reddon_dark_mode", darkMode ? 1 : 0);
    }, [darkMode, setCookie]);

    return (
        <div className="navbar">
            <SVG className={"icon" + (darkMode ? " darkMode" : "")} src={DarkModeIcon} onClick={() => setDarkMode(!darkMode)} />
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
