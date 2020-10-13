import React, { createContext } from "react";

// Utils Context
export const Utils = createContext();

const UtilsProvider = (props) => {
    // #######################################
    //      COOKIE HANDLE
    // #######################################

    // Set a cookie
    const setCookie = (name, value, expirationDays = 10) => {
        var date = new Date();
        date.setTime(date.getTime() + expirationDays * 24 * 60 * 60 * 1000);
        var expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    };

    // Get a cookie
    const getCookie = (name) => {
        var cookieName = name + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var splittedCookie = decodedCookie.split(";");
        for (var i = 0; i < splittedCookie.length; i++) {
            var c = splittedCookie[i];
            while (c.charAt(0) === " ") {
                c = c.substring(1);
            }
            if (c.indexOf(cookieName) === 0) {
                return c.substring(cookieName.length, c.length);
            }
        }
        return "";
    };

    // Delete a cookie
    const deleteCookie = (name) => {
        document.cookie = name + " =; expires = Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    };

    // Get all cookies
    const getCookies = () => {
        var pairs = document.cookie.split(";");
        var cookies = {};
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split("=");
            if (pair[0].includes("reddon")) cookies[(pair[0] + "").trim()] = unescape(pair.slice(1).join("="));
        }
        return cookies;
    };

    // Clear all cookies
    const clearCookies = () => {
        var res = document.cookie;
        var multiple = res.split(";");
        for (var i = 0; i < multiple.length; i++) {
            var key = multiple[i].split("=");
            if (key[0].includes("reddon")) document.cookie = key[0] + " =; expires = Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
    };

    // #######################################
    //      INTERPOLATIONS
    // #######################################

    // Clamp a value between a min and max
    const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));

    // Linear interpolation
    const lerp = (start, end, t) => start * (1 - t) + end * t;

    // Inverse linear interpolation
    const invlerp = (x, y, a) => clamp((a - x) / (y - x));

    return (
        <Utils.Provider
            value={{
                setCookie,
                getCookie,
                deleteCookie,
                getCookies,
                clearCookies,
                clamp,
                lerp,
                invlerp,
            }}
        >
            {props.children}
        </Utils.Provider>
    );
};

export default UtilsProvider;
