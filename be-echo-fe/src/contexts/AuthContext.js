import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  deleteUser,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";

const AuthContext = createContext({
  user: null,
  loading: true,
  signInWithGoogle: () => Promise.resolve(),
  signInWithEmail: () => Promise.resolve(),
  signUpWithEmail: () => Promise.resolve(),
  resetPassword: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  deleteAccount: () => Promise.resolve(),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firestore에서 사용자 데이터 가져오기
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const existingData = userDoc.data();
          const updates = {};

          if (firebaseUser.displayName) {
            updates.name = firebaseUser.displayName;
            updates.username = firebaseUser.displayName;
          }

          if (firebaseUser.photoURL) {
            updates.photoURL = firebaseUser.photoURL;
          }

          if (Object.keys(updates).length > 0) {
            await setDoc(userDocRef, updates, { merge: true });
          }

          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            ...existingData,
            ...updates,
            name:
              firebaseUser.displayName ||
              updates.name ||
              existingData.name ||
              "사용자",
            username:
              firebaseUser.displayName ||
              updates.username ||
              existingData.username ||
              existingData.name ||
              "사용자",
            photoURL:
              firebaseUser.photoURL ||
              updates.photoURL ||
              existingData.photoURL,
            groupId: existingData.groupId || null,
            isGroupLeader: existingData.isGroupLeader || false,
          });
        } else {
          const newUserData = {
            name: firebaseUser.displayName || "사용자",
            username: firebaseUser.displayName || "사용자", // username 필드도 추가
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            lp: 0,
            streakDays: 0,
            bestStreak: 0,
            totalSuccessCount: 0,
            lastSuccessDate: null,
            createdAt: new Date().toISOString(),
            groupId: null,
          };

          await setDoc(userDocRef, newUserData);

          setUser({
            id: firebaseUser.uid,
            ...newUserData,
            groupId: null,
            isGroupLeader: false,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      if (result?.user) {
        const userDocRef = doc(db, "users", result.user.uid);
        const userDoc = await getDoc(userDocRef);

        const updates = {};
        if (result.user.displayName) {
          updates.name = result.user.displayName;
          updates.username = result.user.displayName;
        }
        if (result.user.photoURL) {
          updates.photoURL = result.user.photoURL;
        }

        if (Object.keys(updates).length > 0) {
          if (userDoc.exists()) {
            await setDoc(userDocRef, updates, { merge: true });
          } else {
            // 새 사용자인 경우 전체 데이터 생성
            await setDoc(userDocRef, {
              name: result.user.displayName || "사용자",
              username: result.user.displayName || "사용자",
              email: result.user.email,
              photoURL: result.user.photoURL,
              lp: 0,
              streakDays: 0,
              bestStreak: 0,
              totalSuccessCount: 0,
              lastSuccessDate: null,
              createdAt: new Date().toISOString(),
              groupId: null,
              ...updates,
            });
          }
        }
      }

      return result;
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        console.log("사용자가 팝업을 닫았습니다.");
        return null;
      }
      console.error("구글 로그인 오류:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      console.error("이메일 로그인 오류:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email, password, name) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Firestore에 사용자 데이터 생성
      const userDocRef = doc(db, "users", result.user.uid);
      const newUserData = {
        name: name || "사용자",
        username: name || "사용자",
        email: result.user.email,
        photoURL: null,
        lp: 0,
        streakDays: 0,
        bestStreak: 0,
        totalSuccessCount: 0,
        lastSuccessDate: null,
        createdAt: new Date().toISOString(),
        groupId: null,
      };

      await setDoc(userDocRef, newUserData);

      return result;
    } catch (error) {
      console.error("회원가입 오류:", error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("비밀번호 재설정 오류:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("로그아웃 오류:", error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("로그인된 사용자가 없습니다.");
      }

      const userId = currentUser.uid;

      const providerId = currentUser.providerData[0]?.providerId;

      try {
        if (providerId === "google.com") {
          await reauthenticateWithPopup(currentUser, googleProvider);
        } else if (providerId === "password") {
          const password = window.prompt(
            "계정 삭제를 위해 비밀번호를 다시 입력해주세요:"
          );
          if (!password) {
            throw new Error("비밀번호가 필요합니다.");
          }
          const credential = EmailAuthProvider.credential(
            currentUser.email,
            password
          );
          await reauthenticateWithCredential(currentUser, credential);
        }
      } catch (reauthError) {
        if (reauthError.code === "auth/requires-recent-login") {
          throw new Error(
            "보안을 위해 다시 로그인해주세요. 잠시 후 다시 시도해주세요."
          );
        }
        if (reauthError.code === "auth/popup-closed-by-user") {
          throw new Error("재인증이 취소되었습니다.");
        }
        throw reauthError;
      }

      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : null;

      if (userData?.groupId) {
        const groupRef = doc(db, "groups", userData.groupId);
        const groupDoc = await getDoc(groupRef);

        if (groupDoc.exists()) {
          const groupData = groupDoc.data();

          if (groupData.leaderId === userId) {
            const batch = writeBatch(db);
            const membersRef = collection(
              db,
              "groups",
              userData.groupId,
              "members"
            );
            const membersSnapshot = await getDocs(membersRef);

            membersSnapshot.docs.forEach((memberDoc) => {
              const memberId = memberDoc.id;
              if (memberId !== userId) {
                const memberUserRef = doc(db, "users", memberId);
                batch.update(memberUserRef, { groupId: null });
              }
              batch.delete(memberDoc.ref);
            });

            const verificationsRef = collection(db, "verifications");
            const groupVerificationsQuery = query(
              verificationsRef,
              where("groupId", "==", userData.groupId)
            );
            const verificationsSnapshot = await getDocs(
              groupVerificationsQuery
            );
            verificationsSnapshot.docs.forEach((verificationDoc) => {
              batch.update(verificationDoc.ref, { groupId: null });
            });

            batch.delete(groupRef);
            await batch.commit();
          } else {
            try {
              const memberRef = doc(
                db,
                "groups",
                userData.groupId,
                "members",
                userId
              );
              const memberDoc = await getDoc(memberRef);
              if (memberDoc.exists()) {
                await deleteDoc(memberRef);
              }

              const updatedGroupDoc = await getDoc(groupRef);
              if (updatedGroupDoc.exists()) {
                const updatedGroupData = updatedGroupDoc.data();
                const newMemberCount = Math.max(
                  (updatedGroupData.memberCount || 1) - 1,
                  0
                );
                if (newMemberCount >= 0) {
                  await updateDoc(groupRef, {
                    memberCount: newMemberCount,
                  });
                }
              }
            } catch (groupError) {
              console.warn("그룹 업데이트 오류 (무시됨):", groupError);
            }
          }
        }
      }

      const verificationsRef = collection(db, "verifications");
      const userVerificationsQuery = query(
        verificationsRef,
        where("userId", "==", userId)
      );
      const verificationsSnapshot = await getDocs(userVerificationsQuery);
      const deleteVerificationPromises = verificationsSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deleteVerificationPromises);

      if (userDoc.exists()) {
        await deleteDoc(userDocRef);
      }

      // 3. 마지막으로 Authentication에서 사용자 삭제
      // 재인증 후에는 currentUser가 업데이트되었을 수 있으므로 다시 가져옴
      const updatedUser = auth.currentUser;
      if (updatedUser) {
        await deleteUser(updatedUser);
      } else {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }

      setUser(null);

      if (typeof window !== "undefined") {
        localStorage.clear();
        window.location.href = "/";
      }

      return { success: true };
    } catch (error) {
      console.error("회원탈퇴 오류:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setUser(null);
        return;
      }

      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const existingData = userDoc.data();
        setUser({
          id: currentUser.uid,
          email: currentUser.email,
          ...existingData,
          name: currentUser.displayName || existingData.name || "사용자",
          username:
            currentUser.displayName ||
            existingData.username ||
            existingData.name ||
            "사용자",
          photoURL: currentUser.photoURL || existingData.photoURL,
          groupId: existingData.groupId || null,
        });
      }
    } catch (error) {
      console.error("사용자 정보 새로고침 오류:", error);
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    logout,
    deleteAccount,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
