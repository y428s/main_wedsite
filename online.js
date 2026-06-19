import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* 1. Firebase 配置（必须替换） */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* 2. 在线更新函数 */
function updateOnline(user) {
  if (!user) return;

  setDoc(doc(db, "online_users", user.uid), {
    username: user.email || "unknown",
    page: window.location.pathname,
    lastActive: Date.now(),
    status: "online"
  }, { merge: true });
}

/* 3. 登录状态监听 */
onAuthStateChanged(auth, (user) => {
  if (!user) return;

  // 立即写入一次
  updateOnline(user);

  // 每 5 秒更新一次在线状态
  setInterval(() => {
    updateOnline(user);
  }, 5000);
});

/* 4. 页面关闭/切换时标记（尽力而为） */
window.addEventListener("beforeunload", async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await setDoc(doc(db, "online_users", user.uid), {
      status: "offline",
      lastActive: Date.now()
    }, { merge: true });
  } catch (e) {}
});