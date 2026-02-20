"use client";

import { useEffect, useRef, useCallback } from "react";

import { getLocalDateISOString } from "../date-utils";

/**
 * Custom hook yang mendeteksi pergantian hari (midnight crossing).
 *
 * Menggunakan WAKTU LOKAL device, bukan UTC, untuk menghindari bug
 * di mana jam 00:00 - 07:00 WIB dianggap masih hari kemarin.
 */
export function useDateGuard(onDateChanged: () => void) {
    const lastDateRef = useRef<string>(getLocalDateISOString());

    const checkDateChange = useCallback(() => {
        const currentDate = getLocalDateISOString();
        if (currentDate !== lastDateRef.current) {
            console.log(`[DateGuard] Date changed: ${lastDateRef.current} → ${currentDate}`);
            lastDateRef.current = currentDate;
            onDateChanged();
        }
    }, [onDateChanged]);

    useEffect(() => {
        // 1. Visibility Change (tab switch / phone unlock)
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                checkDateChange();
            }
        };

        // 2. Window Focus 
        const handleFocus = () => {
            checkDateChange();
        };

        // 3. Periodic check every 60 seconds as fallback
        //    (untuk user yang membiarkan tab tetap terbuka malam-malam)
        const interval = setInterval(checkDateChange, 60_000);

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleFocus);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleFocus);
            clearInterval(interval);
        };
    }, [checkDateChange]);
}
