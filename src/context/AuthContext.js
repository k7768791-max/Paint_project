// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword as fbUpdatePassword
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp, addDoc, collection
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          const profile = snap.exists() ? snap.data() : {};
          setUser(firebaseUser);
          setUserProfile(profile);
          // Update lastLogin
          if (snap.exists()) {
            await updateDoc(doc(db, 'users', firebaseUser.uid), {
              lastLogin: serverTimestamp()
            }).catch(() => {});
          }
        } catch {
          setUser(firebaseUser);
          setUserProfile({});
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, 'users', cred.user.uid));
    const profile = snap.data() || {};
    setUserProfile(profile);
    // Log activity
    try {
      await addDoc(collection(db, 'activity_logs'), {
        uid: cred.user.uid,
        userName: profile.name || email,
        role: profile.role || 'user',
        action: 'User logged in',
        details: `${profile.name || email} signed in`,
        createdAt: serverTimestamp()
      });
    } catch {}
    return profile;
  };

  const register = async (email, password, name, role) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const profile = {
      uid: cred.user.uid,
      email,
      name,
      role,
      subscription: 'free',
      subscriptionExpiry: null,
      status: 'active',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    };
    await setDoc(doc(db, 'users', cred.user.uid), profile);
    setUserProfile(profile);
    // Log activity + notification for admin
    try {
      await addDoc(collection(db, 'activity_logs'), {
        uid: cred.user.uid,
        userName: name,
        role,
        action: 'New user registered',
        details: `${name} (${role}) joined ChromaAI`,
        createdAt: serverTimestamp()
      });
      // Welcome notification for user
      await addDoc(collection(db, `notifications/${cred.user.uid}/items`), {
        message: `Welcome to ChromaAI, ${name}! Start exploring AI-powered paint recommendations.`,
        type: 'info',
        read: false,
        createdAt: serverTimestamp(),
        link: `/${role}/dashboard`
      });
    } catch {}
    return profile;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (uid, updates) => {
    await updateDoc(doc(db, 'users', uid), updates);
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const changePassword = async (newPassword) => {
    await fbUpdatePassword(auth.currentUser, newPassword);
  };

  return (
    <AuthContext.Provider value={{
      user, userProfile, loading,
      login, register, logout, updateProfile, changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);