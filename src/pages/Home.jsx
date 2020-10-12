import React, { useContext } from "react";
import Navbar from "components/Navbar";

// Contexts
import { API } from "contexts/API";

export default function Home(props) {
    // Contexts
    const { getPostsAll } = useContext(API);

    getPostsAll();

    return (
        <div className="app">
            <Navbar></Navbar>
            <div className="pageContainer"></div>
        </div>
    );
}
