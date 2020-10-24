import React from "react";
import SVG from "react-inlinesvg";

// Icons
import LinkIcon from "resources/Link.svg";

export default function Image(props) {
    // Props
    const { images, url, domain, post_hint } = props;

    var image = null;

    // Make sure the image exists
    if (images.length) {
        const { resolutions } = images[0];
        image = resolutions.length ? <img className="image" src={resolutions[resolutions.length - 1].url} alt=""></img> : null;
    }

    // Make sure the link exists
    var link =
        post_hint === "link" && url && domain ? (
            <a href={url} className="linkContainer">
                <p>{domain}</p>
                <SVG className="linkIcon" src={LinkIcon} />
            </a>
        ) : null;

    return (
        <React.Fragment>
            {image}
            {link}
        </React.Fragment>
    );
}
