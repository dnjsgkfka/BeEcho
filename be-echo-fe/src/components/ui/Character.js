import React, { useMemo } from "react";
import "../../styles/character.css";
import {
  deriveGradeCode,
  getGradeProgress,
  getNextGradeLP,
} from "../../utils/grade";

const Character = ({ lp = 0, streakDays = 0 }) => {
  // LP에 따른 단계
  const characterStage = useMemo(() => deriveGradeCode(lp), [lp]);

  // 성장 진행도 계산
  const growthProgress = useMemo(() => getGradeProgress(lp), [lp]);

  // 다음 단계까지 필요한 LP
  const nextStageLP = useMemo(() => getNextGradeLP(lp), [lp]);

  const stageInfo = {
    bronze: {
      emoji: "🌱",
      name: "브론즈 등급",
      description: "환경 보호의 첫 걸음을 시작했어요!",
      color: "#cd7f32",
    },
    silver: {
      emoji: "🌿",
      name: "실버 등급",
      description: "꾸준한 노력으로 환경을 지키고 있어요!",
      color: "#c0c0c0",
    },
    gold: {
      emoji: "🌳",
      name: "골드 등급",
      description: "환경 보호의 중추 역할을 하고 있어요!",
      color: "#ffd700",
    },
    platinum: {
      emoji: "🌺",
      name: "플래티넘 등급",
      description: "환경 보호의 전문가가 되었어요!",
      color: "#e5e4e2",
    },
    diamond: {
      emoji: "🌍",
      name: "다이아몬드 등급",
      description: "지구를 지키는 리더가 되었어요!",
      color: "#b9f2ff",
    },
    master: {
      emoji: "👑",
      name: "에코 마스터",
      description: "환경 보호의 최고 달인! 당신은 진정한 에코 히어로예요!",
      color: "#05c46b",
    },
  };

  const currentInfo = stageInfo[characterStage];

  return (
    <div className="character-container">
      {streakDays > 0 && (
        <div className="character-streak-badge">{streakDays}일 연속</div>
      )}
      <div className="character-display">
        <div className={`character-emoji stage-${characterStage}`}>
          {currentInfo.emoji}
        </div>
      </div>
      <div className="character-info">
        <h3 className="character-name">{currentInfo.name}</h3>
        <p className="character-description">{currentInfo.description}</p>
        {nextStageLP && (
          <div className="character-progress">
            <div className="character-progress-label">
              다음 단계까지 {nextStageLP - lp} LP
            </div>
            <div className="character-progress-bar">
              <div
                className="character-progress-fill"
                style={{
                  width: `${growthProgress}%`,
                  backgroundColor: currentInfo.color,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Character;
