// src/services/authService.js
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export const updateSubscription = async (uid, plan) => {
  await updateDoc(doc(db, 'users', uid), { subscription: plan });
};

export const getUsersByRole = async (role) => {
  const q = query(collection(db, 'users'), where('role', '==', role));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const savePrediction = async (uid, type, input, output) => {
  const { addDoc, collection: col } = await import('firebase/firestore');
  await addDoc(col(db, 'predictions'), {
    uid, type, input, output,
    createdAt: new Date().toISOString()
  });
};

export const getUserPredictions = async (uid) => {
  const q = query(collection(db, 'predictions'), where('uid', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};