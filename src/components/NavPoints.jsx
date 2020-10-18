import React, { useRef } from "react";
import { animated, useSpring } from "react-spring";

const POINT_WIDTH = 20;

export default function NavPoints(props) {
    // Props
    const { index, length } = props;

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

    // Active point spring -> Left to right
    const leftToRight = useSpring({
        from: { width: POINT_WIDTH, x: prevIndex.current * POINT_WIDTH },
        to: [{ width: POINT_WIDTH * 2 }, { x: index * POINT_WIDTH, width: POINT_WIDTH }],
        config: { duration: 200 },
    });

    // Active point spring -> Right to left
    const rightToLeft = useSpring({
        from: { width: POINT_WIDTH, x: prevIndex.current * POINT_WIDTH },
        to: [{ width: POINT_WIDTH * 2, x: index * POINT_WIDTH }, { width: POINT_WIDTH }],
        config: { duration: 200 },
    });

    // Set animation direction
    if (prevIndex.current === index) var style = {};
    else if (prevIndex.current < index) style = leftToRight;
    else style = rightToLeft;

    console.log(`Index ${index}    Prev: ${prevIndex.current}`);

    // Set the index
    prevIndex.current = index;

    return (
        <div className="navPoints">
            <div className="navPointsContainer">
                <animated.div className="activePointContainer" style={style}>
                    <div className="activePoint"></div>
                </animated.div>
                {points}
            </div>
        </div>
    );
}
