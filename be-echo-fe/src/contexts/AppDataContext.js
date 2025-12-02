import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import createDefaultState from "../data/defaultState";
import footprintFacts from "../data/footprintFacts";
import {
  loadState,
  saveState,
  clearState,
  clearAllStates,
} from "../services/storage";
import { deriveGradeName } from "../utils/grade";
import { getLocalDateString } from "../utils/date";
import { MAX_HISTORY_ENTRIES, INSIGHT_WEEKS } from "../constants/app";
import { logError } from "../utils/logger";
import { useAuth } from "./AuthContext";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";

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
  achievements: {
    progress: "0 / 0 달성",
    personal: [],
    lockedSlots: 0,
  },
  history: [],
  insights: {
    summary: {},
    weeklyTrend: [],
  },
  actions: {
    logVerification: () => {},
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
  return getLocalDateString(date);
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
  /* 업적 계산 */
}
const recalculateAchievements = (user, history) => {
  const historySuccessCount = history.filter((entry) => entry.success).length;
  const successCount =
    user.totalSuccessCount !== undefined && user.totalSuccessCount !== null
      ? Math.max(user.totalSuccessCount, historySuccessCount)
      : historySuccessCount;
  const streakDays = user.streakDays || 0;
  const bestStreak = user.bestStreak || 0;
  const lp = user.lp || 0;
  const hasGroup = !!user.groupId;

  // 모든 업적 정의 (항상 표시)
  const allAchievements = [
    // 첫 인증
    {
      id: "firstProof",
      title: "첫 걸음",
      description: "첫 텀블러 인증을 완료하세요",
      variant: "medal",
      emoji: "🌱",
      unlocked: successCount >= 1,
    },
    // 스트릭 업적
    {
      id: "streak7",
      title: "일주일 완주",
      description: "7일 연속으로 인증하세요",
      variant: "streak",
      emoji: "⭐",
      unlocked: bestStreak >= 7,
    },
    {
      id: "streak14",
      title: "2주 도전",
      description: "14일 연속으로 인증하세요",
      variant: "streak",
      emoji: "💪",
      unlocked: bestStreak >= 14,
    },
    {
      id: "streak30",
      title: "한 달 마스터",
      description: "30일 연속으로 인증하세요",
      variant: "streak",
      emoji: "🏆",
      unlocked: bestStreak >= 30,
    },
    {
      id: "streak50",
      title: "50일 연속",
      description: "50일 연속으로 인증하세요",
      variant: "streak",
      emoji: "👑",
      unlocked: bestStreak >= 50,
    },
    {
      id: "streak100",
      title: "100일 연속",
      description: "100일 연속으로 인증하세요",
      variant: "streak",
      emoji: "💯",
      unlocked: bestStreak >= 100,
    },
    // LP 업적
    {
      id: "lp10",
      title: "LP 10",
      description: "총 10 LP를 획득하세요",
      variant: "lp",
      emoji: "🌿",
      unlocked: lp >= 10,
    },
    {
      id: "lp50",
      title: "LP 50",
      description: "총 50 LP를 획득하세요",
      variant: "lp",
      emoji: "🌳",
      unlocked: lp >= 50,
    },
    {
      id: "lp100",
      title: "LP 100",
      description: "총 100 LP를 획득하세요",
      variant: "lp",
      emoji: "🎯",
      unlocked: lp >= 100,
    },
    {
      id: "lp200",
      title: "LP 200",
      description: "총 200 LP를 획득하세요",
      variant: "lp",
      emoji: "🌟",
      unlocked: lp >= 200,
    },
    {
      id: "lp300",
      title: "LP 300",
      description: "총 300 LP를 획득하세요",
      variant: "lp",
      emoji: "💎",
      unlocked: lp >= 300,
    },
    {
      id: "lp500",
      title: "LP 500",
      description: "총 500 LP를 획득하세요",
      variant: "lp",
      emoji: "✨",
      unlocked: lp >= 500,
    },
    {
      id: "lp1000",
      title: "LP 1000",
      description: "총 1000 LP를 획득하세요",
      variant: "lp",
      emoji: "🚀",
      unlocked: lp >= 1000,
    },
    // 총 인증 횟수 업적
    {
      id: "total5",
      title: "5회 인증",
      description: "총 5회 인증을 완료하세요",
      variant: "green",
      emoji: "📸",
      unlocked: successCount >= 5,
    },
    {
      id: "total10",
      title: "10회 인증",
      description: "총 10회 인증을 완료하세요",
      variant: "green",
      emoji: "📷",
      unlocked: successCount >= 10,
    },
    {
      id: "total25",
      title: "25회 인증",
      description: "총 25회 인증을 완료하세요",
      variant: "green",
      emoji: "🎬",
      unlocked: successCount >= 25,
    },
    {
      id: "total50",
      title: "50회 인증",
      description: "총 50회 인증을 완료하세요",
      variant: "green",
      emoji: "🎥",
      unlocked: successCount >= 50,
    },
    {
      id: "total100",
      title: "100회 인증",
      description: "총 100회 인증을 완료하세요",
      variant: "green",
      emoji: "🎞️",
      unlocked: successCount >= 100,
    },
    {
      id: "total500",
      title: "500회 인증",
      description: "총 500회 인증을 완료하세요",
      variant: "green",
      emoji: "🏅",
      unlocked: successCount >= 500,
    },
    // 특별 업적
    {
      id: "weekPerfect",
      title: "완벽한 한 주",
      description: "일주일 동안 매일 인증하세요",
      variant: "purple",
      emoji: "📅",
      unlocked: bestStreak >= 7,
    },
    {
      id: "monthPerfect",
      title: "완벽한 30일",
      description: "30일 동안 매일 인증하세요",
      variant: "purple",
      emoji: "📆",
      unlocked: bestStreak >= 30,
    },
    {
      id: "ecoWarrior",
      title: "에코 워리어",
      description: "환경을 지키는 전사가 되세요",
      variant: "blue",
      emoji: "🌍",
      unlocked: successCount >= 50 && lp >= 200,
    },
    {
      id: "ecoMaster",
      title: "에코 마스터",
      description: "환경 보호의 달인이 되세요",
      variant: "blue",
      emoji: "🌎",
      unlocked: successCount >= 100 && lp >= 500,
    },
    // 그룹 관련 업적
    {
      id: "joinGroup",
      title: "함께하기",
      description: "그룹에 참여하세요",
      variant: "orange",
      emoji: "👥",
      unlocked: hasGroup,
    },
    {
      id: "createGroup",
      title: "그룹 창립자",
      description: "그룹을 생성하세요",
      variant: "orange",
      emoji: "🏛️",
      unlocked: hasGroup && user.isGroupLeader === true,
    },
    {
      id: "groupPerfectDay",
      title: "완벽한 하루",
      description: "그룹의 모든 멤버가 인증한 날",
      variant: "purple",
      emoji: "🎉",
      unlocked: false,
    },
    {
      id: "groupLP100",
      title: "그룹 LP 100",
      description: "그룹 총 LP가 100을 달성하세요",
      variant: "orange",
      emoji: "🌟",
      unlocked: false,
    },
    {
      id: "groupLP500",
      title: "그룹 LP 500",
      description: "그룹 총 LP가 500을 달성하세요",
      variant: "orange",
      emoji: "💫",
      unlocked: false,
    },
  ];

  const unlockedCount = allAchievements.filter((item) => item.unlocked).length;

  const sortedAchievements = [...allAchievements].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    return 0;
  });

  return {
    progress: `${unlockedCount} / ${allAchievements.length} 달성`,
    all: sortedAchievements,
    personal: sortedAchievements.filter((item) => item.unlocked),
    lockedSlots: 0,
  };
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
    highlights: [
      {
        id: "fact-highlight",
        title: derived.fact?.title ?? "생활 속 환경 팁",
        description:
          derived.fact?.description ?? "텀블러 인증으로 지구를 지켜요.",
        badge: "인사이트",
        badgeVariant: "warning",
      },
      {
        id: "best-streak",
        title: "최고 스트릭 갱신 도전!",
        description: `현재 최고 기록은 ${state.user.bestStreak ?? 0}일입니다.`,
        badge: `${state.user.bestStreak ?? 0}일`,
      },
    ],
  };
};

{
  /* 인사이트 계산 */
}
const buildInsights = (state, derived) => {
  const today = new Date();

  const startOfWeek = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = (day + 6) % 7;
    d.setDate(d.getDate() - diff);
    return d;
  };

  const weeklyTrend = Array.from({ length: INSIGHT_WEEKS }).map((_, index) => {
    const weekStart = startOfWeek(today);
    weekStart.setDate(weekStart.getDate() - index * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const count = state.history.filter((entry) => {
      if (!entry.success) return false;
      const entryDate = new Date(entry.timestamp);
      return entryDate >= weekStart && entryDate < weekEnd;
    }).length;

    const label = index === 0 ? "이번 주" : `${index}주 전`;

    return {
      label,
      count,
    };
  });

  return {
    summary: {
      totalSuccess: derived.totalSuccess,
      totalFail: derived.totalFail,
      bestStreak: state.user.bestStreak ?? 0,
      lp: state.user.lp,
    },
    weeklyTrend: weeklyTrend.reverse(),
  };
};

{
  /* 뷰 모델 */
}
const buildViewModel = (state) => {
  const successEntries = state.history.filter((entry) => entry.success);
  const historySuccessCount = successEntries.length;
  const totalSuccess =
    state.user.totalSuccessCount !== undefined &&
    state.user.totalSuccessCount !== null
      ? Math.max(state.user.totalSuccessCount, historySuccessCount)
      : historySuccessCount;
  const totalFail = state.history.length - historySuccessCount;

  const fact =
    footprintFacts.find((item) => item.id === state.fact?.id) ?? null;

  const derived = {
    totalSuccess,
    totalFail,
    fact,
  };

  const achievements = recalculateAchievements(state.user, state.history);
  const home = buildHomeSection(state, { ...derived, fact });
  const insights = buildInsights(state, { ...derived, fact });

  return {
    user: {
      ...state.user,
      grade: deriveGradeName(state.user.lp),
    },
    home,
    achievements,
    history: state.history,
    insights,
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
  {
    /* LP 계산 */
  }
  let lp = state.user.lp || 0;
  let streakDays = state.user.streakDays || 0;
  let bestStreak = state.user.bestStreak || 0;
  let lastSuccessDate = state.user.lastSuccessDate || null;

  {
    /* 인증 성공 시 */
  }
  if (entry.success) {
    const lastSuccess = state.user.lastSuccessDate
      ? new Date(state.user.lastSuccessDate)
      : null;

    {
      /* 연속 인증 기록 */
    }
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

  // 총 인증 성공 횟수 업데이트
  const totalSuccessCount = entry.success
    ? (state.user.totalSuccessCount || 0) + 1
    : state.user.totalSuccessCount || 0;

  return {
    state: {
      ...state,
      user: {
        ...state.user,
        lp,
        streakDays,
        bestStreak,
        totalSuccessCount,
        lastSuccessDate,
        lastVerificationDate: nowIso,
      },
      history,
    },
    meta,
  };
};

{
  /* 앱 데이터 제공 */
}
export const AppDataProvider = ({ children }) => {
  const { user: authUser } = useAuth();
  const [currentUserId, setCurrentUserId] = useState(null);
  const prevUserIdRef = useRef(null);

  const [state, setState] = useState(() => {
    return createDefaultState();
  });

  useEffect(() => {
    if (authUser?.id) {
      const newUserId = authUser.id;

      if (prevUserIdRef.current && prevUserIdRef.current !== newUserId) {
        clearState(prevUserIdRef.current);
      }

      prevUserIdRef.current = newUserId;
      setCurrentUserId(newUserId);

      const stored = loadState(newUserId);
      if (stored) {
        const history = Array.isArray(stored.history) ? stored.history : [];

        const calculatedTotalSuccess = history.filter(
          (entry) => entry.success
        ).length;
        const userTotalSuccessCount = stored.user?.totalSuccessCount;

        setState({
          ...createDefaultState(),
          ...stored,
          user: {
            ...createDefaultState().user,
            ...(stored.user || {}),
            id: authUser.id,
            name: authUser.name || stored.user?.name || "사용자",
            username:
              authUser.username ||
              authUser.name ||
              stored.user?.username ||
              stored.user?.name ||
              "사용자",
            email: authUser.email || stored.user?.email,
            photoURL: authUser.photoURL || stored.user?.photoURL,
            lp: authUser.lp !== undefined ? authUser.lp : stored.user?.lp || 0,
            streakDays:
              authUser.streakDays !== undefined
                ? authUser.streakDays
                : stored.user?.streakDays || 0,
            bestStreak:
              authUser.bestStreak !== undefined
                ? authUser.bestStreak
                : stored.user?.bestStreak || 0,
            totalSuccessCount:
              authUser.totalSuccessCount !== undefined
                ? authUser.totalSuccessCount
                : userTotalSuccessCount !== undefined &&
                  userTotalSuccessCount !== null
                ? Math.max(userTotalSuccessCount, calculatedTotalSuccess)
                : calculatedTotalSuccess,
            lastSuccessDate:
              authUser.lastSuccessDate || stored.user?.lastSuccessDate,
            groupId:
              authUser.groupId !== undefined
                ? authUser.groupId
                : stored.user?.groupId || null,
            isGroupLeader:
              authUser.isGroupLeader !== undefined
                ? authUser.isGroupLeader
                : stored.user?.isGroupLeader || false,
          },
          history,
        });
      } else {
        setState((prev) => ({
          ...createDefaultState(),
          user: {
            ...createDefaultState().user,
            id: authUser.id,
            name: authUser.name || "사용자",
            username: authUser.username || authUser.name || "사용자",
            email: authUser.email,
            photoURL: authUser.photoURL,
            lp: authUser.lp || 0,
            streakDays: authUser.streakDays || 0,
            bestStreak: authUser.bestStreak || 0,
            totalSuccessCount: authUser.totalSuccessCount || 0,
            lastSuccessDate: authUser.lastSuccessDate,
            groupId: authUser.groupId || null,
            isGroupLeader: authUser.isGroupLeader || false,
          },
        }));
      }
    } else {
      if (prevUserIdRef.current) {
        clearState(prevUserIdRef.current);
        prevUserIdRef.current = null;
      }
      setCurrentUserId(null);
      setState(createDefaultState());
    }
  }, [authUser?.id]);

  useEffect(() => {
    if (authUser) {
      setState((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          id: authUser.id,
          name: authUser.name || prev.user.name || "사용자",
          username:
            authUser.username ||
            authUser.name ||
            prev.user.username ||
            prev.user.name ||
            "사용자",
          email: authUser.email || prev.user.email,
          photoURL: authUser.photoURL || prev.user.photoURL,
          lp: authUser.lp !== undefined ? authUser.lp : prev.user.lp,
          streakDays:
            authUser.streakDays !== undefined
              ? authUser.streakDays
              : prev.user.streakDays,
          bestStreak:
            authUser.bestStreak !== undefined
              ? authUser.bestStreak
              : prev.user.bestStreak,
          totalSuccessCount:
            authUser.totalSuccessCount !== undefined
              ? authUser.totalSuccessCount
              : prev.user.totalSuccessCount,
          lastSuccessDate:
            authUser.lastSuccessDate || prev.user.lastSuccessDate,
          groupId:
            authUser.groupId !== undefined
              ? authUser.groupId
              : prev.user.groupId,
          isGroupLeader:
            authUser.isGroupLeader !== undefined
              ? authUser.isGroupLeader === true
              : prev.user.isGroupLeader || false,
        },
      }));
    }
  }, [authUser]);

  const [dateCheckKey, setDateCheckKey] = useState(formatDateKey(new Date()));

  useEffect(() => {
    if (currentUserId) {
      saveState(state, currentUserId);
    }
  }, [state, currentUserId]);

  useEffect(() => {
    // 새로고침할 때마다 랜덤으로 fact 선택
    const nextId = pickRandomFactId(null);
    setState((prev) => ({
      ...prev,
      fact: { id: nextId, updatedAt: Date.now() },
    }));
  }, []);

  useEffect(() => {
    let lastCheckedDate = formatDateKey(new Date());

    const checkDateChange = () => {
      const currentDate = formatDateKey(new Date());

      if (currentDate && currentDate !== lastCheckedDate) {
        lastCheckedDate = currentDate;
        setDateCheckKey(currentDate);
      }
    };

    checkDateChange();

    const intervalId = setInterval(checkDateChange, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const logVerification = useCallback((payload) => {
    let meta = { accepted: false };
    setState((prev) => {
      const result = applyVerificationResult(prev, payload);
      meta = result.meta;
      return result.state;
    });
    return meta;
  }, []);

  const updateProfile = useCallback(
    async (updates) => {
      if (!authUser?.id) {
        return;
      }

      try {
        const userRef = doc(db, "users", authUser.id);
        const updateData = {};

        if (updates.name) {
          updateData.name = updates.name;
          updateData.username = updates.name;
        }

        if (updates.photoURL !== undefined) {
          updateData.photoURL = updates.photoURL;
        }

        if (Object.keys(updateData).length > 0) {
          await updateDoc(userRef, updateData);

          if (authUser.groupId) {
            const memberRef = doc(
              db,
              "groups",
              authUser.groupId,
              "members",
              authUser.id
            );
            const memberDoc = await getDoc(memberRef);
            if (memberDoc.exists()) {
              const memberUpdate = {};
              if (updates.name) {
                memberUpdate.name = updates.name;
              }
              if (updates.photoURL !== undefined) {
                memberUpdate.photoURL = updates.photoURL;
              }
              if (Object.keys(memberUpdate).length > 0) {
                await updateDoc(memberRef, memberUpdate);
              }
            }
          }

          if (updates.name) {
            const batch = writeBatch(db);
            const verificationsRef = collection(db, "verifications");
            const userVerificationsQuery = query(
              verificationsRef,
              where("userId", "==", authUser.id)
            );
            const verificationsSnapshot = await getDocs(userVerificationsQuery);

            verificationsSnapshot.docs.forEach((verificationDoc) => {
              batch.update(verificationDoc.ref, {
                userName: updates.name,
              });
            });

            if (verificationsSnapshot.docs.length > 0) {
              await batch.commit();
            }
          }
        }

        setState((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            ...updates,
          },
        }));
      } catch (error) {
        logError("프로필 업데이트 오류:", error);
        throw error;
      }
    },
    [authUser]
  );

  {
    /* 뷰 모델 생성 */
  }
  const value = useMemo(() => {
    const viewModel = buildViewModel(state);
    return {
      ...viewModel,
      actions: {
        logVerification,
        updateProfile,
      },
      isLoading: false,
    };
  }, [state, dateCheckKey, logVerification, updateProfile]);

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);
