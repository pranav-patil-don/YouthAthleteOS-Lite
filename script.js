// ==========================================
// YOUTHATHLETEOS
// SINGLE FILE APPLICATION LOGIC
// ==========================================


// ==========================================
// DEFAULT DATA
// ==========================================

const defaultData = {
  profile: null,

  xp: 0,

  activities: [],

  strengthLogs: [],

  recovery: null,

  nutrition: null,

  ratings: {
    quality: 0,
    readiness: 0
  }
};


// ==========================================
// APP STATE
// ==========================================

let athleteData = loadData();

let selectedSport = "running";


// ==========================================
// STORAGE
// ==========================================

function loadData() {
  try {
    const saved = localStorage.getItem("youthAthleteOSData");

    if (!saved) {
      return structuredClone(defaultData);
    }

    const parsed = JSON.parse(saved);

    return {
      ...structuredClone(defaultData),
      ...parsed,
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
      strengthLogs: Array.isArray(parsed.strengthLogs) ? parsed.strengthLogs : []
    };

  } catch (error) {
    console.error("Storage load error:", error);
    return structuredClone(defaultData);
  }
}


function saveData() {
  localStorage.setItem(
    "youthAthleteOSData",
    JSON.stringify(athleteData)
  );
}


// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  updateDate();

  if (athleteData.profile) {
    openApp();
  }

  renderExercises();
});


function updateDate() {
  const dateElement = document.getElementById("todayDate");

  if (!dateElement) return;

  dateElement.textContent = new Date().toLocaleDateString(
    undefined,
    {
      weekday: "long",
      month: "long",
      day: "numeric"
    }
  );
}


// ==========================================
// ONBOARDING
// ==========================================

function initializeAthlete() {

  const name = document.getElementById("nameInput").value.trim();

  const age = Number(
    document.getElementById("ageInput").value
  );

  const weight = Number(
    document.getElementById("weightInput").value
  );

  const goal =
    document.getElementById("goalInput").value;

  const error =
    document.getElementById("onboardingError");

  error.textContent = "";


  if (!name) {
    error.textContent = "Enter your athlete name.";
    return;
  }

  if (!age || age < 10 || age > 25) {
    error.textContent = "Enter a valid age.";
    return;
  }

  if (!weight || weight <= 0) {
    error.textContent = "Enter a valid weight.";
    return;
  }


  athleteData.profile = {
    name,
    age,
    weight,
    goal
  };

  saveData();

  openApp();
}


function openApp() {

  document
    .getElementById("onboarding")
    .classList.add("hidden");

  document
    .getElementById("app")
    .classList.remove("hidden");

  updateAllUI();
}


// ==========================================
// NAVIGATION
// ==========================================

function showTab(tabName) {

  document
    .querySelectorAll(".tab")
    .forEach(tab => {
      tab.classList.remove("active");
    });

  const target =
    document.getElementById(
      `${tabName}Tab`
    );

  if (target) {
    target.classList.add("active");
  }


  document
    .querySelectorAll(".nav-item")
    .forEach(button => {

      button.classList.remove("active-nav");

      if (
        button.dataset.tab === tabName
      ) {
        button.classList.add("active-nav");
      }

    });


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  if (tabName === "analytics") {
    renderAnalytics();
  }

  if (tabName === "profile") {
    renderProfile();
  }
}


// ==========================================
// XP SYSTEM
// ==========================================

function addXP(amount) {

  athleteData.xp += amount;

  saveData();

  updateXPUI();
}


function getLevel() {

  const xp = athleteData.xp;

  if (xp >= 2000) return "ELITE ATHLETE";
  if (xp >= 1000) return "ADVANCED ATHLETE";
  if (xp >= 500) return "RISING STAR";
  if (xp >= 200) return "DEVELOPING ATHLETE";

  return "NOVICE ATHLETE";
}


function updateXPUI() {

  const level = getLevel();

  const badge =
    document.getElementById("levelBadge");

  const xpDisplay =
    document.getElementById("xpDisplay");

  const homeXp =
    document.getElementById("homeXp");

  if (badge) {
    badge.textContent =
      level.replace(" ATHLETE", "");
  }

  if (xpDisplay) {
    xpDisplay.textContent =
      `${athleteData.xp} XP`;
  }

  if (homeXp) {
    homeXp.textContent =
      `${athleteData.xp} XP`;
  }
}


// ==========================================
// DASHBOARD
// ==========================================

function updateAllUI() {

  if (!athleteData.profile) return;

  updateProfileInfo();

  updateXPUI();

  updateReadiness();

  updateTodayWorkout();

  updateHomeStats();

  updateNutritionTargets();

  updateFuelScore();

  renderActivityHistory();

  renderStrengthHistory();

  renderAnalytics();

  renderProfile();
}


function updateProfileInfo() {

  const profile = athleteData.profile;

  document.getElementById(
    "athleteName"
  ).textContent = profile.name;

  document.getElementById(
    "profileName"
  ).textContent = profile.name;

  document.getElementById(
    "profileInitial"
  ).textContent =
    profile.name.charAt(0).toUpperCase();

  document.getElementById(
    "profileDetails"
  ).textContent =
    `${profile.age} years • ${profile.weight} kg`;

  document.getElementById(
    "profileLevel"
  ).textContent =
    getLevel();
}


function updateHomeStats() {

  const nutrition =
    athleteData.nutrition;

  const recovery =
    athleteData.recovery;

  const waterProgress =
    document.getElementById("waterProgress");

  const homeSleep =
    document.getElementById("homeSleep");

  const homeReadiness =
    document.getElementById("homeReadiness");

  const homeProtein =
    document.getElementById("homeProtein");


  if (athleteData.profile) {

    const target =
      athleteData.profile.weight * 0.035;

    const water =
      nutrition?.water || 0;

    const percentage =
      Math.min(
        100,
        Math.round((water / target) * 100)
      );

    waterProgress.textContent =
      `${percentage}%`;
  }


  if (recovery) {

    homeSleep.textContent =
      `${recovery.sleepHours}h`;

    homeReadiness.textContent =
      `${recovery.readiness}/5`;

  } else {

    homeSleep.textContent =
      "Not logged";

    homeReadiness.textContent =
      "Not logged";
  }


  if (nutrition) {

    homeProtein.textContent =
      `${nutrition.protein}g`;

  }


  document.getElementById(
    "streakValue"
  ).textContent =
    calculateStreak();
}


function calculateStreak() {

  if (athleteData.activities.length === 0) {
    return "0 DAYS";
  }

  const dates = [
    ...new Set(
      athleteData.activities.map(
        item => item.date
      )
    )
  ];

  return `${dates.length} DAYS`;
}


// ==========================================
// TODAY WORKOUT
// ==========================================

function updateTodayWorkout() {

  const container =
    document.getElementById("todayWorkout");

  if (!container) return;

  const goal =
    athleteData.profile.goal;

  let workout;


  if (goal === "multisport") {

    workout = {
      emoji: "🏊",
      title: "Technique + Endurance",
      text:
        "Focus on one controlled multi-sport session. Prioritize technique over intensity."
    };

  } else if (goal === "endurance") {

    workout = {
      emoji: "🏃",
      title: "Aerobic Base",
      text:
        "Easy-to-moderate endurance work. Keep effort controlled."
    };

  } else if (goal === "strength") {

    workout = {
      emoji: "💪",
      title: "Strength & Stability",
      text:
        "Controlled resistance training with excellent technique."
    };

  } else {

    workout = {
      emoji: "⚡",
      title: "All-Round Development",
      text:
        "Combine movement quality, aerobic fitness and recovery."
    };
  }


  container.innerHTML = `
    <article class="today-card">
      <div class="emoji">${workout.emoji}</div>
      <div>
        <h3>${workout.title}</h3>
        <p>${workout.text}</p>
      </div>
    </article>
  `;
}


// ==========================================
// ACTIVITY LOGGER
// ==========================================

function selectSport(sport) {

  selectedSport = sport;

  document
    .querySelectorAll(".sport-btn")
    .forEach(button => {

      button.classList.remove("active-sport");

      if (
        button.dataset.sport === sport
      ) {
        button.classList.add("active-sport");
      }

    });


  const titles = {
    running: "🏃 RUNNING SESSION",
    cycling: "🚴 CYCLING SESSION",
    swimming: "🏊 SWIMMING SESSION"
  };

  document.getElementById(
    "selectedSportTitle"
  ).textContent =
    titles[sport];
}


function logActivity() {

  const distance = Number(
    document.getElementById("distanceInput").value
  );

  const hours = Number(
    document.getElementById("hoursInput").value || 0
  );

  const minutes = Number(
    document.getElementById("minutesInput").value || 0
  );

  const seconds = Number(
    document.getElementById("secondsInput").value || 0
  );


  if (!distance || distance <= 0) {
    alert("Enter a valid distance.");
    return;
  }


  const totalSeconds =
    (hours * 3600) +
    (minutes * 60) +
    seconds;


  if (totalSeconds <= 0) {
    alert("Enter a valid time.");
    return;
  }


  const totalHours =
    totalSeconds / 3600;


  // Speed = Distance / Time

  const speed =
    distance / totalHours;


  // Pace = Total Minutes / Distance

  const paceMinutes =
    (totalSeconds / 60) / distance;


  // Safety check for running

  if (
    selectedSport === "running" &&
    speed > 40
  ) {

    const continueLog =
      confirm(
        "Speed seems unusually high for running. Are you sure this is correct?"
      );

    if (!continueLog) return;
  }


  // Previous session comparison

  const previous =
    [...athleteData.activities]
      .reverse()
      .find(
        activity =>
          activity.sport === selectedSport
      );


  let improvement = null;

  if (previous && previous.speed > 0) {

    improvement =
      (
        (speed - previous.speed) /
        previous.speed
      ) * 100;
  }


  const activity = {
    id: Date.now(),

    sport: selectedSport,

    distance,

    totalSeconds,

    speed,

    paceMinutes,

    improvement,

    date: new Date()
      .toISOString()
      .split("T")[0],

    timestamp:
      new Date().toISOString()
  };


  athleteData.activities.push(activity);

  addXP(50);

  saveData();

  clearActivityInputs();

  renderActivityHistory();

  updateHomeStats();

  updateAnalytics();

  alert("Activity logged! +50 XP");
}


function clearActivityInputs() {

  [
    "distanceInput",
    "hoursInput",
    "minutesInput",
    "secondsInput"
  ].forEach(id => {

    document.getElementById(id).value = "";

  });
}


function formatPace(decimalMinutes) {

  if (!Number.isFinite(decimalMinutes)) {
    return "--";
  }

  const minutes =
    Math.floor(decimalMinutes);

  const seconds =
    Math.round(
      (decimalMinutes - minutes) * 60
    );

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}


function renderActivityHistory() {

  const container =
    document.getElementById("activityHistory");

  if (!container) return;

  const activities =
    [...athleteData.activities].reverse();


  if (activities.length === 0) {

    container.innerHTML = `
      <div class="history-item">
        <p>No sessions logged yet.</p>
      </div>
    `;

    return;
  }


  container.innerHTML =
    activities.slice(0, 10).map(activity => {

      const sportIcons = {
        running: "🏃",
        cycling: "🚴",
        swimming: "🏊"
      };

      let improvementText =
        "First recorded session";

      let improvementClass = "";


      if (
        activity.improvement !== null
      ) {

        const arrow =
          activity.improvement >= 0
            ? "▲"
            : "▼";

        improvementClass =
          activity.improvement >= 0
            ? "improvement-positive"
            : "improvement-negative";

        improvementText =
          `${arrow} ${Math.abs(
            activity.improvement
          ).toFixed(1)}% vs previous`;
      }


      return `
        <div class="history-item">

          <div>
            <h4>
              ${sportIcons[activity.sport]}
              ${activity.sport.toUpperCase()}
            </h4>

            <p>
              ${activity.distance.toFixed(2)} km
              • ${activity.speed.toFixed(1)} km/h
              • ${formatPace(activity.paceMinutes)} min/km
            </p>
          </div>

          <p class="${improvementClass}">
            ${improvementText}
          </p>

        </div>
      `;

    }).join("");
}


// ==========================================
// V-TAPER EXERCISES
// ==========================================

const exercises = [
  {
    name: "Assisted Pull-ups",
    cue: "Lead with your elbows and control the lowering phase.",
    target: "Lats"
  },
  {
    name: "Inverted Rows",
    cue: "Keep your body straight and pull your chest toward the bar.",
    target: "Lats"
  },
  {
    name: "Band Straight-Arm Pulldowns",
    cue: "Keep arms mostly straight and pull from the lats.",
    target: "Lats"
  },
  {
    name: "Pike Push-ups",
    cue: "Control your range and avoid collapsing through the shoulders.",
    target: "Shoulders"
  },
  {
    name: "Light Lateral Raises",
    cue: "Use light resistance and avoid swinging.",
    target: "Shoulders"
  },
  {
    name: "Y-T-W Raises",
    cue: "Move slowly and maintain shoulder control.",
    target: "Shoulder Stability"
  },
  {
    name: "Band Pull-Aparts",
    cue: "Keep ribs controlled and squeeze upper back.",
    target: "Shoulders"
  },
  {
    name: "Dead Hang",
    cue: "Keep shoulders comfortable and avoid pain.",
    target: "Grip & Stability"
  }
];


function renderExercises() {

  const container =
    document.getElementById("exerciseList");

  if (!container) return;

  container.innerHTML =
    exercises.map(exercise => `

      <article class="exercise-card">

        <small>${exercise.target}</small>

        <h3>${exercise.name}</h3>

        <p>${exercise.cue}</p>

      </article>

    `).join("");
}


// ==========================================
// STRENGTH LOGGER
// ==========================================

function logStrengthSet() {

  const exercise =
    document.getElementById("exerciseInput").value;

  const reps =
    Number(
      document.getElementById("strengthReps").value
    );

  const rpe =
    Number(
      document.getElementById("strengthRpe").value
    );

  const weight =
    Number(
      document.getElementById("strengthWeight").value || 0
    );


  if (!reps || reps <= 0) {
    alert("Enter reps.");
    return;
  }

  if (!rpe || rpe < 1 || rpe > 10) {
    alert("Enter RPE between 1 and 10.");
    return;
  }


  let feedback = "";


  // Youth volume guidance

  if (reps < 10) {
    feedback =
      "Consider controlled 10–15 rep work rather than heavy low-rep training.";
  }

  else if (rpe <= 7) {
    feedback =
      "Good controlled effort. If this remains easy across sessions, consider +1 rep.";
  }

  else if (rpe >= 9) {
    feedback =
      "High effort detected. Consider reducing difficulty and prioritizing form.";
  }

  else {
    feedback =
      "Good training zone. Maintain control and consistent technique.";
  }


  // Safety flag for isolation exercises

  const bodyWeight =
    athleteData.profile.weight;

  if (
    weight > bodyWeight * 0.7
  ) {

    feedback =
      "Safety flag: load is high relative to body weight. Recheck exercise selection and use qualified supervision.";
  }


  athleteData.strengthLogs.push({
    id: Date.now(),
    exercise,
    reps,
    rpe,
    weight,
    date: new Date()
      .toISOString()
      .split("T")[0]
  });


  addXP(15);

  saveData();

  document.getElementById(
    "strengthFeedback"
  ).textContent = feedback;

  document.getElementById(
    "strengthReps"
  ).value = "";

  document.getElementById(
    "strengthRpe"
  ).value = "";

  document.getElementById(
    "strengthWeight"
  ).value = "";

  renderStrengthHistory();

  updateAnalytics();
}


function renderStrengthHistory() {

  const container =
    document.getElementById("strengthHistory");

  if (!container) return;

  const logs =
    [...athleteData.strengthLogs]
      .reverse()
      .slice(0, 10);


  if (logs.length === 0) {

    container.innerHTML = `
      <div class="history-item">
        <p>No strength sets logged yet.</p>
      </div>
    `;

    return;
  }


  container.innerHTML =
    logs.map(log => `

      <div class="history-item">

        <div>
          <h4>💪 ${log.exercise}</h4>

          <p>
            ${log.reps} reps
            • RPE ${log.rpe}
            • ${log.weight || 0} kg
          </p>
        </div>

        <p>${log.date}</p>

      </div>

    `).join("");
}


// ==========================================
// RECOVERY
// ==========================================

function setRating(type, value) {

  athleteData.ratings[type] = value;

  const containerId =
    type === "quality"
      ? "qualityButtons"
      : "readinessButtons";

  const buttons =
    document
      .getElementById(containerId)
      .querySelectorAll("button");

  buttons.forEach(button => {

    button.classList.remove(
      "selected-rating"
    );

    if (
      Number(button.textContent) === value
    ) {
      button.classList.add(
        "selected-rating"
      );
    }

  });
}


function logRecovery() {

  const sleepHours =
    Number(
      document.getElementById("sleepHours").value
    );

  const quality =
    athleteData.ratings.quality;

  const readiness =
    athleteData.ratings.readiness;


  if (!sleepHours || sleepHours <= 0) {
    alert("Enter sleep hours.");
    return;
  }

  if (!quality || !readiness) {
    alert("Select sleep quality and morning readiness.");
    return;
  }


  athleteData.recovery = {
    sleepHours,
    quality,
    readiness,
    date: new Date()
      .toISOString()
      .split("T")[0]
  };


  // XP bonus for 8+ hours

  if (sleepHours >= 8) {
    addXP(20);
  }


  saveData();

  updateReadiness();

  updateHomeStats();

  updateFuelScore();

  alert(
    sleepHours >= 8
      ? "Recovery logged! +20 XP"
      : "Recovery logged!"
  );
}


function updateReadiness() {

  const recovery =
    athleteData.recovery;

  if (!recovery) return;


  // Score:
  // Sleep contributes 40 points
  // Quality contributes 30 points
  // Morning readiness contributes 30 points

  const sleepScore =
    Math.min(
      40,
      (recovery.sleepHours / 8) * 40
    );

  const qualityScore =
    (recovery.quality / 5) * 30;

  const readinessPart =
    (recovery.readiness / 5) * 30;

  const score =
    Math.round(
      sleepScore +
      qualityScore +
      readinessPart
    );


  const scoreElement =
    document.getElementById("readinessScore");

  scoreElement.textContent = score;


  const label =
    document.getElementById("readinessLabel");

  const message =
    document.getElementById("readinessMessage");


  if (
    recovery.sleepHours < 7 ||
    recovery.quality < 3
  ) {

    label.textContent =
      "RECOVERY DEFICIT";

    message.textContent =
      "Consider lighter training today. Sleep or recovery quality is below your preferred baseline.";

  } else if (score >= 80) {

    label.textContent =
      "READY TO TRAIN";

    message.textContent =
      "Recovery indicators look good. Continue prioritizing technique and controlled effort.";

  } else {

    label.textContent =
      "MODERATE READINESS";

    message.textContent =
      "Train intelligently and adjust intensity based on how you feel.";
  }


  const result =
    document.getElementById("recoveryResult");

  result.classList.remove("hidden");

  const deficit =
    recovery.sleepHours < 7 ||
    recovery.quality < 3;


  result.className =
    `result-card ${deficit ? "warning" : "good"}`;


  result.innerHTML = deficit
    ? `
      <h3>⚠️ Recovery Deficit</h3>
      <p>
        Sleep below 7 hours or low sleep quality can reduce recovery.
        Consider lighter strength work and prioritize rest.
      </p>
    `
    : `
      <h3>✓ Recovery Logged</h3>
      <p>
        Your recovery data has been saved. Continue monitoring how you feel across training sessions.
      </p>
    `;
}


// ==========================================
// NUTRITION
// ==========================================

function updateNutritionTargets() {

  if (!athleteData.profile) return;

  const weight =
    athleteData.profile.weight;


  const hydration =
    weight * 0.035;

  const proteinLow =
    weight * 1.6;

  const proteinHigh =
    weight * 2.0;


  document.getElementById(
    "hydrationTarget"
  ).textContent =
    `${hydration.toFixed(1)} L`;


  document.getElementById(
    "proteinTarget"
  ).textContent =
    `${Math.round(proteinLow)}–${Math.round(proteinHigh)} g`;
}


function logNutrition() {

  const water =
    Number(
      document.getElementById("waterInput").value || 0
    );

  const protein =
    Number(
      document.getElementById("proteinInput").value || 0
    );

  const calories =
    Number(
      document.getElementById("caloriesInput").value || 0
    );


  if (water < 0 || protein < 0) {
    alert("Enter valid nutrition values.");
    return;
  }


  athleteData.nutrition = {
    water,
    protein,
    calories,
    date: new Date()
      .toISOString()
      .split("T")[0]
  };


  const proteinGoal =
    athleteData.profile.weight * 1.6;


  // XP for reaching minimum protein target

  if (protein >= proteinGoal) {
    addXP(30);
  }


  saveData();

  updateNutritionTargets();

  updateHomeStats();

  updateFuelScore();

  alert(
    protein >= proteinGoal
      ? "Nutrition logged! Protein target achieved +30 XP"
      : "Nutrition logged!"
  );
}


function updateFuelScore() {

  const nutrition =
    athleteData.nutrition;

  if (!nutrition || !athleteData.profile) return;


  const hydrationTarget =
    athleteData.profile.weight * 0.035;

  const proteinTarget =
    athleteData.profile.weight * 1.6;


  const waterScore =
    Math.min(
      40,
      (nutrition.water / hydrationTarget) * 40
    );

  const proteinScore =
    Math.min(
      40,
      (nutrition.protein / proteinTarget) * 40
    );


  let sleepScore = 0;

  if (
    athleteData.recovery?.sleepHours
  ) {

    sleepScore =
      Math.min(
        20,
        (athleteData.recovery.sleepHours / 8) * 20
      );
  }


  const score =
    Math.round(
      waterScore +
      proteinScore +
      sleepScore
    );


  document.getElementById(
    "fuelScore"
  ).textContent = score;


  let message =
    "Keep building consistent nutrition habits.";


  if (score >= 80) {
    message =
      "Excellent recovery support today.";
  }

  else if (score >= 60) {
    message =
      "Good foundation. Improve hydration or protein for a higher score.";
  }


  document.getElementById(
    "fuelMessage"
  ).textContent =
    message;
}


// ==========================================
// ANALYTICS
// ==========================================

function updateAnalytics() {
  renderAnalytics();
}


function renderAnalytics() {

  if (!athleteData.profile) return;

  const activities =
    athleteData.activities;

  const strength =
    athleteData.strengthLogs;


  document.getElementById(
    "analyticsWorkouts"
  ).textContent =
    activities.length;


  document.getElementById(
    "analyticsStrength"
  ).textContent =
    strength.length;


  const averageSpeed =
    activities.length
      ? activities.reduce(
          (sum, activity) =>
            sum + activity.speed,
          0
        ) / activities.length
      : 0;


  document.getElementById(
    "analyticsSpeed"
  ).textContent =
    activities.length
      ? `${averageSpeed.toFixed(1)} km/h`
      : "--";


  document.getElementById(
    "analyticsLevel"
  ).textContent =
    getLevel().replace(
      " ATHLETE",
      ""
    );


  renderVolumeChart();

  renderPerformanceTrend();
}


function renderVolumeChart() {

  const container =
    document.getElementById("volumeChart");

  const sports = [
    "running",
    "cycling",
    "swimming"
  ];


  const volumes =
    sports.map(sport => {

      const totalSeconds =
        athleteData.activities
          .filter(
            activity =>
              activity.sport === sport
          )
          .reduce(
            (sum, activity) =>
              sum + activity.totalSeconds,
            0
          );

      return {
        sport,
        hours:
          totalSeconds / 3600
      };
    });


  const max =
    Math.max(
      ...volumes.map(
        item => item.hours
      ),
      1
    );


  container.innerHTML =
    volumes.map(item => {

      const percentage =
        (item.hours / max) * 100;

      return `
        <div class="bar-row">

          <span class="bar-label">
            ${item.sport.toUpperCase()}
          </span>

          <div class="bar-track">
            <div
              class="bar-fill"
              style="width:${percentage}%"
            ></div>
          </div>

          <span class="bar-value">
            ${item.hours.toFixed(1)}h
          </span>

        </div>
      `;

    }).join("");
}


function renderPerformanceTrend() {

  const container =
    document.getElementById(
      "performanceTrend"
    );

  const recent =
    [...athleteData.activities]
      .reverse()
      .slice(0, 6);


  if (!recent.length) {

    container.innerHTML = `
      <div class="history-item">
        <p>Log activities to see performance trends.</p>
      </div>
    `;

    return;
  }


  container.innerHTML =
    recent.map(activity => `

      <div class="history-item">

        <div>
          <h4>
            ${activity.sport.toUpperCase()}
          </h4>

          <p>
            ${activity.date}
          </p>
        </div>

        <strong class="improvement-positive">
          ${activity.speed.toFixed(1)} km/h
        </strong>

      </div>

    `).join("");
}


// ==========================================
// PROFILE
// ==========================================

function renderProfile() {

  if (!athleteData.profile) return;

  const xp =
    athleteData.xp;

  const level =
    getLevel();


  document.getElementById(
    "profileXp"
  ).textContent =
    `${xp} XP`;


  document.getElementById(
    "profileLevel"
  ).textContent =
    level;


  const levels = [
    0,
    200,
    500,
    1000,
    2000
  ];


  const next =
    levels.find(
      threshold =>
        threshold > xp
    ) || xp + 500;


  const previous =
    [...levels]
      .reverse()
      .find(
        threshold =>
          threshold <= xp
      ) || 0;


  const progress =
    ((xp - previous) /
      (next - previous)) * 100;


  document.getElementById(
    "xpProgress"
  ).style.width =
    `${Math.min(progress, 100)}%`;


  document.getElementById(
    "xpNext"
  ).textContent =
    next > xp
      ? `${next - xp} XP until next level`
      : "Elite development level achieved";
}


// ==========================================
// EXPORT BACKUP
// ==========================================

function exportData() {

  const backup = JSON.stringify(
    athleteData,
    null,
    2
  );


  const blob =
    new Blob(
      [backup],
      {
        type:
          "application/json"
      }
    );


  const url =
    URL.createObjectURL(blob);


  const link =
    document.createElement("a");


  link.href = url;

  link.download =
    "YouthAthleteOS-backup.json";


  link.click();

  URL.revokeObjectURL(url);
}


// ==========================================
// IMPORT BACKUP
// ==========================================

function importData(event) {

  const file =
    event.target.files[0];

  if (!file) return;


  const reader =
    new FileReader();


  reader.onload =
    function (loadEvent) {

      try {

        const imported =
          JSON.parse(
            loadEvent.target.result
          );


        athleteData = {
          ...structuredClone(defaultData),
          ...imported
        };


        saveData();

        updateAllUI();

        alert(
          "Backup imported successfully."
        );

      } catch (error) {

        alert(
          "Invalid backup file."
        );

      }

    };


  reader.readAsText(file);
}


// ==========================================
// RESET
// ==========================================

function resetAllData() {

  const confirmed =
    confirm(
      "This will permanently delete all athlete data stored in this browser. Continue?"
    );

  if (!confirmed) return;


  localStorage.removeItem(
    "youthAthleteOSData"
  );


  athleteData =
    structuredClone(defaultData);


  location.reload();
}


// ==========================================
// PWA SERVICE WORKER
// ==========================================

if ("serviceWorker" in navigator) {

  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register("./sw.js")
        .then(() => {
          console.log(
            "YouthAthleteOS offline system ready"
          );
        })
        .catch(error => {
          console.error(
            "Service Worker error:",
            error
          );
        });

    }
  );
}