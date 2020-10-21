import React, { useContext } from "react";

// Contexts
import { Utils } from "contexts/Utils";
import { Reddit } from "contexts/Reddit";

// Icon
import ReddonLogo from "resources/ReddonLogo.svg";

import UpvoteBar from "components/UpvoteBar";
import Text from "components/postTypes/Text";
import Image from "components/postTypes/Image";
import Images from "components/postTypes/Images";
import EmbededVideo from "components/postTypes/EmbededVideo";
import Player from "components/postTypes/Player";

export default function Post(props) {
    // Props
    const { postData, zoomed, index, currSubreddit } = props;

    // Contexts
    const { unixTimeToDate, timeAgo } = useContext(Utils);
    const { subredditsInfo } = useContext(Reddit);

    if (process.env.REACT_APP_DEBUG === "true") console.log("Render Post");

    // Post data
    //console.log(postData);
    const {
        name,
        subreddit,
        subreddit_id,
        author,
        title,
        selftext_html,
        created_utc,
        preview,
        media_metadata,
        media,
        url,
        domain,
        score,
        likes,
        post_hint,
        /*
        over_18,
        hidden,
        locked,
        */
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
    // #################################################

    //   Text
    const text = selftext_html ? <Text selfText={selftext_html}></Text> : null;

    //   IMAGES
    // #################################################

    // Image
    const image =
        preview && preview.images && preview.images.length ? (
            <Image images={preview.images} url={url} domain={domain} post_hint={post_hint}></Image>
        ) : null;

    // Image gallery
    const images =
        media_metadata && Object.values(media_metadata).length ? <Images images={Object.values(media_metadata)} zoomed={zoomed}></Images> : null;

    //   VIDEO
    // #################################################

    // Video Preview
    const video =
        preview && preview.reddit_video_preview ? (
            <Player video={preview.reddit_video_preview} index={index} currSubreddit={currSubreddit}></Player>
        ) : null;

    // Reddit video
    const redditVideo = media && media.reddit_video ? <Player video={media.reddit_video} index={index} currSubreddit={currSubreddit}></Player> : null;

    // Twitch video
    const twitchVideo = url && url.includes("clips.twitch.tv") ? <Player video={url} index={index} currSubreddit={currSubreddit}></Player> : null;

    // Embeded video
    const embededVideo = media && media.oembed ? <EmbededVideo embededVideo={media.oembed}></EmbededVideo> : null;

    //   PRIORITIES
    // #################################################

    // Image to display
    const finalImage = images ? images : image;

    // Video to display
    const finalVideo = twitchVideo ? twitchVideo : video ? video : redditVideo ? redditVideo : embededVideo;

    // Display only one media element
    const finalMedia = finalVideo ? finalVideo : finalImage;

    // Class for centering the upvoteBar in Player videos
    var correctMargin = finalVideo && !embededVideo ? "" : " true";

    return (
        <div className="post">
            <div className="mainContent">
                {subredditIcon}
                <p className="subreddit">{subreddit}</p>
                <p className="author">{author + " · " + timeAgo(unixTimeToDate(created_utc), false)}</p>
                <p className="title">{title}</p>
                {finalMedia}
                {text}
                <div className={"correctMargin" + correctMargin}></div>
                <UpvoteBar postID={name} score={score} likes={likes}></UpvoteBar>
            </div>
            <div className="comments"></div>
        </div>
    );
}
