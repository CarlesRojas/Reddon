import React from "react";

export default function Post(props) {
    const { i } = props;
    return (
        <div className="post">
            <div className="content">{i}</div>
        </div>
    );
}
