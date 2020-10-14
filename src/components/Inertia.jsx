import { useCallback } from "react";
import { useSpring } from "react-spring";

export function useInertia(initialProps) {
    const [props, set] = useSpring(() => initialProps);

    const setInertia = useCallback(
        ({ config = {}, ...to }) => {
            const { inertia, bounds, velocities, ...rest } = config;
            if (inertia) {
                set({
                    ...to,
                    onChange: (values) => {
                        Object.entries(values).forEach(([key, v]) => {
                            const vel = props[key].velocity;
                            const bound = v >= bounds[key][1] ? bounds[key][1] : v <= bounds[key][0] ? bounds[key][0] : undefined;
                            if (bound !== undefined) {
                                props[key].stop();
                                set({ [key]: bound, config: { decay: false, velocity: vel } });
                            }
                        });
                    },
                    config: (k) => ({ decay: true, velocity: velocities[k] }),
                });
            } else {
                set({ ...to, config: rest });
            }
        },
        [props, set]
    );

    return [props, setInertia];
}
