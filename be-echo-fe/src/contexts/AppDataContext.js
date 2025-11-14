import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import createDefaultState from "../data/defaultState";
import footprintFacts from "../data/footprintFacts";
import { loadState, saveState, clearState } from "../services/storage";
import { deriveGradeName } from "../utils/grade";

const MAX_HISTORY_ENTRIES = 365;

{
  /* 기본 값 */
}
const defaultContextValue = {
  user: createDefaultState().user,
  home: {
    dateLabel: "",
    certificationMessage: "",
    stats: [],
    highlights: [],
    canVerify: true,
  },
  history: [],
  actions: {
    logVerification: () => {},
    resetState: () => {},
    updateProfile: () => {},
  },
  isLoading: false,
};

const AppDataContext = createContext(defaultContextValue);

{
  /* 날짜 관련 함수 */
}
const formatDateLabel = (date = new Date()) =>
  new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);

const formatDateKey = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().split("T")[0];
};

const differenceInDays = (dateA, dateB) => {
  const utcA = Date.UTC(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
  const utcB = Date.UTC(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
  const DAY = 1000 * 60 * 60 * 24;
  return Math.floor((utcB - utcA) / DAY);
};

{
  /* 랜덤 환경 정보 */
}
const pickRandomFactId = (excludeId = null) => {
  const candidates = excludeId
    ? footprintFacts.filter((fact) => fact.id !== excludeId)
    : footprintFacts;
  if (candidates.length === 0) {
    return excludeId;
  }
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index].id;
};

{
  /* 홈 섹션 */
}
const buildHomeSection = (state, derived) => {
  const today = new Date();
  const todayKey = formatDateKey(today);
  const lastSuccessKey = formatDateKey(state.user.lastSuccessDate);
  const hasCompletedToday = todayKey && todayKey === lastSuccessKey;

  return {
    dateLabel: formatDateLabel(today),
    certificationMessage: hasCompletedToday
      ? "오늘 인증은 이미 완료되었어요. 내일 봐요!"
      : "오늘의 텀블러 인증을 시작해보세요!",
    canVerify: !hasCompletedToday,
    stats: [
      {
        id: "streak",
        label: "연속",
        value: `${state.user.streakDays ?? 0}일`,
        accent: "streak",
      },
      {
        id: "total",
        label: "총 인증",
        value: `${derived.totalSuccess}회`,
        accent: "total",
      },
      {
        id: "lp",
        label: "LP",
        value: `${state.user.lp}점`,
        accent: "rank",
      },
    ],
  };
};

{
  /* 뷰 모델 */
}
const buildViewModel = (state) => {
  const successEntries = state.history.filter((entry) => entry.success);
  const totalSuccess = successEntries.length;
  const totalFail = state.history.length - totalSuccess;

  const fact =
    footprintFacts.find((item) => item.id === state.fact?.id) ?? null;

  const derived = {
    totalSuccess,
    totalFail,
    fact,
  };

  const home = buildHomeSection(state, { ...derived, fact });

  return {
    user: {
      ...state.user,
      grade: deriveGradeName(state.user.lp),
    },
    home,
    history: state.history,
    fact,
  };
};

{
  /* 인증 결과 적용 */
}
const applyVerificationResult = (state, payload) => {
  const now = new Date();
  const nowIso = now.toISOString();
  const todayKey = formatDateKey(now);
  const lastSuccessKey = formatDateKey(state.user.lastSuccessDate);
  const alreadySuccessToday =
    Boolean(payload.success) && todayKey && todayKey === lastSuccessKey;

  let baseHistory = state.history;
  if (payload.success && !alreadySuccessToday) {
    baseHistory = baseHistory.filter((entry) => {
      if (entry.success) return true;
      const entryKey = formatDateKey(entry.timestamp);
      return entryKey !== todayKey;
    });
  }

  const entry = {
    id: `entry-${now.getTime()}`,
    timestamp: nowIso,
    success: Boolean(payload.success) && !alreadySuccessToday,
    message:
      payload.message ||
      (payload.success
        ? "텀블러 인증을 완료했어요!"
        : "텀블러 인증이 실패했어요."),
    confidence:
      typeof payload.confidence === "number"
        ? payload.confidence
        : payload.score ?? null,
    imageDataUrl: payload.imageDataUrl ?? null,
  };

  const meta = {
    accepted: entry.success,
    alreadyCompleted: alreadySuccessToday,
  };

  if (alreadySuccessToday) {
    entry.message = "오늘 인증은 이미 완료되었어요. 내일 다시 시도해주세요.";
  }

  const history = [entry, ...baseHistory].slice(0, MAX_HISTORY_ENTRIES);
  {/* LP 계산 */}
  let lp = state.user.lp || 0;
  let streakDays = state.user.streakDays || 0;
  let bestStreak = state.user.bestStreak || 0;
  let lastSuccessDate = state.user.lastSuccessDate || null;

  {/* 인증 성공 시 */}
  if (entry.success) {
    const lastSuccess = state.user.lastSuccessDate
      ? new Date(state.user.lastSuccessDate)
      : null;

    {/* 연속 인증 기록 */}
    let nextStreak = 1;
    if (lastSuccess && !Number.isNaN(lastSuccess.getTime())) {
      const gap = differenceInDays(lastSuccess, now);
      if (gap === 0) {
        nextStreak = streakDays || 1;
      } else if (gap === 1) {
        nextStreak = (streakDays || 0) + 1;
      } else {
        nextStreak = 1;
      }
    }

    streakDays = nextStreak;
    bestStreak = Math.max(bestStreak, nextStreak);
    lp += 10;
    lastSuccessDate = nowIso;
  }

  return {
    state: {
      ...state,
      user: {
        ...state.user,
        lp,
        streakDays,
        bestStreak,
        lastSuccessDate,
        lastVerificationDate: nowIso,
      },
      history,
    },
    meta,
  };
};

{/* 앱 데이터 제공 */}
export const AppDataProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    const stored = loadState();
    if (!stored) {
      return createDefaultState();
    }
    return {
      ...createDefaultState(),
      ...stored,
      user: {
        ...createDefaultState().user,
        ...(stored.user || {}),
      },
      history: Array.isArray(stored.history) ? stored.history : [],
    };
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (!state.fact?.id) {
      const nextId = pickRandomFactId(null);
      setState((prev) => ({
        ...prev,
        fact: { id: nextId, updatedAt: Date.now() },
      }));
      return;
    }

    {/* 환경 정보 업데이트 */}
    const lastUpdated = state.fact.updatedAt
      ? new Date(state.fact.updatedAt)
      : null;
    if (!lastUpdated || differenceInDays(lastUpdated, new Date()) !== 0) {
      const nextId = pickRandomFactId(state.fact.id);
      setState((prev) => ({
        ...prev,
        fact: { id: nextId, updatedAt: Date.now() },
      }));
    }
  }, [state.fact]);


  const logVerification = useCallback((payload) => {
    let meta = { accepted: false };
    setState((prev) => {
      const result = applyVerificationResult(prev, payload);
      meta = result.meta;
      return result.state;
    });
    return meta;
  }, []);

  {/* 앱 데이터 초기화 */}
  const resetState = useCallback(() => {
    const next = createDefaultState();
    setState(next);
    clearState();
  }, []);

  {/* 유저 정보 업데이트 */}
  const updateProfile = useCallback((updates) => {
    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        ...updates,
      },
    }));
  }, []);

  {/* 뷰 모델 생성 */}
  const value = useMemo(() => {
    const viewModel = buildViewModel(state);
    return {
      ...viewModel,
      actions: {
        logVerification,
        resetState,
        updateProfile,
      },
      isLoading: false,
    };
  }, [state, logVerification, resetState, updateProfile]);

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);
