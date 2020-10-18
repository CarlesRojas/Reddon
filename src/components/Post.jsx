import React, { useContext } from "react";
import ReactHtmlParser from "react-html-parser";

// Contexts
import { Utils } from "contexts/Utils";
import { Reddit } from "contexts/Reddit";

// Icon
import ReddonLogo from "resources/ReddonLogo.svg";

export default function Post(props) {
    // Props
    const { postData } = props;

    // Contexts
    const { unixTimeToDate, timeAgo } = useContext(Utils);
    const { subredditsInfo } = useContext(Reddit);

    console.log(postData);
    // Post data
    const { subreddit, subreddit_id, author, title, selftext_html, score, created_utc, preview, media, over_18, hidden, likes, locked } = postData;

    // Subreddit icon
    if (
        subreddit_id in subredditsInfo.current &&
        "icon_img" in subredditsInfo.current[subreddit_id] &&
        subredditsInfo.current[subreddit_id].icon_img
    ) {
        var subredditIcon = <img className="subredditIcon" src={subredditsInfo.current[subreddit_id].icon_img} alt=""></img>;
    } else subredditIcon = <img className="subredditIcon" src={ReddonLogo} alt=""></img>;

    // Text for the post
    var selfText = selftext_html ? <div className="selfText">{ReactHtmlParser(selftext_html)}</div> : null;

    return (
        <div className="post">
            {subredditIcon}
            <p className="subreddit">{subreddit}</p>
            <p className="author">{author + " · " + timeAgo(unixTimeToDate(created_utc), false)}</p>
            <p className="title">{title}</p>

            {selfText}
        </div>
    );
}
