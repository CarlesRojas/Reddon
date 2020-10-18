import React, { useState, useRef, useContext } from "react";
import { animated, useSpring } from "react-spring";
import { useDrag } from "react-use-gesture";

// Contexts
import { Utils } from "contexts/Utils";

// Constants
const ROW_WIDTH = window.innerWidth - 6 - 12; // Total width - "postContainer" padding - "post" padding

export default function Images(props) {
    // Props
    const { images } = props;

    // Contexts
    const { clamp } = useContext(Utils);

    // #################################################
    //   GESTURES WITH INERTIA
    // #################################################

    // Current gesture and position state
    const [scrollLeft, setScrollLeft] = useState(0);
    const index = useRef(0);
    const gestureCancelled = useRef(false);

    // Update the index when the inertia position changes
    const onInertiaChangeHandle = (xDispl) => {
        // Set the current scroll left
        setScrollLeft(-xDispl);
    };

    // InertiaSpring
    const [{ x }, setX] = useSpring(() => ({ x: 0, onChange: onInertiaChangeHandle }));

    // Scroll Gesture
    const gestureBind = useDrag(
        ({ down, first, last, vxvy: [vx], movement: [mx], direction: [xDir], distance, cancel }) => {
            // Start the gesture -> Not cancelled
            if (first) gestureCancelled.current = false;

            // Cancel gesture and snap to next post
            if (!gestureCancelled.current && ((down && distance > ROW_WIDTH * 0.4) || (last && Math.abs(vx) > 0.15))) {
                // Cancel the gesture
                gestureCancelled.current = true;

                // Get the new index
                const newIndex = clamp(index.current + (xDir > 0 ? -1 : 1), 0, images.length - 1);

                // Cancel the event
                cancel((index.current = newIndex));
            }

            // Animation in progress -> Set the spring x value
            else {
                setX({ x: index.current * -ROW_WIDTH + (down ? mx : 0) });
            }
        },
        { rubberband: true }
    );

    return (
        <div className="images" {...gestureBind()}>
            {images.map(({ s }, i) => {
                return <animated.img className="imageElem" key={i} src={s.u} alt="" style={{ x }}></animated.img>;
            })}
        </div>
    );
}
