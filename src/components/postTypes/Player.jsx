import React, { useRef, useState } from "react";
import ReactPlayer from "react-player/lazy";

// Contexts
export default function Player(props) {
    // Props
    const { video, index, currSubreddit } = props;

    // #################################################
    //   URLS
    // #################################################

    // Get video url
    var url = video.fallback_url ? video.fallback_url : null;

    // Get audio url
    var firstPart = url.substr(0, url.indexOf("DASH"));
    var lastPart = url.substr(url.indexOf(".mp4"), url.length);
    var audio_url = firstPart + "DASH_audio" + lastPart;

    // #################################################
    //   LOGIC
    // #################################################

    // State
    const [playing, setPlaying] = useState(false);
    const videoRef = useRef(null);
    const audioRef = useRef(null);

    // Handle the video play or pause
    const handleVideoPlayPause = (playing) => {
        setPlaying(playing);
    };

    // Handle the user seeking a specific time
    const handleVideoSeek = (seconds) => {
        audioRef.current.seekTo(seconds, "seconds");
    };

    return (
        <React.Fragment>
            <div className="videoPlayer">
                <ReactPlayer
                    ref={videoRef}
                    url={url}
                    controls
                    width="100%"
                    height="100%"
                    onPlay={() => handleVideoPlayPause(true)}
                    onPause={() => handleVideoPlayPause(false)}
                    onBuffer={() => handleVideoPlayPause(false)}
                    onSeek={handleVideoSeek}
                />
            </div>
            <div className="audioPlayer">
                <ReactPlayer ref={audioRef} url={audio_url} playing={playing} controls width="100%" height="100%" />
            </div>
        </React.Fragment>
    );
}
