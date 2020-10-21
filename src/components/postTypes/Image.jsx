import React from "react";

export default function Image(props) {
    // Props
    const { images } = props;

    if (process.env.REACT_APP_DEBUG === "true") console.log("Render Image");

    var image = null;

    // Make sure the image exists
    if (images.length) {
        const { resolutions } = images[0];
        image = resolutions.length ? <img className="image" src={resolutions[resolutions.length - 1].url} alt=""></img> : null;
    }

    return <React.Fragment>{image}</React.Fragment>;
}
