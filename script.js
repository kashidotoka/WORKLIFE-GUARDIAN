let startTime;
let timerInterval;
let totalTodaySeconds = 0;

// Start Work
function startWork() {
    if (timerInterval) return;

    startTime = new Date();
    localStorage.setItem("startTime", startTime);

    timerInterval = setInterval(() => {
        let now = new Date();
        let diff = Math.floor((now - startTime) / 1000);
        document.getElementById("timer").innerText = formatTime(diff);
        if (diff === 2700) {
    alert("☕ Time for a break!");
}
    }, 1000);
}

// End Work
function endWork() {
    if (!timerInterval) return;

    clearInterval(timerInterval);
    localStorage.removeItem("startTime");
    timerInterval = null;

    let endTime = new Date();
    let sessionSeconds = Math.floor((endTime - startTime) / 1000);

    totalTodaySeconds += sessionSeconds;

    saveSession(sessionSeconds);
    updateTodayDisplay();
    displayHistory();
    updateWeeklyDisplay();
    updateGuardianScore();
    updateGoalProgress();
    updateAchievements();
    updateStreak();
    updateWellnessTip();
    updateWeeklyDisplay();
    updateProductivity();

    document.getElementById("timer").innerText = "00:00:00";
}

// Format time
function formatTime(seconds) {
    let hrs = Math.floor(seconds / 3600);
    let mins = Math.floor((seconds % 3600) / 60);
    let secs = seconds % 60;

    return (
        String(hrs).padStart(2, '0') + ":" +
        String(mins).padStart(2, '0') + ":" +
        String(secs).padStart(2, '0')
    );
}

// Save session to localStorage
function saveSession(seconds) {
    let sessions = JSON.parse(localStorage.getItem("sessions")) || [];

    sessions.push({
        date: new Date().toISOString(),
        duration: seconds
    });

    localStorage.setItem("sessions", JSON.stringify(sessions));
}

// Update today's total hours
function updateTodayDisplay() {
    let hours = (totalTodaySeconds / 3600).toFixed(2);
    document.getElementById("todayHours").innerText =
        "Today's Work Time: " + hours + " hours";
}
window.onload = function () {

    loadSessions();
    let savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {

        document.body.classList.add("dark-mode");

         document.getElementById("darkModeBtn").innerText =
        "☀️ Light Mode";
    }

    let savedStartTime = localStorage.getItem("startTime");

    if (savedStartTime) {

        startTime = new Date(savedStartTime);

        timerInterval = setInterval(() => {

            let now = new Date();

            let diff = Math.floor((now - startTime) / 1000);

            document.getElementById("timer").innerText =
                formatTime(diff);

        }, 1000);
    }
};
function loadSessions() {
    let sessions = JSON.parse(localStorage.getItem("sessions")) || [];

    let today = new Date().toISOString().split("T")[0];

    totalTodaySeconds = 0;

    sessions.forEach(session => {
        let sessionDate = session.date.split("T")[0];

        if (sessionDate === today) {
            totalTodaySeconds += session.duration;
        }
    });

    updateTodayDisplay();
    updateWeeklyDisplay();
    updateGuardianScore();
    displayHistory();
    updateGoalProgress();
    drawWeeklyChart();
    updateAchievements();
    updateStreak();
    updateWellnessTip();
    updateWeeklyDisplay();
    updateProductivity();
}
function updateWeeklyDisplay() {
    let sessions = JSON.parse(localStorage.getItem("sessions")) || [];

    let now = new Date();
    let weekStart = new Date(now.setDate(now.getDate() - now.getDay()));

    let weeklySeconds = 0;

    sessions.forEach(session => {
        let sessionDate = new Date(session.date);

        if (sessionDate >= weekStart) {
            weeklySeconds += session.duration;
        }
    });

    let weeklyHours = (weeklySeconds / 3600).toFixed(2);
    let overtimeHours = Math.max(0, weeklyHours - 40).toFixed(2);

    document.getElementById("weeklyHours").innerText =
        "Weekly Work Time: " + weeklyHours + " hours";

    document.getElementById("overtime").innerText =
        "Overtime: " + overtimeHours + " hours";
}
function updateGuardianScore() {
    let sessions = JSON.parse(localStorage.getItem("sessions")) || [];

    let now = new Date();
    let weekStart = new Date(now.setDate(now.getDate() - now.getDay()));

    let weeklySeconds = 0;

    sessions.forEach(session => {
        let sessionDate = new Date(session.date);
        if (sessionDate >= weekStart) {
            weeklySeconds += session.duration;
        }
    });

    let weeklyHours = weeklySeconds / 3600;
    let overtime = Math.max(0, weeklyHours - 40);

    let score = 100 - (overtime * 2);
    if (score < 0) score = 0;

    score = score.toFixed(0);

    document.getElementById("guardianScore").innerText =
        "Guardian Score: " + score;

    let badgeText = "";
    let scoreElement = document.getElementById("guardianScore");

    if (score >= 90) {
        badgeText = "🏆 Boundary Master";
        scoreElement.style.color = "green";
    } else if (score >= 70) {
        badgeText = "⚖ Balanced Worker";
        scoreElement.style.color = "orange";
    } else {
        badgeText = "⚠ Burnout Risk";
        scoreElement.style.color = "red";
    }

    document.getElementById("badge").innerText = badgeText;
}
function displayHistory() {
    let sessions = JSON.parse(localStorage.getItem("sessions")) || [];

    let historyDiv = document.getElementById("history");

    historyDiv.innerHTML = "";

    sessions.slice().reverse().slice(0, 5).forEach(session => {

        let date = new Date(session.date).toLocaleDateString();

        let hours = (session.duration / 3600).toFixed(2);

    historyDiv.innerHTML +=
        `<p>${date} - ${hours} hours</p>`;
    });
}
function toggleDarkMode() {

    document.body.classList.toggle("dark-mode");

    let btn = document.getElementById("darkModeBtn");

    if (document.body.classList.contains("dark-mode")) {

        btn.innerText = "☀️ Light Mode";

        localStorage.setItem("theme", "dark");

    } else {

        btn.innerText = "🌙 Dark Mode";

        localStorage.setItem("theme", "light");
    }
}
function updateGoalProgress() {

    let workedHours = totalTodaySeconds / 3600;

    let goal = localStorage.getItem("dailyGoal") || 8;

    document.getElementById("goalProgress").innerText =
        "Progress: " + workedHours.toFixed(2) + " / " + goal + " Hours";

    if (workedHours >= goal) {

        document.getElementById("goalText").innerText =
            "🎉 Goal Achieved!";
    } else {

        document.getElementById("goalText").innerText =
            "Goal: " + goal + " Hours";
    }
}
function drawWeeklyChart() {
    let sessions = JSON.parse(localStorage.getItem("sessions")) || [];

    let dailyHours = [0, 0, 0, 0, 0, 0, 0];
    sessions.forEach(session => {

    let date = new Date(session.date);

    let day = date.getDay();

    dailyHours[day] += session.duration / 3600;

});

    const ctx = document.getElementById("weeklyChart");

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{
                label: "Work Hours",
                data: dailyHours
            }]
        }
    });
}
function updateAchievements() {

    let workedHours = totalTodaySeconds / 3600;

    let achievement = "No Achievement Yet";

    if (workedHours >= 1) {
        achievement = "🥉 First Hour Completed";
    }

    if (workedHours >= 4) {
        achievement = "🥈 Productivity Star";
    }

    if (workedHours >= 8) {
        achievement = "🥇 Goal Crusher";
    }

    document.getElementById("achievement").innerText =
        achievement;
}
function saveGoal() {

    let goal = document.getElementById("goalInput").value;

    if (!goal || goal <= 0) {

        alert("Please enter a valid goal!");

        return;
    }

    localStorage.setItem("dailyGoal", goal);

    updateGoalProgress();

    alert("Goal Saved!");
}
function updateProductivity() {

    let weeklyText =
        document.getElementById("weeklyHours").innerText;

    let weeklyHours =
        parseFloat(weeklyText.replace(/[^\d.]/g, ""));

    let level = "";

    if (weeklyHours < 10) {
        level = "🌱 Beginner";
    }
    else if (weeklyHours < 25) {
        level = "🚀 Active";
    }
    else if (weeklyHours < 40) {
        level = "🔥 Productive";
    }
    else {
        level = "🏆 Work Champion";
    }

    document.getElementById("productivity").innerText = level;
}
function updateStreak() {

    let sessions = JSON.parse(localStorage.getItem("sessions")) || [];

    let uniqueDays = [...new Set(
        sessions.map(session => session.date.split("T")[0])
    )];

    uniqueDays.sort();

    let streak = 0;

    let today = new Date();

    for (let i = uniqueDays.length - 1; i >= 0; i--) {

        let sessionDate = new Date(uniqueDays[i]);

        let diffDays = Math.floor(
            (today - sessionDate) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === streak) {
            streak++;
        } else {
            break;
        }
    }

    document.getElementById("streak").innerText =
        "🔥 Current Streak: " + streak + " Days";
}
function updateWellnessTip() {

    let scoreText =
        document.getElementById("guardianScore").innerText;

    let score = parseInt(scoreText.replace(/\D/g, ""));

    let tip = "";

    if (score >= 90) {
        tip = "🏆 Excellent balance! Keep it up.";
    }
    else if (score >= 70) {
        tip = "⚖ Good balance. Try taking short breaks.";
    }
    else {
        tip = "⚠ Burnout risk. Reduce overtime and rest more.";
    }

    document.getElementById("wellnessTip").innerText = tip;
}
function downloadReport() {

    let report =
        document.getElementById("todayHours").innerText + "\n" +
        document.getElementById("weeklyHours").innerText + "\n" +
        document.getElementById("guardianScore").innerText + "\n" +
        document.getElementById("achievement").innerText;

    let blob = new Blob([report], { type: "text/plain" });

    let a = document.createElement("a");

    a.href = URL.createObjectURL(blob);

    a.download = "WorkLifeReport.txt";

    a.click();
}
function updateMonthlyDisplay() {

    let sessions = JSON.parse(localStorage.getItem("sessions")) || [];

    let now = new Date();

    let currentMonth = now.getMonth();
    let currentYear = now.getFullYear();

    let monthlySeconds = 0;

    sessions.forEach(session => {

        let sessionDate = new Date(session.date);

        if (
            sessionDate.getMonth() === currentMonth &&
            sessionDate.getFullYear() === currentYear
        ) {
            monthlySeconds += session.duration;
        }
    });

    let monthlyHours = (monthlySeconds / 3600).toFixed(2);

    document.getElementById("monthlyHours").innerText =
        "Monthly Work Time: " + monthlyHours + " hours";
}
function clearHistory() {

    let confirmDelete =
        confirm("Are you sure you want to clear all history?");

    if (confirmDelete) {

        localStorage.removeItem("sessions");

        totalTodaySeconds = 0;

        loadSessions();

        alert("History Cleared!");
    }
}