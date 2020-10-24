import React, { useContext, useEffect, useRef } from "react";

import Posts from "components/Posts";

// Contexts
import { Utils } from "contexts/Utils";
import { Reddit } from "contexts/Reddit";

export default function SubredditPopup(props) {
    // Props
    const { open } = props;

    // Contexts
    const { useForceUpdate } = useContext(Utils);
    const { currentSubreddit, subredditPosts, getPosts } = useContext(Reddit);

    // Posts loaded ref
    const firstPostsLoaded = useRef(true);

    // Force update
    const forceUpdate = useForceUpdate();

    useEffect(() => {
        // Load fewer posts to show them faster to the user
        async function loadFirstPosts() {
            // Get first posts for "all" and "homeSubreddit"
            await getPosts(currentSubreddit, 8, true);

            // Force update
            forceUpdate();
        }

        // Load first posts
        if (!subredditPosts.length && open) loadFirstPosts();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSubreddit]);

    return (
        <div className="subredditPopup">
            <Posts subreddit={currentSubreddit} posts={subredditPosts} firstPostsLoaded={firstPostsLoaded}></Posts>
        </div>
    );
}
