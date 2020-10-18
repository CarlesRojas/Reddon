import React, { useContext } from "react";

// Contexts
import { Utils } from "contexts/Utils";
import { Reddit } from "contexts/Reddit";

// Icon
import ReddonLogo from "resources/ReddonLogo.svg";

// Post Types
import Text from "components/postTypes/Text";
import Image from "components/postTypes/Image";
import Video from "components/postTypes/Video";
import Images from "components/postTypes/Images";
import EmbededVideo from "components/postTypes/EmbededVideo";
import Player from "components/postTypes/Player";

export default function Post(props) {
    // Props
    const { postData, zoomed, index, currSubreddit } = props;

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

    //   PREVIEW MP4
    var video =
        preview && preview.reddit_video_preview ? (
            <Player video={preview.reddit_video_preview} index={index} currSubreddit={currSubreddit}></Player>
        ) : null;

    //   IMAGE
    var image =
        !media && !media_metadata && preview && !preview.reddit_video_preview && preview.images && preview.images.length ? (
            <Image images={preview.images}></Image>
        ) : null;

    //   IMAGES
    var images =
        media_metadata && Object.values(media_metadata).length ? <Images images={Object.values(media_metadata)} zoomed={zoomed}></Images> : null;

    //   REDDIT VIDEO
    var redditVideo =
        preview && !preview.reddit_video_preview && media && media.reddit_video ? (
            <Player video={media.reddit_video} index={index} currSubreddit={currSubreddit}></Player>
        ) : null;

    // Embeded video
    var embededVideo =
        preview && !preview.reddit_video_preview && media && !media.reddit_video && media.oembed ? (
            <EmbededVideo embededVideo={media.oembed}></EmbededVideo>
        ) : null;

    return (
        <div className="post">
            {subredditIcon}
            <p className="subreddit">{subreddit}</p>
            <p className="author">{author + " · " + timeAgo(unixTimeToDate(created_utc), false)}</p>
            <p className="title">{title}</p>
            {images}
            {video}
            {redditVideo}
            {embededVideo}
            {image}
            {text}
        </div>
    );
}
