import React, { useCallback, useMemo, useRef, useState } from "react";
import "../styles/home.css";
import { CameraIcon, InfoIcon } from "../components/icons";
import { HighlightCard, StatPill, Character } from "../components/ui";
import { useAppData } from "../contexts/AppDataContext";
import useTumblerVerification from "../hooks/useTumblerVerification";
import { deriveGradeCode, getGradeGuide } from "../utils/grade";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const CERT_GUIDE = [
  {
    title: "텀블러가 잘 보이고 있나요?",
    detail: "텀블러가 잘 보이도록 촬영해주세요.",
    accent: "primary",
    icon: "📸",
  },
  {
    title: "밝은 곳에서 촬영해주세요.",
    detail: "주변이 너무 어둡거나 밝으면 인식률이 떨어질 수 있어요.",
    accent: "sunny",
    icon: "☀️",
  },
  {
    title: "일회용 컵은 치워주세요!",
    detail: "텀블러 주변에 일회용 컵이 있으면 텀블러 인식이 어려울 수 있어요.",
    accent: "clean",
    icon: "🗑️",
  },
  {
    title: "연속 촬영은 불가능해요.",
    detail: "텀블러 인증은 하루 한 번만 가능해요.",
    accent: "warning",
    icon: "⏰",
  },
];

const HomePage = () => {
  const { home, user, actions } = useAppData();
  const fileInputRef = useRef(null);
  const [pendingImage, setPendingImage] = useState(null);
  const [overrideMessage, setOverrideMessage] = useState(null);
  const [isGradeInfoOpen, setGradeInfoOpen] = useState(false);
  const [isCertInfoOpen, setCertInfoOpen] = useState(false);

  const handleVerificationSuccess = useCallback(
    (result) => {
      const meta = actions.logVerification({
        ...result,
        imageDataUrl: pendingImage,
      });

      if (meta?.alreadyCompleted) {
        setOverrideMessage(
          "오늘 인증은 이미 완료되었어요. 내일 다시 시도해주세요."
        );
      } else {
        setOverrideMessage(null);
      }

      setPendingImage(null);
    },
    [actions, pendingImage]
  );

  const handleVerificationError = useCallback(
    (error) => {
      if (pendingImage) {
        actions.logVerification({
          success: false,
          message: error?.message ?? "인증에 실패했어요.",
          imageDataUrl: pendingImage,
        });
      }
      setPendingImage(null);
    },
    [actions, pendingImage]
  );

  const { status, message, verifyImage, reset } = useTumblerVerification({
    onSuccess: handleVerificationSuccess,
    onError: handleVerificationError,
  });

  const certificationMessage = useMemo(() => {
    if (overrideMessage) return overrideMessage;
    if (message) return message;
    return home.certificationMessage;
  }, [overrideMessage, message, home.certificationMessage]);

  const handleUploadRequest = () => {
    if (!home.canVerify) {
      setOverrideMessage(
        "오늘 인증은 이미 완료되었어요. 내일 다시 도전해주세요."
      );
      return;
    }

    setOverrideMessage(null);
    reset();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const [file] = event.target.files || [];
    if (file) {
      try {
        const dataUrl = await readFileAsDataUrl(file);
        setPendingImage(dataUrl);
      } catch (readError) {
        console.warn("이미지를 불러오는 중 문제가 발생했어요.", readError);
        setPendingImage(null);
      }

      verifyImage(file).catch(() => {});
    }
    event.target.value = "";
  };

  return (
    <section className="screen-section home">
      {/* 인증 헤더 */}
      <div className="page-heading">
        <p className="date">{home.dateLabel}</p>
        <h2>
          {user.name}님, {user.streakDays}일째 인증 중!{" "}
        </h2>
      </div>

      {/* 레벨 카드 */}
      <article className="status-card">
        <button
          type="button"
          className="info-button"
          onClick={() => setGradeInfoOpen(true)}
        >
          <InfoIcon />
        </button>
        <Character lp={user.lp} streakDays={user.streakDays} />
      </article>

      {/* 인증 카드 */}
      <article className="certification-card">
        <div>
          <div className="card-title-row">
            <p className="card-title">오늘의 인증</p>
            <button
              type="button"
              className="info-button"
              onClick={() => setCertInfoOpen(true)}
            >
              <InfoIcon />
            </button>
          </div>
          <p className="card-subtitle">{certificationMessage}</p>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={handleUploadRequest}
          disabled={status === "loading" || (!home.canVerify && !pendingImage)}
        >
          <CameraIcon />
          {status === "loading" ? "인증 중..." : "텀블러 인증하기"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </article>
      <div className="stat-grid">
        {home.stats.map((stat) => (
          <StatPill
            key={stat.id}
            label={stat.label}
            value={stat.value}
            accent={stat.accent}
          />
        ))}
      </div>

      {/* 등급 안내 / 인증 주의사항 */}
      {(isGradeInfoOpen || isCertInfoOpen) && (
        <div className="home-modal" role="dialog" aria-modal="true">
          <div className="home-modal-content">
            <header>
              <div>
                <h3>{isGradeInfoOpen ? "등급 안내" : "인증 주의사항"}</h3>
                <p>
                  {isGradeInfoOpen
                    ? "다음 등급까지 남은 LP를 확인해보세요."
                    : "텀블러 인식이 어렵다면, 주의사항에 따라 다시 시도해보세요!"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setGradeInfoOpen(false);
                  setCertInfoOpen(false);
                }}
              >
                닫기
              </button>
            </header>
            <div className="home-modal-body">
              {/* 등급 안내 */}
              {isGradeInfoOpen && (
                <div className="home-guide-grid">
                  {getGradeGuide().map((item) => (
                    <article
                      key={item.label}
                      className={`home-guide-card grade-card accent-${
                        item.accent
                      } ${
                        deriveGradeCode(user.lp) === item.accent ? "active" : ""
                      }`}
                    >
                      <div className="home-guide-text">
                        <h4>{item.label}</h4>
                        <span>{item.range}</span>
                        <p>{item.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* 인증 주의사항 */}
              {isCertInfoOpen && (
                <div className="home-guide-grid">
                  {CERT_GUIDE.map((item) => (
                    <article
                      key={item.title}
                      className={`home-guide-card cert-card accent-${item.accent}`}
                    >
                      <div className="home-guide-icon">{item.icon}</div>
                      <div className="home-guide-text">
                        <h4>{item.title}</h4>
                        <p>{item.detail}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HomePage;
