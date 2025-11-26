import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * 6자리 그룹 코드 (영문 대문자 + 숫자)
 */
const generateGroupCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * 그룹 코드 중복 체크
 */
const checkGroupCodeExists = async (code) => {
  try {
    const groupsRef = collection(db, "groups");
    const q = query(groupsRef, where("code", "==", code));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("그룹 코드 중복 체크 오류:", error);
    return true;
  }
};

/**
 * 고유한 그룹 코드 생성
 */
const generateUniqueGroupCode = async () => {
  let code = generateGroupCode();
  let attempts = 0;
  const maxAttempts = 10;

  while (await checkGroupCodeExists(code)) {
    code = generateGroupCode();
    attempts++;
    if (attempts >= maxAttempts) {
      throw new Error(
        "고유한 그룹 코드를 생성할 수 없습니다. 다시 시도해주세요."
      );
    }
  }

  return code;
};

/**
 * 그룹 생성
 * @param {string} groupName - 그룹 이름
 * @param {string} leaderId - 그룹장 사용자 ID
 * @param {string} leaderName - 그룹장 이름
 * @param {string} leaderPhotoURL - 그룹장 프로필 사진 URL
 * @returns {Promise<{groupId: string, code: string}>} 생성된 그룹 정보
 */
export const createGroup = async (
  groupName,
  leaderId,
  leaderName,
  leaderPhotoURL
) => {
  try {
    // 고유 그룹 코드 생성
    const code = await generateUniqueGroupCode();

    // 그룹 문서 생성
    const groupRef = doc(collection(db, "groups"));
    const groupId = groupRef.id;

    const groupData = {
      id: groupId,
      name: groupName.trim(),
      code: code,
      leaderId: leaderId,
      memberCount: 1,
      totalLp: 0,
      createdAt: serverTimestamp(),
    };

    await setDoc(groupRef, groupData);

    // 그룹 멤버 추가
    const memberRef = doc(db, "groups", groupId, "members", leaderId);
    await setDoc(memberRef, {
      userId: leaderId,
      name: leaderName,
      photoURL: leaderPhotoURL || null,
      lp: 0,
      streakDays: 0,
      joinedAt: serverTimestamp(),
    });

    // 사용자 groupId 업데이트
    const userRef = doc(db, "users", leaderId);
    await updateDoc(userRef, {
      groupId: groupId,
      isGroupLeader: true,
    });

    return {
      groupId: groupId,
      code: code,
    };
  } catch (error) {
    console.error("그룹 생성 오류:", error);
    throw error;
  }
};

/**
 * 그룹 코드로 그룹 검색
 * @param {string} code - 그룹 코드
 * @returns {Promise<{id: string, name: string, leaderId: string, memberCount: number} | null>} 그룹 정보
 */
export const findGroupByCode = async (code) => {
  try {
    const groupsRef = collection(db, "groups");
    const q = query(groupsRef, where("code", "==", code.toUpperCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const groupDoc = querySnapshot.docs[0];
    return {
      id: groupDoc.id,
      ...groupDoc.data(),
    };
  } catch (error) {
    console.error("그룹 검색 오류:", error);
    throw error;
  }
};

/**
 * 그룹 참여
 * @param {string} code - 그룹 코드
 * @param {string} userId - 사용자 ID
 * @param {string} userName - 사용자 이름
 * @param {string} userPhotoURL - 사용자 프로필 사진 URL
 * @returns {Promise<{groupId: string, groupName: string}>} 참여한 그룹 정보
 */
export const joinGroup = async (code, userId, userName, userPhotoURL) => {
  try {
    const group = await findGroupByCode(code);

    if (!group) {
      throw new Error("존재하지 않는 그룹 코드입니다.");
    }

    const groupId = group.id;

    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    const userData = userDoc.data();

    if (userData.groupId === groupId) {
      throw new Error("이미 이 그룹에 속해있습니다.");
    }

    if (userData.groupId) {
      throw new Error(
        "이미 다른 그룹에 속해있습니다. 기존 그룹에서 나간 후 참여해주세요."
      );
    }

    const memberRef = doc(db, "groups", groupId, "members", userId);
    const memberDoc = await getDoc(memberRef);

    if (memberDoc.exists()) {
      throw new Error("이미 이 그룹의 멤버입니다.");
    }

    await setDoc(memberRef, {
      userId: userId,
      name: userName,
      photoURL: userPhotoURL || null,
      lp: userData.lp || 0,
      streakDays: userData.streakDays || 0,
      joinedAt: serverTimestamp(),
    });

    await updateDoc(userRef, {
      groupId: groupId,
      isGroupLeader: false,
    });

    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, {
      memberCount: (group.memberCount || 1) + 1,
    });

    return {
      groupId: groupId,
      groupName: group.name,
    };
  } catch (error) {
    console.error("그룹 참여 오류:", error);
    throw error;
  }
};

/**
 * 그룹 정보 조회
 * @param {string} groupId - 그룹 ID
 * @returns {Promise<object | null>} 그룹 정보
 */
export const getGroup = async (groupId) => {
  try {
    const groupRef = doc(db, "groups", groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      return null;
    }

    return {
      id: groupDoc.id,
      ...groupDoc.data(),
    };
  } catch (error) {
    console.error("그룹 정보 가져오기 오류:", error);
    throw error;
  }
};

/**
 * 그룹 멤버 목록 조회
 * @param {string} groupId - 그룹 ID
 * @returns {Promise<Array>} 멤버 목록
 */
export const getGroupMembers = async (groupId) => {
  try {
    const membersRef = collection(db, "groups", groupId, "members");
    const membersSnapshot = await getDocs(membersRef);

    return membersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("그룹 멤버 목록 가져오기 오류:", error);
    throw error;
  }
};

/**
 * 그룹 삭제
 * @param {string} groupId - 그룹 ID
 * @param {string} leaderId - 그룹장 ID
 * @returns {Promise<void>}
 */
export const deleteGroup = async (groupId, leaderId) => {
  try {
    const groupRef = doc(db, "groups", groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      throw new Error("그룹을 찾을 수 없습니다.");
    }

    const groupData = groupDoc.data();
    if (groupData.leaderId !== leaderId) {
      throw new Error("그룹장만 그룹을 삭제할 수 있습니다.");
    }

    const batch = writeBatch(db);

    const membersRef = collection(db, "groups", groupId, "members");
    const membersSnapshot = await getDocs(membersRef);

    membersSnapshot.docs.forEach((memberDoc) => {
      const memberId = memberDoc.id;
      const userRef = doc(db, "users", memberId);
      batch.update(userRef, { groupId: null });
      batch.delete(memberDoc.ref);
    });

    const verificationsRef = collection(db, "verifications");
    const groupVerificationsQuery = query(
      verificationsRef,
      where("groupId", "==", groupId)
    );
    const verificationsSnapshot = await getDocs(groupVerificationsQuery);
    verificationsSnapshot.docs.forEach((verificationDoc) => {
      batch.update(verificationDoc.ref, { groupId: null });
    });

    batch.delete(groupRef);
    await batch.commit();
  } catch (error) {
    console.error("그룹 삭제 오류:", error);
    throw error;
  }
};

/**
 * 그룹 이름 변경
 * @param {string} groupId - 그룹 ID
 * @param {string} leaderId - 그룹장 ID
 * @param {string} newName - 새로운 그룹 이름
 * @returns {Promise<void>}
 */
export const updateGroupName = async (groupId, leaderId, newName) => {
  try {
    if (!newName || !newName.trim()) {
      throw new Error("그룹 이름을 입력해주세요.");
    }

    const groupRef = doc(db, "groups", groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      throw new Error("그룹을 찾을 수 없습니다.");
    }

    const groupData = groupDoc.data();
    if (groupData.leaderId !== leaderId) {
      throw new Error("그룹장만 그룹 이름을 변경할 수 있습니다.");
    }

    await updateDoc(groupRef, {
      name: newName.trim(),
    });
  } catch (error) {
    console.error("그룹 이름 변경 오류:", error);
    throw error;
  }
};

/**
 * 그룹 공지사항 업데이트
 * @param {string} groupId - 그룹 ID
 * @param {string} leaderId - 그룹장 ID
 * @param {string} announcement - 공지사항 내용
 * @returns {Promise<void>}
 */
export const updateGroupAnnouncement = async (
  groupId,
  leaderId,
  announcement
) => {
  try {
    const groupRef = doc(db, "groups", groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      throw new Error("그룹을 찾을 수 없습니다.");
    }

    const groupData = groupDoc.data();
    if (groupData.leaderId !== leaderId) {
      throw new Error("그룹장만 공지사항을 작성할 수 있습니다.");
    }

    await updateDoc(groupRef, {
      announcement: announcement?.trim() || null,
      announcementUpdatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("그룹 공지사항 업데이트 오류:", error);
    throw error;
  }
};

/**
 * 멤버 방출
 * @param {string} groupId - 그룹 ID
 * @param {string} leaderId - 그룹장 ID
 * @param {string} memberId - 방출할 멤버 ID
 * @returns {Promise<void>}
 */
export const removeMember = async (groupId, leaderId, memberId) => {
  try {
    const groupRef = doc(db, "groups", groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      throw new Error("그룹을 찾을 수 없습니다.");
    }

    const groupData = groupDoc.data();
    if (groupData.leaderId !== leaderId) {
      throw new Error("그룹장만 멤버를 방출할 수 있습니다.");
    }

    if (groupData.leaderId === memberId) {
      throw new Error("그룹장은 방출할 수 없습니다.");
    }

    const memberRef = doc(db, "groups", groupId, "members", memberId);
    const memberDoc = await getDoc(memberRef);

    if (!memberDoc.exists()) {
      throw new Error("멤버를 찾을 수 없습니다.");
    }

    const batch = writeBatch(db);

    const userRef = doc(db, "users", memberId);
    batch.update(userRef, { groupId: null });

    batch.delete(memberRef);

    await updateDoc(groupRef, {
      memberCount: Math.max((groupData.memberCount || 1) - 1, 0),
    });

    await batch.commit();
  } catch (error) {
    console.error("멤버 방출 오류:", error);
    throw error;
  }
};

/**
 * 그룹 나가기
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 나가는 사용자 ID
 * @returns {Promise<void>}
 */
export const leaveGroup = async (groupId, userId) => {
  try {
    const groupRef = doc(db, "groups", groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      throw new Error("그룹을 찾을 수 없습니다.");
    }

    const groupData = groupDoc.data();
    if (groupData.leaderId === userId) {
      throw new Error("그룹장은 그룹을 나갈 수 없습니다. 그룹을 삭제해주세요.");
    }

    const memberRef = doc(db, "groups", groupId, "members", userId);
    const memberDoc = await getDoc(memberRef);

    if (!memberDoc.exists()) {
      throw new Error("멤버 정보를 찾을 수 없습니다.");
    }

    const batch = writeBatch(db);

    const userRef = doc(db, "users", userId);
    batch.update(userRef, { groupId: null });

    batch.delete(memberRef);

    await updateDoc(groupRef, {
      memberCount: Math.max((groupData.memberCount || 1) - 1, 0),
    });

    await batch.commit();
  } catch (error) {
    console.error("그룹 나가기 오류:", error);
    throw error;
  }
};
