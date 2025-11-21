import React from "react";
import ShareCard from "./ShareCard";
import useShareCard from "../../hooks/useShareCard";
import "../../styles/share-modal.css";

const ShareModal = ({ isOpen, onClose, user, insights, achievements }) => {
  const { handleShare, shareToTwitter } = useShareCard();
  const [isSharing, setIsSharing] = React.useState(false);

  const handleShareClick = async () => {
    setIsSharing(true);
    try {
      await handleShare();
    } catch (error) {
      alert("공유 중 오류가 발생했습니다. 다시 시도해주세요.");
      console.error(error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleTwitterShare = () => {
    const text = `BeEcho.에서 ${user.lp} LP, ${user.streakDays}일 연속 인증 중! 텀블러 사용으로 환경 보호에 함께해요!`;
    const url = window.location.origin;
    shareToTwitter(text, url);
  };

  if (!isOpen) return null;

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h3>내 활동 공유하기</h3>
          <button className="share-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="share-modal-body">
          <ShareCard
            user={user}
            insights={insights}
            achievements={achievements}
          />
        </div>

        <div className="share-modal-actions">
          <button
            className="share-modal-button share-button-primary"
            onClick={handleShareClick}
            disabled={isSharing}
          >
            {isSharing ? "처리 중..." : "이미지 공유하기"}
          </button>
          <button
            className="share-modal-button share-button-twitter"
            onClick={handleTwitterShare}
          >
            트위터(X) 공유
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
