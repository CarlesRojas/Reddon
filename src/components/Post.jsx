import React from "react";

export default function Post(props) {
    const { i, zoomed } = props;
    return (
        <div className={"post" + (zoomed ? " zoomed" : "")}>
            <div className="content">{i}</div>
        </div>
    );
}
