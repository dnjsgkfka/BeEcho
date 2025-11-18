import React, { useMemo } from "react";
import "../styles/insights.css";
import { StatPill, Calendar } from "../components/ui";
import { useAppData } from "../contexts/AppDataContext";

const InsightsPage = () => {
  const { insights, history } = useAppData();

  // 인증 성공한 날짜 (이번 달)
  const verifiedDates = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    return history
      .filter((entry) => entry.success)
      .map((entry) => new Date(entry.timestamp))
      .filter((date) => {
        return (
          date.getFullYear() === currentYear && date.getMonth() === currentMonth
        );
      });
  }, [history]);

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
    <section className="screen-section insights">
      <div className="page-heading">
        <h2>인사이트</h2>
        <p className="page-subtitle">이번 달의 인증 내역을 확인해보세요!</p>
      </div>

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
        <h3>이번 달 캘린더</h3>
        <Calendar verifiedDates={verifiedDates} />
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
    </section>
  );
};

export default InsightsPage;
