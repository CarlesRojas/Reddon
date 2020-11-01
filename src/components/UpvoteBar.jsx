import React, { useContext, useState } from "react";
import SVG from "react-inlinesvg";

// Contexts
import { Utils } from "contexts/Utils";
import { Reddit } from "contexts/Reddit";

// Icons
import UpvoteIcon from "resources/Upvote.svg";
import MessageIcon from "resources/Message.svg";

export default function UpvoteBar(props) {
    // Props
    const { ID, score, likes, numComments, isComment } = props;

    // Contexts
    const { format_number } = useContext(Utils);
    const { vote } = useContext(Reddit);

    // #################################################
    //   UP & DOWN VOTE
    // #################################################

    // State
    const [upvoted, setUpvoted] = useState(likes);
    const [downvoted, setDownvoted] = useState(typeof likes === "boolean" && !likes);

    // Upvote
    const upvote = (event) => {
        // Stop Propagation
        event.stopPropagation();

        // Vote over api
        vote(ID, upvoted ? "0" : "1");

        // Update icons
        setUpvoted(!upvoted);
        setDownvoted(false);
    };

    // Downvote
    const downvote = (event) => {
        // Stop Propagation
        event.stopPropagation();

        // Vote over api
        vote(ID, downvoted ? "0" : "-1");

        // Update icons
        setDownvoted(!downvoted);
        setUpvoted(false);
    };

    return (
        <div className={"upvoteBar" + (isComment ? " commentBar" : "")}>
            <SVG className="message" src={MessageIcon} />
            <span className={"messageNum" + (isComment ? " invisible" : "")}>{format_number(numComments)}</span>
            <SVG className={"upvote" + (upvoted ? " active" : "")} src={UpvoteIcon} onClick={upvote} />
            <span className={"score" + (upvoted ? " up" : downvoted ? " down" : "")}>{format_number(score + (upvoted ? 1 : downvoted ? -1 : 0))}</span>
            <SVG className={"downvote up" + (downvoted ? " active" : "")} src={UpvoteIcon} onClick={downvote} />
        </div>
    );
}
