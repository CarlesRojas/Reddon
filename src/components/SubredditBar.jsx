import React, { useContext } from "react";
import SVG from "react-inlinesvg";

// Contexts
import { Reddit } from "contexts/Reddit";

// Icons
import CloseIcon from "resources/Close.svg";
import RecentIcon from "resources/Recent.svg";
import ReddonLogo from "resources/ReddonLogo.svg";

export default function SubredditBar(props) {
    // Props
    const { prevSubreddit } = props;

    // Contexts
    const { zooms, setZooms, currentSubreddit, setCurrentSubreddit, currSubredditID, subredditPosts, subredditsInfo } = useContext(Reddit);

    // Handle zoom click
    const onZoomClicked = () => {
        setZooms({ ...zooms, subreddit: !zooms.subreddit });
    };

    // Handle subreddit popup close click
    const onCloseClicked = () => {
        // Clear the posts
        subredditPosts.current = [];

        // Remove zoom
        setZooms({ ...zooms, subreddit: false });

        // Set the previous subreddit as the current one
        setCurrentSubreddit(prevSubreddit.current);
    };

    //Subreddit icon
    console.log("");
    if (
        currSubredditID.current in subredditsInfo.current &&
        "icon_img" in subredditsInfo.current[currSubredditID.current] &&
        subredditsInfo.current[currSubredditID.current].icon_img
    ) {
        var subredditIcon = <img className="barSubredditIcon" src={subredditsInfo.current[currSubredditID.current].icon_img} alt=""></img>;
    } else subredditIcon = <img className="barSubredditIcon" src={ReddonLogo} alt=""></img>;

    return (
        <div className="subredditBar">
            <SVG className="icon" src={CloseIcon} onClick={onCloseClicked} />
            <div className="currentSubreddit">
                {subredditIcon}
                <p>{currentSubreddit}</p>
            </div>
            <SVG className={"icon" + (zooms.subreddit ? " active" : "")} src={RecentIcon} onClick={onZoomClicked} />
        </div>
    );
}
