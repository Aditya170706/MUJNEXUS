/* ================= AUTH ================= */

function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (user === "student" && pass === "1234") {
    localStorage.setItem("loggedIn", "true");
    window.location.href = "index.html";
  } else {
    document.getElementById("login-error").style.display = "block";
  }
}

function logout() {
  localStorage.removeItem("loggedIn");
  window.location.href = "login.html";
}

/* ================= PROTECT PAGES ================= */

function checkAuth() {
  if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
  }
}






/* ================= DEFAULT DATA ================= */
const defaultData = {
  attendance: {
    DSA: { total: 40, attended: 33 },
    OS: { total: 38, attended: 28 }
  }
};

/* ================= STORAGE ================= */
function loadData() {
  return JSON.parse(localStorage.getItem("eduData")) || defaultData;
}

function saveData(data) {
  localStorage.setItem("eduData", JSON.stringify(data));
}

/* ================= ATTENDANCE PAGE ================= */
function loadAttendance() {
  const data = loadData();
  const body = document.getElementById("attendance-body");
  if (!body) return;

  body.innerHTML = "";

  Object.keys(data.attendance).forEach(subject => {
    const a = data.attendance[subject];
    const percent = Math.round((a.attended / a.total) * 100);

    body.innerHTML += `
      <tr>
        <td>${subject}</td>
        <td>${a.total}</td>
        <td>${a.attended}</td>
        <td>${percent}%</td>
        <td class="${percent >= 75 ? 'safe' : 'danger'}">
          ${percent >= 75 ? 'Safe' : 'Shortage'}
        </td>
        <td>
          <button onclick="markPresent('${subject}')">
            Mark Present
          </button>
        </td>
      </tr>
    `;
  });
}

/* ================= ADD SUBJECT ================= */
function addSubject() {
  const subject = prompt("Enter subject name:");
  const total = prompt("Total classes:");

  if (!subject || !total) return;

  const data = loadData();

  if (data.attendance[subject]) {
    alert("Subject already exists");
    return;
  }

  data.attendance[subject] = {
    total: Number(total),
    attended: 0
  };

  saveData(data);
  loadAttendance();
  loadDashboard();
}

/* ================= MARK PRESENT ================= */
function markPresent(subject) {
  const data = loadData();
  const s = data.attendance[subject];

  if (s.attended < s.total) {
    s.attended++;
    saveData(data);
    loadAttendance();
    loadDashboard();
  } else {
    alert("Attendance already complete");
  }
}

/* ================= DASHBOARD ================= */
function loadDashboard() {
  const data = loadData();
  const subjects = Object.keys(data.attendance);
  if (subjects.length === 0) return;

  let totalClasses = 0;
  let totalAttended = 0;

  subjects.forEach(sub => {
    totalClasses += data.attendance[sub].total;
    totalAttended += data.attendance[sub].attended;
  });

  const overall = Math.round((totalAttended / totalClasses) * 100);

  setText("total-subjects", subjects.length);
  setText("overall-attendance", overall + "%");
}

/* ================= UTIL ================= */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.innerText = val;
}

/* ================= AUTO LOAD ================= */
document.addEventListener("DOMContentLoaded", () => {
  loadAttendance();
  loadDashboard();
});
/* ================= ASSIGNMENT STORAGE ================= */

function getData() {
  return JSON.parse(localStorage.getItem("eduData")) || {
    attendance: {},
    assignments: []
  };
}

function setData(data) {
  localStorage.setItem("eduData", JSON.stringify(data));
}

/* ================= ADD ASSIGNMENT ================= */

function addAssignment() {
  const title = document.getElementById("a-title").value;
  const subject = document.getElementById("a-subject").value;
  const due = document.getElementById("a-due").value;

  if (!title || !subject || !due) {
    alert("Please fill all fields");
    return;
  }

  const data = getData();

  data.assignments.push({
    title,
    subject,
    due,
    status: "Pending"
  });

  setData(data);

  document.getElementById("a-title").value = "";
  document.getElementById("a-subject").value = "";
  document.getElementById("a-due").value = "";

  renderAssignments();
  updateDashboardAssignments();
}

/* ================= RENDER ASSIGNMENTS ================= */

function renderAssignments(filter = "All") {
  const data = getData();
  const list = document.getElementById("assignment-list");
  if (!list) return;

  list.innerHTML = "";

  let filtered = data.assignments;

  if (filter !== "All") {
    filtered = filtered.filter(a => a.status === filter);
  }

  filtered.forEach((a, index) => {
    list.innerHTML += `
      <div class="card">
        <h3>${a.title}</h3>
        <p><b>Subject:</b> ${a.subject}</p>
        <p><b>Due:</b> ${a.due}</p>
        <span class="badge ${a.status.toLowerCase()}">${a.status}</span>
        <br><br>
        ${
          a.status === "Pending"
            ? `<button onclick="submitAssignment(${index})">Submit</button>`
            : `<button class="secondary" disabled>Submitted</button>`
        }
      </div>
    `;
  });
}

/* ================= SUBMIT ASSIGNMENT ================= */

function submitAssignment(index) {
  const data = getData();
  data.assignments[index].status = "Submitted";
  setData(data);
  renderAssignments();
  updateDashboardAssignments();
}

/* ================= DASHBOARD ASSIGNMENT STATS ================= */

function updateDashboardAssignments() {
  const data = getData();

  const total = data.assignments.length;
  const pending = data.assignments.filter(a => a.status === "Pending").length;
  const submitted = data.assignments.filter(a => a.status === "Submitted").length;

  setText("total-assignments", total);
  setText("pending-assignments", pending);
  setText("submitted-assignments", submitted);
}

/* ================= UTIL ================= */

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.innerText = val;
}

/* ================= AUTO LOAD ================= */

document.addEventListener("DOMContentLoaded", () => {
  renderAssignments();
  updateDashboardAssignments();
});
/* ================= TEACHERS ================= */

// Ensure teachers array exists
function getTeacherData() {
  const data = loadData();
  if (!data.teachers) data.teachers = [];
  saveData(data);
  return data;
}

/* ---- Add Teacher ---- */
function addTeacher() {
  const name = document.getElementById("t-name").value;
  const subject = document.getElementById("t-subject").value;

  if (!name || !subject) {
    alert("Please fill all fields");
    return;
  }

  const data = getTeacherData();
  data.teachers.push({
    name,
    subject,
    likes: 0,
    dislikes: 0
  });

  saveData(data);

  document.getElementById("t-name").value = "";
  document.getElementById("t-subject").value = "";

  renderTeachers();
}

/* ---- Render Teachers ---- */
function renderTeachers() {
  const data = getTeacherData();
  const container = document.getElementById("teacher-list");
  if (!container) return;

  container.innerHTML = "";

  data.teachers.forEach((t, index) => {
    container.innerHTML += `
      <div class="card">
        <h3>${t.name}</h3>
        <p><b>Subject:</b> ${t.subject}</p>
        <br>
        <button onclick="likeTeacher(${index})">
          👍 ${t.likes}
        </button>
        <button class="secondary" onclick="dislikeTeacher(${index})">
          👎 ${t.dislikes}
        </button>
      </div>
    `;
  });
}

/* ---- Like / Dislike ---- */
function likeTeacher(i) {
  const data = getTeacherData();
  data.teachers[i].likes++;
  saveData(data);
  renderTeachers();
}

function dislikeTeacher(i) {
  const data = getTeacherData();
  data.teachers[i].dislikes++;
  saveData(data);
  renderTeachers();
}

/* ---- Auto Load Teachers ---- */
document.addEventListener("DOMContentLoaded", () => {
  renderTeachers();
});

