import React from "react";
import ReactHtmlParser from "react-html-parser";

export default function Text(props) {
    // Props
    const { selfText } = props;

    return <div className="selfText">{ReactHtmlParser(selfText)}</div>;
}
