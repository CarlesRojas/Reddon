import React, { useState } from "react";
import SVG from "react-inlinesvg";

import RefreshIcon from "resources/Refresh.svg";

export default function Navbar() {
    const [selectedPage, setSelectedPage] = useState("home");
    const [pageSwapped, setPageSwapped] = useState(false);

    // Swap page
    const swapPage = (page) => {
        setPageSwapped(true);
        setSelectedPage(page);
    };

    // Set dark mode
    //document.body.classList.remove("dark");
    //document.body.classList.add("dark");

    // Animate the page buttons
    if (pageSwapped && selectedPage === "home") var backgroundStyle = " left";
    else if (pageSwapped) backgroundStyle = " right";
    else backgroundStyle = "";

    return (
        <div className="navbar">
            <SVG className="icon invisible" src={RefreshIcon} />
            <div className="pageSelector">
                <div className={"background" + backgroundStyle}></div>
                <div className={"title" + (selectedPage === "home" ? " selected" : "")} onClick={() => swapPage("home")}>
                    home
                </div>
                <div className={"title" + (selectedPage === "all" ? " selected" : "")} onClick={() => swapPage("all")}>
                    all
                </div>
            </div>
            <SVG className="icon spin" src={RefreshIcon} />
        </div>
    );
}
