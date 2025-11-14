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

  {
    /* TODO: emoji, name, description 추가 */
  }
  const stageInfo = {
    bronze: {
      emoji: "lv1",
      name: "lv1",
      description: "lv1",
    },
    silver: {
      emoji: "lv2",
      name: "lv2",
      description: "lv2",
    },
    gold: {
      emoji: "lv3",
      name: "lv3",
      description: "lv3",
    },
    platinum: {
      emoji: "lv4",
      name: "lv4",
      description: "lv4",
    },
    diamond: {
      emoji: "lv5",
      name: "lv5",
      description: "lv5",
    },
    master: {
      emoji: "lv6",
      name: "lv6",
      description: "lv6",
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
