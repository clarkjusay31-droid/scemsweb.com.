// Demo accounts
const accounts = {
  "admin@gfis.edu.ph": {password:"admin123", role:"admin"},
  "student@gfis.edu.ph": {password:"student123", role:"student"}
};

// HTML elements
const loginPage = document.getElementById("loginPage");
const dashboard = document.getElementById("dashboard");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const adminForm = document.getElementById("adminForm");
const titleInput = document.getElementById("titleInput");
const descInput = document.getElementById("descInput");
const categoryInput = document.getElementById("categoryInput");
const dateInput = document.getElementById("dateInput");
const announcementsDiv = document.getElementById("announcements");
const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const errorMsg = document.getElementById("error");
const clearFilterBtn = document.getElementById("clearFilterBtn");

let userRole = "";
let announcements = JSON.parse(localStorage.getItem("announcements")) || [];

// Toggle password visibility
function togglePassword(){
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
}

// Login
function login(){
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if(!email.endsWith("@gfis.edu.ph")){
    errorMsg.innerText = "Invalid school email";
    return;
  }

  if(!accounts[email] || accounts[email].password !== password){
    errorMsg.innerText = "Incorrect email or password";
    return;
  }

  userRole = accounts[email].role;
  loginPage.style.display = "none";
  dashboard.style.display = "block";
  adminForm.style.display = userRole === "admin" ? "block" : "none";

  renderAnnouncements();
  renderCalendar();
}

// Logout
function logout(){ location.reload(); }

// Add announcement
function addAnnouncement(){
  if(!dateInput.value){
    alert("Please select a date");
    return;
  }

  const dateObj = new Date(dateInput.value);
  const formattedDate = dateObj.toLocaleDateString("en-GB");

  announcements.push({
    id: Date.now(),
    title: titleInput.value,
    desc: descInput.value,
    category: categoryInput.value,
    date: formattedDate
  });

  localStorage.setItem("announcements", JSON.stringify(announcements));
  renderAnnouncements();
  renderCalendar();

  titleInput.value = descInput.value = dateInput.value = "";
}

// Render announcements (filtered or all)
function renderAnnouncements(selectedDate=null){
  announcementsDiv.innerHTML = "";
  let filtered = announcements;
  if(selectedDate) {
    filtered = announcements.filter(a => a.date === selectedDate);
    clearFilterBtn.style.display = "block";
  } else {
    clearFilterBtn.style.display = "none";
  }

  filtered.forEach(a=>{
    const card = document.createElement("div");
    card.className = "card";

    let todayTag = "";
    if(a.date === new Date().toLocaleDateString("en-GB")) todayTag = <div class="todayTag">Today</div>;

    card.innerHTML = `
      <span class="tag ${a.category}">${a.category}</span>
      <h4>${a.title}</h4>
      <p>${a.desc}</p>
      <small>${a.date}</small>
      ${todayTag}
      ${userRole === "admin" ? <br><button onclick="deleteAnnouncement(${a.id})">Delete</button> : ""}
    `;
    announcementsDiv.appendChild(card);
  });
}

// Clear filter
function clearFilter(){
  renderAnnouncements();
}

// Delete announcement
function deleteAnnouncement(id){
  announcements = announcements.filter(a => a.id !== id);
  localStorage.setItem("announcements", JSON.stringify(announcements));
  renderAnnouncements();
  renderCalendar();
}

// Render calendar dynamically
function renderCalendar(){
  calendar.innerHTML = "";
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  monthYear.innerText = now.toLocaleString('default', {month:'long', year:'numeric'});

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();

  // Empty cells
  for(let i=0;i<firstDay;i++){
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  for(let day=1; day<=daysInMonth; day++){
    const dateObj = new Date(year, month, day);
    const formattedDate = dateObj.toLocaleDateString("en-GB");
    const dayDiv = document.createElement("div");
    dayDiv.className = "day";

    // Status
    if(formattedDate === new Date().toLocaleDateString("en-GB")) dayDiv.classList.add("today");
    else if(dateObj < new Date()) dayDiv.classList.add("past");
    else dayDiv.classList.add("upcoming");

    if(announcements.some(a=>a.date === formattedDate)) dayDiv.classList.add("hasEvent");

    dayDiv.innerText = day;

    // Click to filter announcements
    dayDiv.addEventListener("click", ()=> renderAnnouncements(formattedDate));

    calendar.appendChild(dayDiv);
  }
}
