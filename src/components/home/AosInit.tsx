"use client";

import "aos/dist/aos.css";
import AOS from "aos";
import { useEffect } from "react";

export function AosInit() {
  useEffect(() => {
    AOS.init({
      duration: 650,
      easing: "ease-out-cubic",
      once: true,
      offset: 24
    });
  }, []);

  return null;
}
