import Cookies from "js-cookie";
import type { StateCreator } from "zustand";

export const WORKSPACE_COOKIE = "learnflow-workspace";

/**
 * The active topic context that filters the note-taking area / library,
 * the audio notification preference and the hidden dashboard widgets.
 */
export interface WorkspaceSlice {
  activeTopicId: string | null;
  soundMuted: boolean;
  hiddenWidgets: string[];
  setActiveTopic: (id: string | null) => void;
  toggleSoundMuted: () => void;
  toggleWidget: (widget: string) => void;
  showAllWidgets: () => void;
  /** Loads the cookie state on the client after mount (keeps SSR markup in sync). */
  hydrateWorkspace: () => void;
}

type WorkspaceCookie = Pick<
  WorkspaceSlice,
  "activeTopicId" | "soundMuted" | "hiddenWidgets"
>;

const fallback: WorkspaceCookie = {
  activeTopicId: null,
  soundMuted: false,
  hiddenWidgets: [],
};

function readWorkspaceCookie(): WorkspaceCookie {
  const cookieState = Cookies.get(WORKSPACE_COOKIE);
  if (!cookieState) return fallback;
  try {
    const parsed = JSON.parse(cookieState) as Partial<WorkspaceCookie>;
    return {
      activeTopicId:
        typeof parsed.activeTopicId === "string" ? parsed.activeTopicId : null,
      soundMuted: parsed.soundMuted === true,
      hiddenWidgets: Array.isArray(parsed.hiddenWidgets)
        ? parsed.hiddenWidgets.filter((w) => typeof w === "string")
        : [],
    };
  } catch {
    return fallback;
  }
}

function writeWorkspaceCookie(value: WorkspaceCookie) {
  Cookies.set(WORKSPACE_COOKIE, JSON.stringify(value), {
    expires: 365,
    path: "/",
    sameSite: "lax",
  });
}

const createWorkspaceSlice: StateCreator<WorkspaceSlice> = (set, get) => {
  const save = (patch: Partial<WorkspaceCookie>) => {
    const { activeTopicId, soundMuted, hiddenWidgets } = get();
    const next = { activeTopicId, soundMuted, hiddenWidgets, ...patch };
    writeWorkspaceCookie(next);
    set(next);
  };

  return {
    ...fallback,
    setActiveTopic: (id) => save({ activeTopicId: id }),
    toggleSoundMuted: () => save({ soundMuted: !get().soundMuted }),
    toggleWidget: (widget) => {
      const hidden = new Set(get().hiddenWidgets);
      if (!hidden.delete(widget)) hidden.add(widget);
      save({ hiddenWidgets: [...hidden] });
    },
    showAllWidgets: () => save({ hiddenWidgets: [] }),
    hydrateWorkspace: () => set(readWorkspaceCookie()),
  };
};

export default createWorkspaceSlice;
