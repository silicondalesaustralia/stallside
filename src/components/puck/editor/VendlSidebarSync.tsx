"use client";

import { useEffect } from "react";
import { usePuck } from "@puckeditor/core";

/** Keeps Puck sidebars hidden — settings use a fixed overlay instead. */
export default function VendlSidebarSync() {
  const { dispatch } = usePuck();

  useEffect(() => {
    dispatch({
      type: "setUi",
      ui: {
        leftSideBarVisible: false,
        rightSideBarVisible: false,
        plugin: { current: null },
      },
    });
  }, [dispatch]);

  return null;
}
