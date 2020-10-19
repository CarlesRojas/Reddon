import React, { useRef, useState, useContext } from "react";
import ReactPlayer from "react-player/lazy";

// Contexts
import { Reddit } from "contexts/Reddit";

export default function Player(props) {
    // Props
    const { video, index, currSubreddit } = props;

    // Contexts
    const { getRedditVideo } = useContext(Reddit);

    // #################################################
    //   URLS
    // #################################################

    // Get video url
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    var url = video.dash_url ? proxyurl + video.dash_url : null;

    //getRedditVideo(url);

    /*
    // Get audio url
    var firstPart = url.substr(0, url.indexOf("DASH"));
    var lastPart = url.substr(url.indexOf(".mp4"), url.length);
    var audio_url = firstPart + "DASH_audio" + lastPart;
    */

    // #################################################
    //   LOGIC
    // #################################################

    return (
        <React.Fragment>
            <div className="videoPlayer">
                <ReactPlayer url={url} controls width="100%" height="100%" />
            </div>
        </React.Fragment>
    );
}
