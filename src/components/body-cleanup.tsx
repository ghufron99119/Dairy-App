"use client";

import { useEffect } from "react";

export function BodyCleanup() {
    useEffect(() => {
        // Remove externally injected classes that cause hydration mismatch
        document.body.classList.remove("antigravity-scroll-lock");
    }, []);

    return null;
}
