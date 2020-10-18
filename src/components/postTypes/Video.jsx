import React, { useRef, useEffect } from "react";

export default function Video(props) {
    // Props
    const { video, index, currSubreddit } = props;

    // State
    const videoRef = useRef(null);

    const indexChangeHandle = ({ subreddit, index: newIndex }) => {
        // Play video
        if (subreddit === currSubreddit && index === newIndex) videoRef.current.play();
        // Pause video
        else videoRef.current.pause();
    };

    // Listen for events
    useEffect(() => {
        window.PubSub.sub("onIndexChange", indexChangeHandle);

        return function cleanup() {
            window.PubSub.unsub("onIndexChange", indexChangeHandle);
        };
    });

    // Video
    var videoElem = (
        <video ref={videoRef} className="video" controls>
            <source src={video.fallback_url} type="video/mp4"></source>
        </video>
    );

    return <React.Fragment>{videoElem}</React.Fragment>;
}
