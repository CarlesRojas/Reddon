import React from "react";
import ReactHtmlParser from "react-html-parser";

export default function Text(props) {
    // Props
    const { selfText } = props;

    if (process.env.REACT_APP_DEBUG === "true") console.log("Render Text");

    return <div className="selfText">{ReactHtmlParser(selfText)}</div>;
}
