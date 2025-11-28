import { useCallback } from "react";
import html2canvas from "html2canvas";
import { logError, logWarn } from "../utils/logger";

const useShareCard = () => {
  const generateImage = useCallback(async () => {
    const cardElement = document.getElementById("share-card");
    if (!cardElement) {
      logError("Card element not found");
      throw new Error("공유 카드를 찾을 수 없습니다.");
    }

    try {
      const scale = Math.min(window.devicePixelRatio || 2, 2);

      const canvas = await html2canvas(cardElement, {
        backgroundColor: "#ffffff",
        scale: scale,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: -window.scrollY,
        onclone: (clonedDoc) => {
          const clonedCard = clonedDoc.getElementById("share-card");

          if (clonedCard) {
            clonedCard.style.margin = "0";
            clonedCard.style.transform = "none";
            clonedCard.style.boxShadow = "none";
            clonedCard.style.borderRadius = "0";

            const glows = clonedCard.querySelectorAll(".share-card-emoji-glow");
            glows.forEach((el) => (el.style.display = "none"));
          }
        },
      });

      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("이미지 생성 실패"));
              return;
            }
            resolve(blob);
          },
          "image/png",
          0.95
        );
      });
    } catch (error) {
      logError("이미지 생성 오류:", error);
      throw error;
    }
  }, []);

  const shareImage = useCallback(
    async (blob, filename = "be-echo-activity.png") => {
      const file = new File([blob], filename, { type: "image/png" });

      // 1. 모바일 공유
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            title: "BeEcho. 활동 인증",
            text: "저의 환경 보호 활동 기록입니다! 🌍 #BE_ECHO #텀블러인증",
          });
          return { success: true, method: "share" };
        } catch (error) {
          if (error.name === "AbortError") {
            return { success: false, method: "cancelled" };
          }
          logWarn("Web Share API 실패, 다운로드로 전환:", error);
        }
      }

      // 2. PC 다운로드
      try {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return { success: true, method: "download" };
      } catch (error) {
        logError("다운로드 실패:", error);
        throw error;
      }
    },
    []
  );

  const shareToTwitter = useCallback((text, url) => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank", "width=550,height=420");
  }, []);

  const handleShare = useCallback(async () => {
    try {
      const blob = await generateImage();
      return await shareImage(blob);
    } catch (error) {
      logError("공유 처리 전체 오류:", error);
      throw error;
    }
  }, [generateImage, shareImage]);

  return {
    handleShare,
    shareToTwitter,
  };
};

export default useShareCard;
