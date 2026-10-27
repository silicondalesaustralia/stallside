"use client";

import { useEffect } from "react";

export default function OpenOnHash({ id }: { id: string }) {
  useEffect(() => {
    if (window.location.hash !== `#${id}`) return;
    const element = document.getElementById(id);
    if (element instanceof HTMLDetailsElement) {
      element.open = true;
      element.scrollIntoView({ block: "start" });
    }
  }, [id]);

  return null;
}
