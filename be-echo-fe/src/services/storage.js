const STORAGE_KEY = "be-echo:state";

export const loadState = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.warn("로컬 스토리지 상태를 읽는 중 문제가 발생했어요.", error);
    return null;
  }
};

export const saveState = (state) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("로컬 스토리지에 상태를 저장하지 못했어요.", error);
  }
};

export const clearState = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
};

