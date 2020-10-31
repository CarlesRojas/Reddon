import React, { useContext, useRef, useState, useEffect, memo } from "react";
import { useSpring, animated } from "react-spring";
import ReactHtmlParser from "react-html-parser";

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
import Video from "components/postTypes/Video";

// Comment object
const Comment = memo(({ children, commentData, style, defaultOpen = true, icons }) => {
    // Contexts
    const { usePrevious, useMeasure } = useContext(Utils);

    // State to hold if it is open or not
    const [isOpen, setOpen] = useState(defaultOpen);

    // Hook for knowing if parent is closed
    const previous = usePrevious(isOpen);

    // Size of the replies
    const [bind, { height: viewHeight }] = useMeasure();

    // Comment enter and exit spring
    const { height, opacity, transform } = useSpring({
        from: { height: 0, opacity: 0, transform: "translate3d(20px,0,0)" },
        to: { height: isOpen ? viewHeight : 0, opacity: isOpen ? 1 : 0, transform: `translate3d(${isOpen ? 0 : 20}px,0,0)` },
    });

    // If it is a comment
    if (commentData.type === "comment") {
        // Deconstruct comment
        const { author, author_fullname, created, body_html } = commentData;

        // Author icon
        if (author_fullname in icons.current && "icon_img" in icons.current[author_fullname] && icons.current[author_fullname].icon_img) {
            var authorIcon = <img className="authorIcon" src={icons.current[author_fullname].icon_img} alt=""></img>;
        } else authorIcon = <img className="authorIcon" src={ReddonLogo} alt=""></img>;

        // Comment body
        const commentBody = body_html ? <div className="commentText">{ReactHtmlParser(body_html)}</div> : null;

        return (
            <div className="comment">
                <div className="content" style={style} onClick={() => setOpen(!isOpen)}>
                    <div className="authorInfo">
                        {authorIcon}
                        <span className="authorName">{author}</span>
                        <span className="created">• {created}</span>
                    </div>
                    {commentBody}
                </div>
                <animated.div className="replies" style={{ opacity, height: isOpen && previous === isOpen ? "auto" : height }}>
                    <animated.div style={{ transform }} {...bind} children={children} />
                </animated.div>
            </div>
        );
    }

    // If it a link to more comments
    else {
        // Get link text
        const linkText = commentData.count === 1 ? "1 more reply" : `${commentData.count} more replies`;

        return <div className="loadMoreComments">{linkText}</div>;
    }
});

const Post = memo((props) => {
    // Props
    const { postData, index, currSubreddit } = props;

    // Contexts
    const { unixTimeToDate, timeAgo } = useContext(Utils);
    const { zooms, subredditsInfo, setCurrentSubreddit, currSubredditID, getComments, postComments, authorsIcons } = useContext(Reddit);

    // Zoom access elem
    const zoomSubredditKey = currSubreddit === "all" ? "all" : currSubreddit === "homeSubreddit" ? "homeSubreddit" : "subreddit";

    // Post data
    const {
        id,
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

    if (subreddit_id in subredditsInfo.current && "icon_img" in subredditsInfo.current[subreddit_id] && subredditsInfo.current[subreddit_id].icon_img) {
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
    const image = preview && preview.images && preview.images.length ? <Image images={preview.images} url={url} domain={domain} post_hint={post_hint}></Image> : null;

    // Image gallery
    const images = media_metadata && Object.values(media_metadata).length ? <Images images={Object.values(media_metadata)} zoomed={zooms[zoomSubredditKey]}></Images> : null;

    //   VIDEO
    // #################################################

    // Video Preview
    const video = preview && preview.reddit_video_preview ? <Video video={preview.reddit_video_preview} index={index} currSubreddit={currSubreddit}></Video> : null;

    // Reddit video
    const redditVideo = media && media.reddit_video ? <Video video={media.reddit_video} index={index} currSubreddit={currSubreddit}></Video> : null;

    // Twitch video
    const twitchVideo = url && url.includes("clips.twitch.tv") ? <Video video={url} index={index} currSubreddit={currSubreddit}></Video> : null;

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

    // Class for centering the upvoteBar in Videos
    var correctMargin = finalVideo && !embededVideo ? "" : " true";

    // #################################################
    //   SUBREDDIT CLICK
    // #################################################

    // Open the new subreddit if we are not in a custom subreddit already
    const subredditClickHandle = () => {
        if (currSubreddit === "all" || currSubreddit === "homeSubreddit") {
            setCurrentSubreddit(subreddit);
            currSubredditID.current = subreddit_id;
        }
    };

    // #################################################
    //   COMMENTS
    // #################################################

    // Comments for the post
    const [commentTree, setCommentTree] = useState(null);

    // Get the comments component
    const getCommentsTree = (commentArray) => {
        if (!commentArray) return null;

        // Return comment array Tree
        return commentArray.map((commentData, i) => {
            var replies = "replies" in commentData ? getCommentsTree(commentData.replies) : null;

            return (
                <Comment key={i} commentData={commentData} icons={authorsIcons}>
                    {replies}
                </Comment>
            );
        });
    };

    // Load the comments
    getComments(subreddit, id, name, 100);

    // Show the comments
    const indexChangeHandle = ({ subreddit: eventSubreddit, index: eventIndex }) => {
        // If the current post is this one
        if (eventSubreddit === currSubreddit && index === eventIndex && !zooms[zoomSubredditKey]) {
            console.log(currSubreddit);
            console.log(index);
            console.log(zooms[zoomSubredditKey]);
            console.log("");
        }
        //if (eventSubreddit === currSubreddit && index === eventIndex && !zooms[zoomSubredditKey]) setCommentTree(getCommentsTree(postComments.current[name]));
    };

    // Listen for events
    useEffect(() => {
        window.PubSub.sub("onIndexChange", indexChangeHandle);

        return function cleanup() {
            window.PubSub.unsub("onIndexChange", indexChangeHandle);
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="post">
            <div className="mainContent">
                <div className="subredditLink" onClick={subredditClickHandle}>
                    {subredditIcon}
                    <p className="subreddit">{subreddit}</p>
                </div>

                <p className="author">{author + " • " + timeAgo(unixTimeToDate(created_utc), false)}</p>
                <p className="title">{title}</p>
                {finalMedia}
                {text}
                <div className={"correctMargin" + correctMargin}></div>
                <UpvoteBar postID={name} score={score} likes={likes}></UpvoteBar>
            </div>
            <div className="comments">{commentTree}</div>
        </div>
    );
});

export default Post;
