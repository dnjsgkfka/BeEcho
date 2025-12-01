import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../styles/insights.css";
import { StatPill, Calendar } from "../components/ui";
import { useAppData } from "../contexts/AppDataContext";
import { useAuth } from "../contexts/AuthContext";
import { getVerifiedDates } from "../services/verifications";
import { logError } from "../utils/logger";

const InsightsPage = () => {
  const { insights } = useAppData();
  const { user: authUser } = useAuth();
  const [verifiedDates, setVerifiedDates] = useState([]);
  const [isLoadingDates, setIsLoadingDates] = useState(true);
  const [datesError, setDatesError] = useState(null);

  const loadVerifiedDates = useCallback(async () => {
    if (!authUser?.id) {
      setIsLoadingDates(false);
      return;
    }

    try {
      setIsLoadingDates(true);
      setDatesError(null);
      const dates = await getVerifiedDates(authUser.id);
      setVerifiedDates(dates);
    } catch (error) {
      logError("인증 날짜 로드 오류:", error);
      setDatesError("인증 날짜를 불러오는데 실패했습니다.");
    } finally {
      setIsLoadingDates(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    loadVerifiedDates();
  }, [loadVerifiedDates]);

  useEffect(() => {
    const handleVerificationSaved = () => {
      loadVerifiedDates();
    };

    window.addEventListener("verificationSaved", handleVerificationSaved);
    return () => {
      window.removeEventListener("verificationSaved", handleVerificationSaved);
    };
  }, [loadVerifiedDates]);

  const { currentWeek, previousWeek, diffLabel, maxTrendCount } =
    useMemo(() => {
      const trend = insights.weeklyTrend;
      const latest = trend[trend.length - 1] || { label: "이번 주", count: 0 };
      const prev = trend[trend.length - 2] || { label: "지난 주", count: 0 };
      const diff = latest.count - (prev.count || 0);
      const diffLabel =
        diff === 0
          ? "지난 주와 동일"
          : diff > 0
          ? `+${diff}회 증가`
          : `${diff}회 감소`;
      const max = Math.max(...trend.map((item) => item.count || 0), 1);
      return {
        currentWeek: latest,
        previousWeek: prev,
        diffLabel,
        maxTrendCount: max,
      };
    }, [insights.weeklyTrend]);

  return (
    <div className="insights-page">
      <div className="insights-content">
        <div className="insights-summary">
          <StatPill
            label="총 인증 성공"
            value={`${insights.summary.totalSuccess}회`}
            accent="streak"
          />
          <StatPill
            label="인증 실패"
            value={`${insights.summary.totalFail}회`}
            accent="danger"
          />
          <StatPill
            label="최고 스트릭"
            value={`${insights.summary.bestStreak}일`}
            accent="highlight"
          />
          <StatPill
            label="누적 LP"
            value={`${insights.summary.lp}점`}
            accent="rank"
          />
        </div>

        <section className="insights-section">
          <h3>캘린더</h3>
          {isLoadingDates ? (
            <div className="insights-loading">
              <div className="loading-spinner-small"></div>
              <p>로딩 중...</p>
            </div>
          ) : datesError ? (
            <div className="insights-error">
              <p>{datesError}</p>
              <button
                type="button"
                className="retry-button"
                onClick={loadVerifiedDates}
              >
                다시 시도
              </button>
            </div>
          ) : (
            <Calendar verifiedDates={verifiedDates} />
          )}
        </section>

        <section className="insights-section insight-delta">
          <div className="delta-card">
            <h3>{currentWeek.label}</h3>
            <p>{currentWeek.count}회 인증</p>
          </div>
          <div className="delta-details">
            <span>{previousWeek.label} 대비</span>
            <strong>{diffLabel}</strong>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InsightsPage;
