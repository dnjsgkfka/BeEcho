import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { storage, db } from "../config/firebase";

/**
 * DataURL을 Blob으로 변환
 */
const dataURLtoBlob = (dataURL) => {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * 이미지를 Firebase Storage에 업로드하고 URL 반환
 * @param {string} imageDataUrl - Base64 이미지 데이터 URL
 * @param {string} userId - 사용자 ID
 * @returns {Promise<string>} 이미지 다운로드 URL
 */
export const uploadVerificationImage = async (imageDataUrl, userId) => {
  try {
    const timestamp = Date.now();
    const fileName = `verifications/${userId}/${timestamp}.jpg`;
    const storageRef = ref(storage, fileName);

    const blob = dataURLtoBlob(imageDataUrl);
    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("이미지 업로드 오류:", error);
    throw error;
  }
};

/**
 * 오늘 인증했는지 확인
 * @param {string} userId - 사용자 ID
 * @returns {Promise<boolean>} 오늘 인증 여부
 */
export const checkTodayVerification = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const verificationsRef = collection(db, "verifications");
    const q = query(
      verificationsRef,
      where("userId", "==", userId),
      where("verifiedAt", ">=", Timestamp.fromDate(today)),
      where("verifiedAt", "<", Timestamp.fromDate(tomorrow)),
      where("success", "==", true)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("오늘 인증 확인 오류:", error);
    return false;
  }
};

/**
 * 스트릭 계산
 * @param {number} currentStreak - 현재 스트릭
 * @param {string} lastSuccessDate - 마지막 성공 날짜 (ISO string)
 * @returns {number} 업데이트된 스트릭
 */
const calculateStreak = (currentStreak, lastSuccessDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  if (!lastSuccessDate) {
    return 1;
  }

  const lastDate = new Date(lastSuccessDate);
  lastDate.setHours(0, 0, 0, 0);
  const lastDateStr = lastDate.toISOString().split("T")[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (lastDateStr === yesterdayStr) {
    return currentStreak + 1;
  } else if (lastDateStr === todayStr) {
    return currentStreak;
  } else {
    return 1;
  }
};

/**
 * 인증 기록을 Firestore에 저장하고 사용자 통계 업데이트
 * @param {object} params - 인증 정보
 * @param {string} params.userId - 사용자 ID
 * @param {string} params.userName - 사용자 이름
 * @param {string} params.groupId - 그룹 ID (선택)
 * @param {string} params.imageUrl - 이미지 URL
 * @param {boolean} params.success - 인증 성공 여부
 * @param {number} params.confidence - 신뢰도 (선택)
 * @returns {Promise<object>} 저장된 인증 기록
 */
export const saveVerification = async ({
  userId,
  userName,
  groupId,
  imageUrl,
  success,
  confidence,
}) => {
  try {
    const now = new Date();
    const verificationRef = doc(collection(db, "verifications"));
    const verificationData = {
      userId,
      userName: userName || "사용자",
      groupId: groupId || null,
      imageUrl,
      success: Boolean(success),
      confidence: confidence || null,
      verifiedAt: serverTimestamp(),
      date: now.toISOString().split("T")[0],
      createdAt: serverTimestamp(),
    };

    await setDoc(verificationRef, verificationData);

    if (success) {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : {};

      const currentStreak = userData.streakDays || 0;
      const newStreak = calculateStreak(
        currentStreak,
        userData.lastSuccessDate
      );
      const newBestStreak = Math.max(newStreak, userData.bestStreak || 0);
      const newTotalSuccessCount = (userData.totalSuccessCount || 0) + 1;
      const newLP = (userData.lp || 0) + 10;

      await updateDoc(userRef, {
        lp: newLP,
        streakDays: newStreak,
        bestStreak: newBestStreak,
        totalSuccessCount: newTotalSuccessCount,
        lastSuccessDate: now.toISOString(),
      });

      if (groupId) {
        const memberRef = doc(db, "groups", groupId, "members", userId);
        const memberDoc = await getDoc(memberRef);

        if (memberDoc.exists()) {
          await updateDoc(memberRef, {
            lp: newLP,
            streakDays: newStreak,
          });
        }

        await checkAndGiveGroupBonus(groupId, now);
      }
    }

    return {
      id: verificationRef.id,
      ...verificationData,
    };
  } catch (error) {
    console.error("인증 기록 저장 오류:", error);
    throw error;
  }
};

/**
 * 모든 멤버가 인증했는지 확인하고 보너스 LP 지급
 * @param {string} groupId - 그룹 ID
 * @param {Date} today - 오늘 날짜
 * @returns {Promise<void>}
 */
const checkAndGiveGroupBonus = async (groupId, today) => {
  try {
    const todayStr = today.toISOString().split("T")[0];
    const todayTimestamp = Timestamp.fromDate(today);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimestamp = Timestamp.fromDate(tomorrow);

    const membersRef = collection(db, "groups", groupId, "members");
    const membersSnapshot = await getDocs(membersRef);
    const allMemberIds = membersSnapshot.docs.map((doc) => doc.id);

    if (allMemberIds.length === 0) return;

    const verificationsRef = collection(db, "verifications");
    const verifiedQuery = query(
      verificationsRef,
      where("groupId", "==", groupId),
      where("success", "==", true),
      where("date", "==", todayStr)
    );

    const verifiedSnapshot = await getDocs(verifiedQuery);
    const verifiedMemberIds = new Set(
      verifiedSnapshot.docs.map((doc) => doc.data().userId)
    );

    const allVerified = allMemberIds.every((memberId) =>
      verifiedMemberIds.has(memberId)
    );

    if (allVerified) {
      const groupRef = doc(db, "groups", groupId);
      const groupDoc = await getDoc(groupRef);

      if (groupDoc.exists()) {
        const groupData = groupDoc.data();
        const lastBonusDate = groupData.lastBonusDate;

        if (lastBonusDate !== todayStr) {
          const batch = writeBatch(db);

          const userUpdates = [];
          membersSnapshot.docs.forEach((memberDoc) => {
            const memberId = memberDoc.id;
            const memberData = memberDoc.data();
            const newMemberLP = (memberData.lp || 0) + 30;

            const memberRef = doc(db, "groups", groupId, "members", memberId);
            batch.update(memberRef, { lp: newMemberLP });

            const userRef = doc(db, "users", memberId);
            userUpdates.push(
              getDoc(userRef).then((userDoc) => {
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  const newUserLP = (userData.lp || 0) + 30;
                  batch.update(userRef, { lp: newUserLP });
                }
              })
            );
          });

          await Promise.all(userUpdates);

          batch.update(groupRef, { lastBonusDate: todayStr });

          await batch.commit();
        }
      }
    }
  } catch (error) {
    console.error("그룹 보너스 확인 오류:", error);
  }
};

