import React, { useRef } from "react";
import { animated, useSpring } from "react-spring";

const POINT_WIDTH = 20;

export default function NavPoints(props) {
    // Props
    const { index, length } = props;

    if (process.env.REACT_APP_DEBUG === "true") console.log("Render NavPoints");

    // #################################################
    //   STATIC POINTS
    // #################################################

    // Background points
    var points = [];
    for (let i = 0; i < length; i++) {
        points.push(<div className="point" key={i}></div>);
    }

    // #################################################
    //   CURRENT POINT
    // #################################################

    // Previous index
    const prevIndex = useRef(0);

    // InertiaSpring
    const [{ x, width }, setX] = useSpring(() => ({ x: 0, width: POINT_WIDTH, config: { duration: 200 } }));

    // Active point spring -> Left to right
    if (prevIndex.current < index) {
        setX({ to: [{ width: POINT_WIDTH * 2 }, { x: index * POINT_WIDTH, width: POINT_WIDTH }] });
    }

    // Active point spring -> Right to left
    else if (prevIndex.current > index) {
        setX({ to: [{ width: POINT_WIDTH * 2, x: index * POINT_WIDTH }, { width: POINT_WIDTH }] });
    }

    // Update the index
    prevIndex.current = index;

    return (
        <div className="navPoints">
            <div className="navPointsContainer">
                <animated.div className="activePointContainer" style={{ x, width }}>
                    <div className="activePoint"></div>
                </animated.div>
                {points}
            </div>
        </div>
    );
}
