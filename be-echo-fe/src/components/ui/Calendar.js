import React, { useMemo } from "react";
import "../../styles/calendar.css";

const Calendar = ({ verifiedDates = [] }) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // 이번 달의 첫 날과 마지막 날 계산
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // 인증한 날짜를 YYYY-MM-DD 형식으로 변환
  const verifiedDateSet = useMemo(() => {
    return new Set(
      verifiedDates.map((date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(d.getDate()).padStart(2, "0")}`;
      })
    );
  }, [verifiedDates]);

  // 날짜가 인증된 날인지 확인
  const isVerified = (day) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    return verifiedDateSet.has(dateKey);
  };

  // 오늘인지 확인
  const isToday = (day) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const emptyDays = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  // 날짜 배열 생성
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthNames = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h3>
          {currentYear}년 {monthNames[currentMonth]}
        </h3>
      </div>
      <div className="calendar-grid">
        {/* 요일 헤더 */}
        {weekDays.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
        {/* 빈 칸 */}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="calendar-day empty" />
        ))}
        {/* 날짜 */}
        {days.map((day) => {
          const verified = isVerified(day);
          const todayClass = isToday(day) ? "today" : "";
          return (
            <div
              key={day}
              className={`calendar-day ${
                verified ? "verified" : ""
              } ${todayClass}`}
            >
              <span className="calendar-day-number">{day}</span>
              {verified && <span className="calendar-day-badge" aria-label="인증 완료" />}
            </div>
          );
        })}
      </div>
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-dot verified" />
          <span>인증 완료</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot today" />
          <span>오늘</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
