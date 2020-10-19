import React, { useEffect, useState, useContext } from "react";
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

    // Url proxy to avoid cors in the server 😬
    const proxyurl = "https://whispering-atoll-13206.herokuapp.com/";
    var url = video.dash_url ? proxyurl + video.dash_url : null;

    // #################################################
    //   AUTO PLAY/PAUSE
    // #################################################

    // State
    const [playback, setPlayback] = useState({ playing: index === 0 && currSubreddit === "all" });

    // Handle a change in the index
    const indexChangeHandle = ({ subreddit, index: newIndex }) => {
        // Play video
        if (subreddit === currSubreddit && index === newIndex) setPlayback({ ...playback, playing: true });
        // Pause video
        else setPlayback({ ...playback, playing: false });
    };

    // Listen for events
    useEffect(() => {
        window.PubSub.sub("onIndexChange", indexChangeHandle);

        return function cleanup() {
            window.PubSub.unsub("onIndexChange", indexChangeHandle);
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="videoPlayer">
            <ReactPlayer
                url={url}
                controls
                volume={0.2}
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
