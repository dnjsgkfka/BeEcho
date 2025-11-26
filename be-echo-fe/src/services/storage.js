const STORAGE_KEY_PREFIX = "be-echo:state:";

const getStorageKey = (userId) => {
  if (!userId) {
    return "be-echo:state:anonymous";
  }
  return `${STORAGE_KEY_PREFIX}${userId}`;
};

export const loadState = (userId) => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storageKey = getStorageKey(userId);
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.warn("로컬 스토리지 상태를 읽는 중 문제가 발생했어요.", error);
    return null;
  }
};

export const saveState = (state, userId) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const storageKey = getStorageKey(userId);
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    console.warn("로컬 스토리지에 상태를 저장하지 못했어요.", error);
  }
};

export const clearState = (userId) => {
  if (typeof window === "undefined") {
    return;
  }
  const storageKey = getStorageKey(userId);
  window.localStorage.removeItem(storageKey);
};

export const clearAllStates = () => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const keys = Object.keys(window.localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        window.localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn("로컬 스토리지 정리 중 문제가 발생했어요.", error);
  }
};
