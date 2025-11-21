import React, { useCallback, useMemo, useRef, useState } from "react";
import "../styles/verification.css";
import { CameraIcon, InfoIcon } from "../components/icons";
import { useAppData } from "../contexts/AppDataContext";
import useTumblerVerification from "../hooks/useTumblerVerification";

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

const VerificationPage = () => {
  const { home, actions, history } = useAppData();
  const fileInputRef = useRef(null);
  const pendingImageRef = useRef(null);
  const [pendingImage, setPendingImage] = useState(null);
  const [overrideMessage, setOverrideMessage] = useState(null);
  const [isCertInfoOpen, setCertInfoOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [successImageDataUrl, setSuccessImageDataUrl] = useState(null);

  // 최근 성공 인증 내역 (최대 6개)
  const recentSuccessHistory = useMemo(() => {
    return history
      .filter((entry) => entry.success && entry.imageDataUrl)
      .slice(0, 6);
  }, [history]);

  const timeUntilNextVerification = useMemo(() => {
    if (home.canVerify) return null;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes };
  }, [home.canVerify]);

  const handleVerificationSuccess = useCallback(
    (result) => {
      const imageToSave = pendingImageRef.current;

      const meta = actions.logVerification({
        ...result,
        imageDataUrl: imageToSave,
      });

      if (meta?.alreadyCompleted) {
        setOverrideMessage(
          "오늘 인증은 이미 완료되었어요. 내일 다시 시도해주세요."
        );
        setPendingImage(null);
        pendingImageRef.current = null;
      } else if (result?.success) {
        setOverrideMessage(null);
        if (imageToSave) {
          setSuccessImageDataUrl(imageToSave);
          setIsShareModalOpen(true);
        } else {
          setPendingImage(null);
          pendingImageRef.current = null;
        }
      } else {
        setOverrideMessage(null);
        setPendingImage(null);
        pendingImageRef.current = null;
      }
    },
    [actions]
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
        pendingImageRef.current = dataUrl;
      } catch (readError) {
        console.warn("이미지를 불러오는 중 문제가 발생했어요.", readError);
        setPendingImage(null);
        pendingImageRef.current = null;
      }

      verifyImage(file).catch(() => {});
    }
    event.target.value = "";
  };

  return (
    <section className="screen-section verification">
      <div className="page-heading">
        <h2>텀블러 인증</h2>
        <p className="date">{home.dateLabel}</p>
      </div>

      {/* 인증 섹션 */}
      <div className="verification-main-section">
        {/* 오늘의 인증 */}
        <div className="verification-action-section">
          <div className="verification-action-header">
            <div>
              <div className="verification-action-title-row">
                <h3>오늘의 인증</h3>
                <div
                  className={`verification-status-badge ${
                    home.canVerify ? "available" : "completed"
                  }`}
                >
                  {home.canVerify ? "인증 가능" : "완료됨"}
                </div>
                <button
                  type="button"
                  className="info-button"
                  onClick={() => setCertInfoOpen(true)}
                >
                  <InfoIcon />
                </button>
              </div>
              <p className="verification-status-message">
                {certificationMessage}
              </p>
              {timeUntilNextVerification && (
                <p className="verification-next-time">
                  다음 인증까지 약 {timeUntilNextVerification.hours}시간{" "}
                  {timeUntilNextVerification.minutes}분 남았어요
                </p>
              )}
            </div>
          </div>
          <button
            className="verification-action-button"
            type="button"
            onClick={handleUploadRequest}
            disabled={
              status === "loading" || (!home.canVerify && !pendingImage)
            }
          >
            <CameraIcon />
            {status === "loading" ? "인증 중..." : "텀블러 인증하기"}
          </button>
          {pendingImage && (
            <div className="verification-preview">
              <img
                src={pendingImage}
                alt="인증 대기 중인 이미지"
                className="verification-preview-image"
              />
              {status === "loading" && (
                <div className="verification-preview-overlay">
                  <div className="verification-loading-spinner"></div>
                  <p>인증 처리 중...</p>
                </div>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* 최근 인증 내역 */}
      <section className="recent-verifications-section">
        <div className="recent-verifications-header">
          <h3>최근 인증 내역</h3>
          <p>지금까지 성공한 인증 사진들을 확인해보세요</p>
        </div>
        {recentSuccessHistory.length > 0 ? (
          <div className="recent-verifications-grid">
            {recentSuccessHistory.map((entry) => (
              <div key={entry.id} className="recent-verification-item">
                <img
                  src={entry.imageDataUrl}
                  alt={`인증 ${new Date(entry.timestamp).toLocaleDateString(
                    "ko-KR"
                  )}`}
                  className="recent-verification-image"
                />
                <div className="recent-verification-info">
                  <p className="recent-verification-date">
                    {new Date(entry.timestamp).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  {entry.confidence && (
                    <p className="recent-verification-confidence">
                      {Math.round(entry.confidence * 100)}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="recent-verifications-empty">
            <p>아직 인증 내역이 없어요. 첫 인증을 시작해보세요!</p>
          </div>
        )}
      </section>

      {/* 인증 완료 팝업 */}
      {isShareModalOpen && successImageDataUrl && (
        <div
          className="verification-success-modal"
          role="dialog"
          aria-modal="true"
        >
          <div className="verification-success-modal-content">
            <div className="verification-success-modal-header">
              <h3>인증 성공! 🎉</h3>
              <button
                type="button"
                className="verification-success-modal-close"
                onClick={() => {
                  setIsShareModalOpen(false);
                  setSuccessImageDataUrl(null);
                  setPendingImage(null);
                  pendingImageRef.current = null;
                }}
              >
                ✕
              </button>
            </div>
            <div className="verification-success-modal-body">
              <div className="verification-success-image-wrapper">
                <img
                  src={successImageDataUrl}
                  alt="인증 완료 사진"
                  className="verification-success-image"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 인증 주의사항 모달 */}
      {isCertInfoOpen && (
        <div className="verification-modal" role="dialog" aria-modal="true">
          <div className="verification-modal-content">
            <header>
              <div>
                <h3>인증 주의사항</h3>
                <p>
                  텀블러 인식이 어렵다면, 주의사항에 따라 다시 시도해보세요!
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCertInfoOpen(false);
                }}
              >
                닫기
              </button>
            </header>
            <div className="verification-modal-body">
              <div className="verification-guide-grid">
                {CERT_GUIDE.map((item) => (
                  <article
                    key={item.title}
                    className={`verification-guide-card accent-${item.accent}`}
                  >
                    <div className="verification-guide-icon">{item.icon}</div>
                    <div className="verification-guide-text">
                      <h4>{item.title}</h4>
                      <p>{item.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VerificationPage;
