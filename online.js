import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 1. Firebase 配置（必须是你的真实配置） */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* 2. 生成唯一用户ID（不用登录） */
const uid = localStorage.getItem("uid") || crypto.randomUUID();
localStorage.setItem("uid", uid);

/* 3. 获取当前页面 */
const page = window.location.pathname;

/* 4. 写入在线数据 */
async function updateOnline() {
  try {
    await setDoc(doc(db, "online_users", uid), {
      username: "guest",
      page: page,
      lastActive: Date.now(),
      status: "online"
    }, { merge: true });
  } catch (e) {
    console.error("Firestore 写入失败:", e);
  }
}

/* 5. 首次写入 */
updateOnline();

/* 6. 每5秒更新在线状态 */
setInterval(() => {
  updateOnline();
}, 5000);

/* 7. 页面关闭时标记离线 */
window.addEventListener("beforeunload", async () => {
  try {
    await setDoc(doc(db, "online_users", uid), {
      status: "offline",
      lastActive: Date.now()
    }, { merge: true });
  } catch (e) {}
});
