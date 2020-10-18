import React, { useState, useRef, useContext } from "react";
import { animated, useSpring } from "react-spring";
import { useDrag } from "react-use-gesture";

// Contexts
import { Utils } from "contexts/Utils";

import NavPoints from "components/NavPoints";

// Constants
const POST_WIDTH = window.innerWidth - 6 - 12; // Total width - "postContainer" padding - "post" padding

export default function Images(props) {
    // Props
    const { images, zoomed } = props;

    // Contexts
    const { clamp } = useContext(Utils);

    // #################################################
    //   GESTURES WITH INERTIA
    // #################################################

    // Current gesture and position state
    const index = useRef(0);
    const [currIndex, setCurrIndex] = useState(0);
    const gestureCancelled = useRef(false);

    // InertiaSpring
    const [{ x }, setX] = useSpring(() => ({ x: 0 }));

    // Scroll Gesture
    const gestureBind = useDrag(
        ({ event, down, first, last, vxvy: [vx], movement: [mx], direction: [xDir], distance, cancel }) => {
            // Don's use the gesture if it is zoomed
            if (zoomed) return;

            // Stop event propagation
            event.stopPropagation();

            // Start the gesture -> Not cancelled
            if (first) gestureCancelled.current = false;

            // Cancel gesture and snap to next post
            if (!gestureCancelled.current && ((down && distance > POST_WIDTH * 0.4) || (last && Math.abs(vx) > 0.15))) {
                // Cancel the gesture
                gestureCancelled.current = true;

                // Get the new index
                const newIndex = clamp(index.current + (xDir > 0 ? -1 : 1), 0, images.length - 1);

                // Cancel the event
                cancel((index.current = newIndex));

                // Set the index
                setCurrIndex(newIndex);
            }

            // Animation in progress -> Set the spring x value
            else {
                setX({ x: index.current * -POST_WIDTH + (down ? mx : 0) });
            }
        },
        { rubberband: true }
    );

    return (
        <React.Fragment>
            <div className="images" {...gestureBind()}>
                {images.map(({ s }, i) => {
                    return <animated.img className="imageElem" key={i} src={s.u} alt="" style={{ x }}></animated.img>;
                })}
            </div>
            <NavPoints index={currIndex} length={images.length}></NavPoints>
        </React.Fragment>
    );
}
