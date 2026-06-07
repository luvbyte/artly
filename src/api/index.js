import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  serverTimestamp
} from "firebase/firestore";

import { db } from "@/firebase";

const artsRef = collection(db, "arts");

export async function createArt({ title, author, content, tags = [] }) {
  const docRef = await addDoc(artsRef, {
    title: title.trim(),

    author: author?.trim() || "Anonymous",

    content,

    tags: tags.map(tag => tag.toLowerCase().trim()),

    createdAt: serverTimestamp()
  });

  return docRef.id;
}

export async function getArt(id) {
  const snap = await getDoc(doc(db, "arts", id));

  if (!snap.exists()) {
    return null;
  }

  return {
    id: snap.id,
    ...snap.data()
  };
}

export async function getLatestArts(pageSize = 20) {
  const q = query(artsRef, orderBy("createdAt", "desc"), limit(pageSize));

  const snap = await getDocs(q);

  return {
    items: snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })),

    lastDoc: snap.docs[snap.docs.length - 1] ?? null,

    hasMore: snap.docs.length === pageSize
  };
}

export async function loadMoreArts(lastDoc, pageSize = 20) {
  if (!lastDoc) {
    return getLatestArts(pageSize);
  }

  const q = query(
    artsRef,
    orderBy("createdAt", "desc"),
    startAfter(lastDoc),
    limit(pageSize)
  );

  const snap = await getDocs(q);

  return {
    items: snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })),

    lastDoc: snap.docs[snap.docs.length - 1] ?? null,

    hasMore: snap.docs.length === pageSize
  };
}

export async function searchArtsByTag({
  tag,
  lastDoc = null,
  pageSize = 50
}) {
  const constraints = [
    where("tags", "array-contains", tag.toLowerCase()),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  ];

  if (lastDoc) {
    constraints.splice(
      constraints.length - 1,
      0,
      startAfter(lastDoc)
    );
  }

  const q = query(artsRef, ...constraints);

  const snap = await getDocs(q);

  return {
    items: snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })),
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
    hasMore: snap.docs.length === pageSize
  };
}


export async function getRandomArts(count = 5) {
  const snap = await getDocs(query(artsRef, limit(100)));

  if (snap.empty) {
    return [];
  }

  const docs = [...snap.docs];

  // Fisher-Yates shuffle
  for (let i = docs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [docs[i], docs[j]] = [docs[j], docs[i]];
  }

  return docs.slice(0, count).map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}