import React, { memo, useState } from "react";
import { useSpring, a } from "react-spring";
import { Frame, Title, Content, toggle } from "./styles";

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => void (ref.current = value), [value]);
    return ref.current;
}

function useMeasure() {
    const ref = useRef();
    const [bounds, set] = useState({ left: 0, top: 0, width: 0, height: 0 });
    const [ro] = useState(() => new ResizeObserver(([entry]) => set(entry.contentRect)));
    useEffect(() => {
        if (ref.current) ro.observe(ref.current);
        return () => ro.disconnect();
    }, []);
    return [{ ref }, bounds];
}

const Tree = memo(({ children, name, style, defaultOpen = false }) => {
    const [isOpen, setOpen] = useState(defaultOpen);
    const previous = usePrevious(isOpen);
    const [bind, { height: viewHeight }] = useMeasure();
    const { height, opacity, transform } = useSpring({
        from: { height: 0, opacity: 0, transform: "translate3d(20px,0,0)" },
        to: { height: isOpen ? viewHeight : 0, opacity: isOpen ? 1 : 0, transform: `translate3d(${isOpen ? 0 : 20}px,0,0)` },
    });
    const Icon = Icons[`${children ? (isOpen ? "Minus" : "Plus") : "Close"}SquareO`];
    return (
        <Frame>
            <Icon style={{ ...toggle, opacity: children ? 1 : 0.3 }} onClick={() => setOpen(!isOpen)} />
            <Title style={style}>{name}</Title>
            <Content style={{ opacity, height: isOpen && previous === isOpen ? "auto" : height }}>
                <a.div style={{ transform }} {...bind} children={children} />
            </Content>
        </Frame>
    );
});
