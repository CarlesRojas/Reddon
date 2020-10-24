import React from "react";
import ReactHtmlParser from "react-html-parser";

// Constants
const POST_WIDTH = window.innerWidth - 6 - 12; // Total width - "postContainer" padding - "post" padding

export default function EmbededVideo(props) {
    // Props
    const { embededVideo } = props;

    // Deconstruct
    const { html, height, width } = embededVideo;

    const ratio = height / width;
    const modifiedWidth = html.replace(width, POST_WIDTH.toString());
    const modifiedSize = modifiedWidth.replace(height, (POST_WIDTH * ratio).toString());

    return embededVideo.html ? <div className="embededVideo">{ReactHtmlParser(modifiedSize)}</div> : null;
}
