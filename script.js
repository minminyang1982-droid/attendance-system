const records = JSON.parse(localStorage.getItem("attendanceRecords") || "[]");
const leaves = JSON.parse(localStorage.getItem("leaveRecords") || "[]");

const panels = document.querySelectorAll(".panel");
const navBtns = document.querySelectorAll(".nav-btn");
const recordTable = document.getElementById("recordTable");
const recentList = document.getElementById("recentList");

function saveData() {
  localStorage.setItem("attendanceRecords", JSON.stringify(records));
  localStorage.setItem("leaveRecords", JSON.stringify(leaves));
}

function formatNow() {
  return new Date().toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function updateToday() {
  document.getElementById("todayDate").textContent = new Date().toLocaleDateString("zh-TW");
}

function renderDashboard() {
  const today = new Date().toLocaleDateString("sv-SE");
  const todayRecords = records.filter(r => r.date === today);
  document.getElementById("statChecked").textContent = todayRecords.length;
  document.getElementById("statLate").textContent = todayRecords.filter(r => r.status === "遲到").length;
  document.getElementById("statLeave").textContent = leaves.length;

  recentList.innerHTML = todayRecords.slice(-5).reverse().map(r => `
    <div class="list-item">
      <span>${r.name}（${r.id}）${r.type}</span>
      <strong>${r.time}</strong>
    </div>
  `).join("") || "<p>今天還沒有打卡紀錄。</p>";
}

function renderTable() {
  recordTable.innerHTML = records.slice().reverse().map(r => `
    <tr>
      <td>${r.time}</td>
      <td>${r.id}</td>
      <td>${r.name}</td>
      <td>${r.type}</td>
      <td>${r.status}</td>
    </tr>
  `).join("");
}

function renderAll() {
  updateToday();
  renderDashboard();
  renderTable();
}

navBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    navBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    panels.forEach(p => p.classList.remove("active"));
    document.getElementById(btn.dataset.target).classList.add("active");
  });
});

document.getElementById("clockBtn").addEventListener("click", () => {
  const id = document.getElementById("empId").value.trim();
  const name = document.getElementById("empName").value.trim();
  const type = document.getElementById("clockType").value;
  const now = new Date();
  if (!id || !name) {
    document.getElementById("clockMsg").textContent = "請輸入員工編號與姓名。";
    return;
  }
  const status = now.getHours() >= 9 && type === "上班" ? "遲到" : "正常";
  records.push({
    id,
    name,
    type,
    status,
    time: formatNow(),
    date: now.toLocaleDateString("sv-SE")
  });
  saveData();
  renderAll();
  document.getElementById("clockMsg").textContent = "打卡成功。";
});

document.getElementById("leaveBtn").addEventListener("click", () => {
  const id = document.getElementById("leaveEmpId").value.trim();
  const name = document.getElementById("leaveEmpName").value.trim();
  const date = document.getElementById("leaveDate").value;
  const type = document.getElementById("leaveType").value;
  const reason = document.getElementById("leaveReason").value.trim();

  if (!id || !name || !date || !reason) {
    document.getElementById("leaveMsg").textContent = "請完整填寫請假資料。";
    return;
  }

  leaves.push({ id, name, date, type, reason, createdAt: formatNow() });
  saveData();
  renderAll();
  document.getElementById("leaveMsg").textContent = "請假申請已送出。";
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const csv = [
    ["時間", "員工編號", "姓名", "類型", "狀態"],
    ...records.map(r => [r.time, r.id, r.name, r.type, r.status])
  ].map(row => row.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "attendance_records.csv";
  a.click();
  URL.revokeObjectURL(url);
});

renderAll();