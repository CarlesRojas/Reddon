import React, { useRef, useEffect } from "react";

export default function Video(props) {
    // Props
    const { video, index, currSubreddit } = props;

    // State
    const videoRef = useRef(null);

    // Check if video is playing
    const isVideoPlaying = (video) => !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);

    // Handle a change in the index
    const indexChangeHandle = ({ subreddit, index: newIndex }) => {
        // Play video
        if (subreddit === currSubreddit && index === newIndex) videoRef.current.play();
        // Pause video
        else if (isVideoPlaying(videoRef.current)) videoRef.current.pause();
    };

    // Listen for events
    useEffect(() => {
        window.PubSub.sub("onIndexChange", indexChangeHandle);

        // Play video on load if it is the first
        videoRef.current.oncanplay = () => {
            if (index === 0 && currSubreddit === "all") videoRef.current.play();
        };

        return function cleanup() {
            window.PubSub.unsub("onIndexChange", indexChangeHandle);
        };
    }, []);

    return (
        <video ref={videoRef} className="video" controls>
            <source src={video.fallback_url} type="video/mp4"></source>
        </video>
    );
}
