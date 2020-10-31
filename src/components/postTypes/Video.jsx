import React, { useEffect, useState, useContext } from "react";
import ReactPlayer from "react-player/lazy";

// Contexts
import { Reddit } from "contexts/Reddit";

export default function Video(props) {
    // Props
    const { video, index, currSubreddit } = props;

    // Contexts
    const { currentSubreddit } = useContext(Reddit);

    // #################################################
    //   URLS
    // #################################################

    // Url directly
    if (typeof video === "string" && video.includes("clips.twitch.tv")) {
        var url = video;
    }

    // Url proxy to avoid cors in the server 😬
    else {
        const proxyurl = "https://whispering-atoll-13206.herokuapp.com/";
        url = video.dash_url ? proxyurl + video.dash_url : null;
    }

    // #################################################
    //   AUTO PLAY/PAUSE
    // #################################################

    // State
    const [playback, setPlayback] = useState({ playing: index === 0 && currSubreddit === "all" });

    // Handle a change in the index
    const indexChangeHandle = ({ forcePause, subreddit, index: newIndex }) => {
        // Play video
        if (!forcePause && subreddit === currSubreddit && index === newIndex) setPlayback({ ...playback, playing: true });
        // Pause video
        else setPlayback({ ...playback, playing: false });
    };

    // Pause video if we change subreddits
    useEffect(() => {
        if (currentSubreddit !== currSubreddit) setPlayback({ ...playback, playing: false });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSubreddit]);

    // Listen for events
    useEffect(() => {
        window.PubSub.sub("onIndexChange", indexChangeHandle);

        return () => {
            window.PubSub.unsub("onIndexChange", indexChangeHandle);
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="videoPlayer">
            <ReactPlayer
                url={url}
                controls
                volume={0.5}
                playing={playback.playing}
                width="100%"
                height="100%"
                config={{
                    file: {
                        attributes: {
                            autoPlay: false,
                            controlsList: "nodownload noremoteplayback",
                            disablePictureInPicture: true,
                        },
                    },
                }}
            />
        </div>
    );
}
