import React, { useContext } from "react";

// Contexts
import { Utils } from "contexts/Utils";
import { Reddit } from "contexts/Reddit";

// Icon
import ReddonLogo from "resources/ReddonLogo.svg";

// Post Types
import Text from "components/postTypes/Text";
import Image from "components/postTypes/Image";
import Images from "components/postTypes/Images";

export default function Post(props) {
    // Props
    const { postData, zoomed } = props;

    // Contexts
    const { unixTimeToDate, timeAgo } = useContext(Utils);
    const { subredditsInfo } = useContext(Reddit);

    //console.log(postData);

    // Post data
    const {
        subreddit,
        subreddit_id,
        author,
        title,
        selftext_html,
        score,
        created_utc,
        preview,
        media_metadata,
        media,
        over_18,
        hidden,
        likes,
        locked,
    } = postData;

    // #################################################
    //   SUBREDDIT INFO
    // #################################################

    // Subreddit icon
    if (
        subreddit_id in subredditsInfo.current &&
        "icon_img" in subredditsInfo.current[subreddit_id] &&
        subredditsInfo.current[subreddit_id].icon_img
    ) {
        var subredditIcon = <img className="subredditIcon" src={subredditsInfo.current[subreddit_id].icon_img} alt=""></img>;
    } else subredditIcon = <img className="subredditIcon" src={ReddonLogo} alt=""></img>;

    // #################################################
    //   POST CONTENT
    // #################################################

    //   TEXT
    var text = selftext_html ? <Text selfText={selftext_html}></Text> : null;

    //   IMAGE
    var image = !media && !media_metadata && preview && preview.images && preview.images.length ? <Image images={preview.images}></Image> : null;

    //   IMAGES
    var images =
        !media && media_metadata && Object.values(media_metadata).length ? (
            <Images images={Object.values(media_metadata)} zoomed={zoomed}></Images>
        ) : null;

    return (
        <div className="post">
            {subredditIcon}
            <p className="subreddit">{subreddit}</p>
            <p className="author">{author + " · " + timeAgo(unixTimeToDate(created_utc), false)}</p>
            <p className="title">{title}</p>
            {images}
            {image}
            {text}
        </div>
    );
}
