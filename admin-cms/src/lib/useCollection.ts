// ============================================================
// ENZOPIZZA HAJMÁSKÉR — Admin CMS
// Generic Firestore collection hook: subscribes in real time
// and exposes add/update/remove helpers. Used by every table
// in the admin (categories, products, reviews).
// ============================================================

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  type DocumentData
} from "firebase/firestore";
import { db } from "./firebase";

export function useCollection<T extends DocumentData & { id: string }>(
  path: string,
  orderField: string = "order"
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, path), orderBy(orderField, "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as T)));
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Firestore subscription error (${path}):`, err);
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [path, orderField]);

  async function addItem(data: Omit<T, "id">) {
    await addDoc(collection(db, path), data);
  }

  async function updateItem(id: string, patch: Partial<T>) {
    await updateDoc(doc(db, path, id), patch as DocumentData);
  }

  async function removeItem(id: string) {
    await deleteDoc(doc(db, path, id));
  }

  return { items, loading, error, addItem, updateItem, removeItem };
}

// Settings documents (settings/general, settings/hours) aren't a
// list — they're single fixed-ID docs. This hook handles that case.
export function useDocument<T extends DocumentData>(path: string, id: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, path, id),
      (snap) => {
        setData(snap.exists() ? (snap.data() as T) : null);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Firestore document subscription error (${path}/${id}):`, err);
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [path, id]);

  async function save(patch: Partial<T>) {
    await setDoc(doc(db, path, id), patch, { merge: true });
  }

  return { data, loading, error, save };
}
