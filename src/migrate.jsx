import { db } from "./firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

const FAMILY_CODE = "OZNXCK";
const WEEK_KEY = "2026-06-29";

async function migrate() {
  const oldRef = doc(db, "menus", FAMILY_CODE);
  const oldSnap = await getDoc(oldRef);
  if (oldSnap.exists()) {
    const newRef = doc(db, "menus", `${FAMILY_CODE}_${WEEK_KEY}`);
    await setDoc(newRef, oldSnap.data());
    console.log("Готово! Менюто е мигрирано към:", `${FAMILY_CODE}_${WEEK_KEY}`);
  } else {
    console.log("Не намерих старото меню!");
  }
}

migrate();