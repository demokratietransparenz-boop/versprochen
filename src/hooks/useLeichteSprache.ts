"use client";

import { useState, useEffect } from "react";

const COOKIE_NAME = "leichte-sprache";

export function useLeichteSprache() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const value = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${COOKIE_NAME}=`));
    setActive(value?.split("=")[1] === "1");
  }, []);

  function toggle() {
    const newValue = !active;
    document.cookie = `${COOKIE_NAME}=${newValue ? "1" : "0"}; path=/; max-age=31536000`;
    setActive(newValue);
  }

  return { active, toggle };
}
