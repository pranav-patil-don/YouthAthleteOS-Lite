// ==========================================
// YOUTHATHLETEOS
// STABLE APPLICATION LOGIC
// ==========================================


// ==========================================
// CONSTANTS
// ==========================================

const STORAGE_KEY = "youthAthleteOSData";

const XP_CAPS = {
  activity: 100,
  strength: 75,
  recovery: 100,
  nutrition: 50
};


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
  },

  xpDaily: {
    date: "",
    activity: 0,
    strength: 0,
    recovery: 0,
    nutrition: 0
  }
};


// ==========================================
// SAFE HELPERS
// ==========================================

function cloneDefaultData() {
  return JSON.parse(JSON.stringify(defaultData));
}


function getToday() {
  return new Date().toISOString().split("T")[0];
}


function isValidNumber(value, min = 0) {
  const number = Number(value);

  return (
    Number.isFinite(number) &&
    number >= min
  );
}


function safeNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}


function getInputValue(id) {
  const element = document.getElementById(id);

  return element
    ? element.value
    : "";
}


function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}


function hydrationTarget() {

  if (!athleteData.profile) {
    return 3;
  }

  const weight =
    safeNumber(
      athleteData.profile.weight,
      0
    );

  return Math.max(
    3,
    weight * 0.035
  );
}


function proteinTarget() {

  if (!athleteData.profile) {
    return 0;
  }

  const weight =
    safeNumber(
      athleteData.profile.weight,
      0
    );

  return weight * 1.2;
}


// ==========================================
// DATA SANITIZATION
// ==========================================

function sanitizeData(data) {

  const clean =
    cloneDefaultData();

  if (
    data &&
    typeof data === "object"
  ) {

    if (
      data.profile &&
      typeof data.profile === "object"
    ) {

      const name =
        typeof data.profile.name === "string"
          ? data.profile.name.trim()
          : "";

      const age =
        safeNumber(
          data.profile.age,
          0
        );

      const weight =
        safeNumber(
          data.profile.weight,
          0
        );

      if (
        name &&
        age >= 10 &&
        age <= 100 &&
        weight > 0
      ) {

        clean.profile = {
          name,
          age,
          weight,
          goal:
            data.profile.goal ||
            "general"
        };
      }
    }


    clean.xp = Math.max(
      0,
      safeNumber(data.xp, 0)
    );


    if (
      Array.isArray(data.activities)
    ) {

      clean.activities =
        data.activities.filter(activity => {

          return (
            activity &&
            typeof activity === "object" &&
            typeof activity.sport === "string" &&
            Number.isFinite(
              Number(activity.distance)
            ) &&
            Number(activity.distance) > 0 &&
            Number.isFinite(
              Number(activity.totalSeconds)
            ) &&
            Number(activity.totalSeconds) > 0
          );

        }).map(activity => ({

          id:
            activity.id ||
            Date.now() + Math.random(),

          sport:
            activity.sport,

          distance:
            Number(activity.distance),

          totalSeconds:
            Number(activity.totalSeconds),

          speed:
            safeNumber(
              activity.speed,
              0
            ),

          paceMinutes:
            safeNumber(
              activity.paceMinutes,
              0
            ),

          improvement:
            Number.isFinite(
              Number(activity.improvement)
            )
              ? Number(activity.improvement)
              : null,

          date:
            activity.date ||
            getToday(),

          timestamp:
            activity.timestamp ||
            new Date().toISOString()

        }));
    }


    if (
      Array.isArray(data.strengthLogs)
    ) {

      clean.strengthLogs =
        data.strengthLogs.filter(log => {

          return (
            log &&
            typeof log === "object" &&
            Number.isFinite(
              Number(log.reps)
            ) &&
            Number(log.reps) > 0 &&
            Number.isFinite(
              Number(log.rpe)
            ) &&
            Number(log.rpe) >= 1 &&
            Number(log.rpe) <= 10
          );

        }).map(log => ({

          id:
            log.id ||
            Date.now() + Math.random(),

          exercise:
            typeof log.exercise === "string"
              ? log.exercise
              : "Exercise",

          reps:
            Number(log.reps),

          rpe:
            Number(log.rpe),

          weight:
            Math.max(
              0,
              safeNumber(log.weight, 0)
            ),

          date:
            log.date ||
            getToday()

        }));
    }


    if (
      data.recovery &&
      typeof data.recovery === "object"
    ) {

      const sleepHours =
        safeNumber(
          data.recovery.sleepHours,
          0
        );

      const quality =
        safeNumber(
          data.recovery.quality,
          0
        );

      const readiness =
        safeNumber(
          data.recovery.readiness,
          0
        );

      if (
        sleepHours > 0 &&
        sleepHours <= 24 &&
        quality >= 1 &&
        quality <= 5 &&
        readiness >= 1 &&
        readiness <= 5
      ) {

        clean.recovery = {
          sleepHours,
          quality,
          readiness,
          date:
            data.recovery.date ||
            getToday()
        };
      }
    }


    if (
      data.nutrition &&
      typeof data.nutrition === "object"
    ) {

      clean.nutrition = {
        water:
          Math.max(
            0,
            safeNumber(
              data.nutrition.water,
              0
            )
          ),

        protein:
          Math.max(
            0,
            safeNumber(
              data.nutrition.protein,
              0
            )
          ),

        calories:
          Math.max(
            0,
            safeNumber(
              data.nutrition.calories,
              0
            )
          ),

        date:
          data.nutrition.date ||
          getToday()
      };
    }


    if (
      data.ratings &&
      typeof data.ratings === "object"
    ) {

      clean.ratings = {
        quality:
          Math.min(
            5,
            Math.max(
              0,
              safeNumber(
                data.ratings.quality,
                0
              )
            )
          ),

        readiness:
          Math.min(
            5,
            Math.max(
              0,
              safeNumber(
                data.ratings.readiness,
                0
              )
            )
          )
      };
    }


    if (
      data.xpDaily &&
      typeof data.xpDaily === "object"
    ) {

      clean.xpDaily = {
        date:
          typeof data.xpDaily.date === "string"
            ? data.xpDaily.date
            : "",

        activity:
          Math.max(
            0,
            safeNumber(
              data.xpDaily.activity,
              0
            )
          ),

        strength:
          Math.max(
            0,
            safeNumber(
              data.xpDaily.strength,
              0
            )
          ),

        recovery:
          Math.max(
            0,
            safeNumber(
              data.xpDaily.recovery,
              0
            )
          ),

        nutrition:
          Math.max(
            0,
            safeNumber(
              data.xpDaily.nutrition,
              0
            )
          )
      };
    }
  }

  return clean;
}


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

    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return cloneDefaultData();
    }

    const parsed =
      JSON.parse(saved);

    return sanitizeData(parsed);

  } catch (error) {

    console.error(
      "Storage load error:",
      error
    );

    return cloneDefaultData();
  }
}


function saveData() {

  try {

    const cleanData =
      sanitizeData(athleteData);

    athleteData =
      cleanData;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(athleteData)
    );

    return true;

  } catch (error) {

    console.error(
      "Storage save error:",
      error
    );

    return false;
  }
}


// ==========================================
// DAILY XP SYSTEM
// ==========================================

function resetDailyXPIfNeeded() {

  const today =
    getToday();

  if (!athleteData.xpDaily) {

    athleteData.xpDaily = {
      date: today,
      activity: 0,
      strength: 0,
      recovery: 0,
      nutrition: 0
    };

    return;
  }


  if (
    athleteData.xpDaily.date !== today
  ) {

    athleteData.xpDaily = {
      date: today,
      activity: 0,
      strength: 0,
      recovery: 0,
      nutrition: 0
    };
  }
}


function addCappedXP(category, amount) {

  resetDailyXPIfNeeded();

  const cap =
    XP_CAPS[category] || 0;

  const current =
    safeNumber(
      athleteData.xpDaily[category],
      0
    );

  const requested =
    Math.max(
      0,
      safeNumber(amount, 0)
    );

  const available =
    Math.max(
      0,
      cap - current
    );

  const awarded =
    Math.min(
      requested,
      available
    );


  if (awarded > 0) {

    athleteData.xp += awarded;

    athleteData.xpDaily[category] =
      current + awarded;

    saveData();

    updateXPUI();
  }

  return awarded;
}


// ==========================================
// INITIALIZATION
// ==========================================




function updateDate() {

  const dateElement =
    document.getElementById(
      "todayDate"
    );

  if (!dateElement) return;

  dateElement.textContent =
    new Date().toLocaleDateString(
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

  const name =
    getInputValue("nameInput").trim();

  const age =
    Number(
      getInputValue("ageInput")
    );

  const weight =
    Number(
      getInputValue("weightInput")
    );

  const goal =
    getInputValue("goalInput");

  const error =
    document.getElementById(
      "onboardingError"
    );

  if (error) {
    error.textContent = "";
  }


  if (!name) {

    if (error) {
      error.textContent =
        "Enter your athlete name.";
    }

    return;
  }


  if (
    !Number.isFinite(age) ||
    age < 10 ||
    age > 100
  ) {

    if (error) {
      error.textContent =
        "Enter a valid age.";
    }

    return;
  }


  if (
    !Number.isFinite(weight) ||
    weight <= 0 ||
    weight > 300
  ) {

    if (error) {
      error.textContent =
        "Enter a valid weight.";
    }

    return;
  }


  athleteData.profile = {
    name,
    age,
    weight,
    goal: goal || "general"
  };

  saveData();

  openApp();
}


function openApp() {

  const onboarding =
    document.getElementById(
      "onboarding"
    );

  const app =
    document.getElementById("app");


  if (onboarding) {
    onboarding.classList.add("hidden");
  }

  if (app) {
    app.classList.remove("hidden");
  }

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

      button.classList.remove(
        "active-nav"
      );

      if (
        button.dataset.tab === tabName
      ) {
        button.classList.add(
          "active-nav"
        );
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
// LEVEL SYSTEM
// ==========================================

function getLevel() {

  const xp =
    safeNumber(
      athleteData.xp,
      0
    );

  if (xp >= 2000) {
    return "ELITE ATHLETE";
  }

  if (xp >= 1000) {
    return "ADVANCED ATHLETE";
  }

  if (xp >= 500) {
    return "RISING STAR";
  }

  if (xp >= 200) {
    return "DEVELOPING ATHLETE";
  }

  return "NOVICE ATHLETE";
}


function updateXPUI() {

  const level =
    getLevel();

  const badge =
    document.getElementById(
      "levelBadge"
    );

  const xpDisplay =
    document.getElementById(
      "xpDisplay"
    );

  const homeXp =
    document.getElementById(
      "homeXp"
    );

  if (badge) {
    badge.textContent =
      level.replace(
        " ATHLETE",
        ""
      );
  }

  if (xpDisplay) {
    xpDisplay.textContent =
      `${Math.round(
        athleteData.xp
      )} XP`;
  }

  if (homeXp) {
    homeXp.textContent =
      `${Math.round(
        athleteData.xp
      )} XP`;
  }
}


// ==========================================
// DASHBOARD UPDATE
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

  const profile =
    athleteData.profile;

  setText(
    "athleteName",
    profile.name
  );

  setText(
    "profileName",
    profile.name
  );

  setText(
    "profileInitial",
    profile.name
      .charAt(0)
      .toUpperCase()
  );

  setText(
    "profileDetails",
    `${profile.age} years • ${profile.weight} kg`
  );

  setText(
    "profileLevel",
    getLevel()
  );
}


function updateHomeStats() {

  const nutrition =
    athleteData.nutrition;

  const recovery =
    athleteData.recovery;

  const target =
    hydrationTarget();

  const water =
    Math.max(
      0,
      safeNumber(
        nutrition?.water,
        0
      )
    );

  const percentage =
    target > 0
      ? Math.min(
          100,
          Math.round(
            (water / target) * 100
          )
        )
      : 0;


  setText(
    "waterProgress",
    `${percentage}%`
  );


  if (recovery) {

    setText(
      "homeSleep",
      `${recovery.sleepHours}h`
    );

    setText(
      "homeReadiness",
      `${recovery.readiness}/5`
    );

  } else {

    setText(
      "homeSleep",
      "Not logged"
    );

    setText(
      "homeReadiness",
      "Not logged"
    );
  }


  setText(
    "homeProtein",
    nutrition
      ? `${Math.round(
          safeNumber(
            nutrition.protein,
            0
          )
        )}g`
      : "0g"
  );


  setText(
    "streakValue",
    calculateStreak()
  );
}


function calculateStreak() {

  const activities =
    Array.isArray(
      athleteData.activities
    )
      ? athleteData.activities
      : [];

  if (!activities.length) {
    return "0 DAYS";
  }

  const dates = new Set(
    activities
      .map(item => item.date)
      .filter(Boolean)
  );

  return `${dates.size} DAYS`;
}
// ==========================================
// TODAY WORKOUT
// ==========================================

function updateTodayWorkout() {

  const container =
    document.getElementById("todayWorkout");

  if (!container || !athleteData.profile) return;

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

  const allowedSports = [
    "running",
    "cycling",
    "swimming"
  ];

  if (!allowedSports.includes(sport)) {
    return;
  }

  selectedSport = sport;

  document
    .querySelectorAll(".sport-btn")
    .forEach(button => {

      button.classList.remove(
        "active-sport"
      );

      if (
        button.dataset.sport === sport
      ) {
        button.classList.add(
          "active-sport"
        );
      }

    });


  const titles = {
    running: "🏃 RUNNING SESSION",
    cycling: "🚴 CYCLING SESSION",
    swimming: "🏊 SWIMMING SESSION"
  };

  setText(
    "selectedSportTitle",
    titles[sport]
  );
}


// ==========================================
// DUPLICATE ACTIVITY PROTECTION
// ==========================================

function isDuplicateActivity(
  sport,
  distance,
  totalSeconds
) {

  const now =
    Date.now();

  const recentActivities =
    athleteData.activities.filter(
      activity => {

        const timestamp =
          new Date(
            activity.timestamp
          ).getTime();

        return (
          now - timestamp <
          60 * 1000
        );
      }
    );


  return recentActivities.some(
    activity => {

      const sameSport =
        activity.sport === sport;

      const sameDistance =
        Math.abs(
          Number(activity.distance) -
          distance
        ) < 0.01;

      const sameDuration =
        Math.abs(
          Number(activity.totalSeconds) -
          totalSeconds
        ) < 5;

      return (
        sameSport &&
        sameDistance &&
        sameDuration
      );
    }
  );
}


// ==========================================
// LOG ACTIVITY
// ==========================================

function logActivity() {

  const distance =
    Number(
      getInputValue(
        "distanceInput"
      )
    );

  const hours =
    Number(
      getInputValue(
        "hoursInput"
      ) || 0
    );

  const minutes =
    Number(
      getInputValue(
        "minutesInput"
      ) || 0
    );

  const seconds =
    Number(
      getInputValue(
        "secondsInput"
      ) || 0
    );


  // Distance validation
  if (
    !Number.isFinite(distance) ||
    distance <= 0 ||
    distance > 1000
  ) {

    alert(
      "Please enter a valid distance greater than 0."
    );

    return;
  }


  // Time validation
  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    !Number.isFinite(seconds) ||
    hours < 0 ||
    minutes < 0 ||
    seconds < 0 ||
    minutes >= 60 ||
    seconds >= 60
  ) {

    alert(
      "Please enter a valid duration."
    );

    return;
  }


  const totalSeconds =
    (hours * 3600) +
    (minutes * 60) +
    seconds;


  // Prevent division by zero
  if (
    !Number.isFinite(totalSeconds) ||
    totalSeconds <= 0
  ) {

    alert(
      "Duration must be greater than 0."
    );

    return;
  }


  const totalMinutes =
    totalSeconds / 60;


  // Safe speed calculation
  const speed =
    totalSeconds > 0
      ? distance /
        (totalSeconds / 3600)
      : 0;


  // Safe pace calculation
  const paceMinutes =
    distance > 0
      ? totalMinutes / distance
      : 0;


  // Final calculation validation
  if (
    !Number.isFinite(speed) ||
    !Number.isFinite(paceMinutes) ||
    speed <= 0 ||
    paceMinutes <= 0
  ) {

    alert(
      "Unable to calculate pace or speed. Please check your inputs."
    );

    return;
  }


  // Sport-specific sanity checks
  const speedLimits = {
    running: 35,
    cycling: 100,
    swimming: 15
  };


  if (
    speed >
    speedLimits[selectedSport]
  ) {

    const continueLog =
      confirm(
        `Calculated speed is ${speed.toFixed(1)} km/h, which seems unusually high for ${selectedSport}. Are you sure your inputs are correct?`
      );

    if (!continueLog) {
      return;
    }
  }


  // Duplicate protection
  if (
    isDuplicateActivity(
      selectedSport,
      distance,
      totalSeconds
    )
  ) {

    alert(
      "This looks like a duplicate activity logged within the last minute."
    );

    return;
  }


  // Find previous session of same sport
  const previous =
    [...athleteData.activities]
      .reverse()
      .find(
        activity =>
          activity.sport ===
          selectedSport
      );


  let improvement = null;


  if (
    previous &&
    Number.isFinite(
      Number(previous.speed)
    ) &&
    Number(previous.speed) > 0
  ) {

    improvement =
      (
        (speed -
          Number(previous.speed)) /
        Number(previous.speed)
      ) * 100;


    if (
      !Number.isFinite(
        improvement
      )
    ) {
      improvement = null;
    }
  }


  const activity = {
    id: Date.now(),

    sport: selectedSport,

    distance:
      Number(
        distance.toFixed(2)
      ),

    totalSeconds:
      Math.round(
        totalSeconds
      ),

    speed:
      Number(
        speed.toFixed(2)
      ),

    paceMinutes:
      Number(
        paceMinutes.toFixed(3)
      ),

    improvement,

    date:
      getToday(),

    timestamp:
      new Date().toISOString()
  };


  athleteData.activities.push(
    activity
  );


  // Maximum 100 XP/day for activities
  const earnedXP =
    addCappedXP(
      "activity",
      50
    );


  saveData();

  clearActivityInputs();

  renderActivityHistory();

  updateHomeStats();

  renderAnalytics();


  if (earnedXP > 0) {

    alert(
      `Activity logged successfully! +${earnedXP} XP`
    );

  } else {

    alert(
      "Activity logged successfully! Daily activity XP cap reached."
    );
  }
}


// ==========================================
// CLEAR ACTIVITY FORM
// ==========================================

function clearActivityInputs() {

  const fields = [
    "distanceInput",
    "hoursInput",
    "minutesInput",
    "secondsInput"
  ];

  fields.forEach(id => {

    const element =
      document.getElementById(id);

    if (element) {
      element.value = "";
    }

  });
}


// ==========================================
// SAFE PACE FORMATTER
// ==========================================

function formatPace(decimalMinutes) {

  const pace =
    Number(decimalMinutes);

  if (
    !Number.isFinite(pace) ||
    pace <= 0
  ) {
    return "--";
  }


  const minutes =
    Math.floor(pace);

  let seconds =
    Math.round(
      (pace - minutes) * 60
    );


  let finalMinutes =
    minutes;


  // Handle 60-second rounding
  if (seconds >= 60) {
    finalMinutes += 1;
    seconds = 0;
  }


  return `${finalMinutes}:${String(
    seconds
  ).padStart(2, "0")}`;
}


// ==========================================
// ACTIVITY HISTORY
// ==========================================

function renderActivityHistory() {

  const container =
    document.getElementById(
      "activityHistory"
    );

  if (!container) return;


  const activities =
    Array.isArray(
      athleteData.activities
    )
      ? [...athleteData.activities]
          .reverse()
      : [];


  if (activities.length === 0) {

    container.innerHTML = `
      <div class="history-item">
        <p>No sessions logged yet.</p>
      </div>
    `;

    return;
  }


  const sportIcons = {
    running: "🏃",
    cycling: "🚴",
    swimming: "🏊"
  };


  container.innerHTML =
    activities
      .slice(0, 10)
      .map(activity => {

        const distance =
          safeNumber(
            activity.distance,
            0
          );

        const speed =
          safeNumber(
            activity.speed,
            0
          );

        const pace =
          safeNumber(
            activity.paceMinutes,
            0
          );


        let improvementText =
          "First recorded session";

        let improvementClass = "";


        if (
          activity.improvement !== null &&
          Number.isFinite(
            Number(
              activity.improvement
            )
          )
        ) {

          const improvement =
            Number(
              activity.improvement
            );

          const arrow =
            improvement >= 0
              ? "▲"
              : "▼";

          improvementClass =
            improvement >= 0
              ? "improvement-positive"
              : "improvement-negative";

          improvementText =
            `${arrow} ${Math.abs(
              improvement
            ).toFixed(1)}% vs previous`;
        }


        return `
          <div class="history-item">

            <div>

              <h4>
                ${sportIcons[
                  activity.sport
                ] || "🏅"}
                ${String(
                  activity.sport || "activity"
                ).toUpperCase()}
              </h4>

              <p>
                ${distance.toFixed(2)} km
                • ${speed.toFixed(1)} km/h
                • ${formatPace(pace)} min/km
              </p>

            </div>

            <p class="${improvementClass}">
              ${improvementText}
            </p>

          </div>
        `;
      })
      .join("");
}


// ==========================================
// V-TAPER EXERCISES
// ==========================================

const exercises = [
  {
    name: "Assisted Pull-ups",
    cue:
      "Lead with your elbows and control the lowering phase.",
    target: "Lats"
  },
  {
    name: "Inverted Rows",
    cue:
      "Keep your body straight and pull your chest toward the bar.",
    target: "Lats"
  },
  {
    name: "Band Straight-Arm Pulldowns",
    cue:
      "Keep arms mostly straight and pull from the lats.",
    target: "Lats"
  },
  {
    name: "Pike Push-ups",
    cue:
      "Control your range and avoid collapsing through the shoulders.",
    target: "Shoulders"
  },
  {
    name: "Light Lateral Raises",
    cue:
      "Use light resistance and avoid swinging.",
    target: "Shoulders"
  },
  {
    name: "Y-T-W Raises",
    cue:
      "Move slowly and maintain shoulder control.",
    target: "Shoulder Stability"
  },
  {
    name: "Band Pull-Aparts",
    cue:
      "Keep ribs controlled and squeeze upper back.",
    target: "Shoulders"
  },
  {
    name: "Dead Hang",
    cue:
      "Keep shoulders comfortable and avoid pain.",
    target: "Grip & Stability"
  }
];


function renderExercises() {

  const container =
    document.getElementById(
      "exerciseList"
    );

  if (!container) return;


  container.innerHTML =
    exercises
      .map(exercise => `

        <article class="exercise-card">

          <small>
            ${exercise.target}
          </small>

          <h3>
            ${exercise.name}
          </h3>

          <p>
            ${exercise.cue}
          </p>

        </article>

      `)
      .join("");
}


// ==========================================
// STRENGTH LOGGER
// ==========================================

function logStrengthSet() {

  const exercise =
    getInputValue(
      "exerciseInput"
    ).trim();

  const reps =
    Number(
      getInputValue(
        "strengthReps"
      )
    );

  const rpe =
    Number(
      getInputValue(
        "strengthRpe"
      )
    );

  const weight =
    Number(
      getInputValue(
        "strengthWeight"
      ) || 0
    );


  if (!exercise) {

    alert(
      "Please select or enter an exercise."
    );

    return;
  }


  if (
    !Number.isFinite(reps) ||
    reps <= 0 ||
    reps > 100
  ) {

    alert(
      "Enter valid reps between 1 and 100."
    );

    return;
  }


  if (
    !Number.isFinite(rpe) ||
    rpe < 1 ||
    rpe > 10
  ) {

    alert(
      "Enter RPE between 1 and 10."
    );

    return;
  }


  if (
    !Number.isFinite(weight) ||
    weight < 0 ||
    weight > 500
  ) {

    alert(
      "Enter a valid training weight."
    );

    return;
  }


  // Prevent immediate duplicate sets
  const recentDuplicate =
    athleteData.strengthLogs.some(
      log => {

        return (
          log.exercise === exercise &&
          Number(log.reps) === reps &&
          Number(log.rpe) === rpe &&
          Number(log.weight) === weight &&
          log.date === getToday()
        );
      }
    );


  if (recentDuplicate) {

    const continueLog =
      confirm(
        "A matching strength set already exists today. Log another identical set?"
      );

    if (!continueLog) {
      return;
    }
  }


  let feedback = "";


  if (reps < 10) {

    feedback =
      "Consider controlled 10–15 rep work rather than heavy low-rep training.";

  } else if (rpe <= 7) {

    feedback =
      "Good controlled effort. If this remains easy across sessions, consider +1 rep.";

  } else if (rpe >= 9) {

    feedback =
      "High effort detected. Consider reducing difficulty and prioritizing form.";

  } else {

    feedback =
      "Good training zone. Maintain control and consistent technique.";
  }


  const bodyWeight =
    safeNumber(
      athleteData.profile?.weight,
      0
    );


  if (
    bodyWeight > 0 &&
    weight > bodyWeight * 1.5
  ) {

    feedback =
      "Safety flag: load is unusually high relative to body weight. Recheck the value and prioritize qualified supervision.";
  }


  athleteData.strengthLogs.push({
    id: Date.now(),

    exercise,

    reps,

    rpe,

    weight,

    date:
      getToday()
  });


  const earnedXP =
    addCappedXP(
      "strength",
      15
    );


  saveData();


  setText(
    "strengthFeedback",
    feedback
  );


  [
    "strengthReps",
    "strengthRpe",
    "strengthWeight"
  ].forEach(id => {

    const element =
      document.getElementById(id);

    if (element) {
      element.value = "";
    }

  });


  renderStrengthHistory();

  renderAnalytics();


  if (earnedXP > 0) {

    console.log(
      `Strength logged: +${earnedXP} XP`
    );
  }
}


// ==========================================
// STRENGTH HISTORY
// ==========================================

function renderStrengthHistory() {

  const container =
    document.getElementById(
      "strengthHistory"
    );

  if (!container) return;


  const logs =
    Array.isArray(
      athleteData.strengthLogs
    )
      ? [...athleteData.strengthLogs]
          .reverse()
          .slice(0, 10)
      : [];


  if (!logs.length) {

    container.innerHTML = `
      <div class="history-item">
        <p>No strength sets logged yet.</p>
      </div>
    `;

    return;
  }


  container.innerHTML =
    logs.map(log => {

      const reps =
        safeNumber(
          log.reps,
          0
        );

      const rpe =
        safeNumber(
          log.rpe,
          0
        );

      const weight =
        safeNumber(
          log.weight,
          0
        );


      return `
        <div class="history-item">

          <div>

            <h4>
              💪 ${log.exercise}
            </h4>

            <p>
              ${reps} reps
              • RPE ${rpe}
              • ${weight} kg
            </p>

          </div>

          <p>
            ${log.date || "--"}
          </p>

        </div>
      `;
    })
    .join("");
}
// ==========================================
// RECOVERY SYSTEM
// ==========================================

function logRecovery() {

  const sleepHours =
    Number(
      getInputValue("sleepHours")
    );

  const quality =
    Number(
      getInputValue("sleepQuality")
    );

  const readiness =
    Number(
      getInputValue("readiness")
    );


  // VALIDATION
  if (
    !Number.isFinite(sleepHours) ||
    sleepHours <= 0 ||
    sleepHours > 24
  ) {

    alert(
      "Please enter valid sleep hours between 0.1 and 24."
    );

    return;
  }


  if (
    !Number.isFinite(quality) ||
    quality < 1 ||
    quality > 5
  ) {

    alert(
      "Please select a sleep quality between 1 and 5."
    );

    return;
  }


  if (
    !Number.isFinite(readiness) ||
    readiness < 1 ||
    readiness > 5
  ) {

    alert(
      "Please select a readiness score between 1 and 5."
    );

    return;
  }


  athleteData.recovery = {
    sleepHours:
      Number(
        sleepHours.toFixed(1)
      ),

    quality,

    readiness,

    date:
      getToday()
  };


  athleteData.ratings = {
    quality,
    readiness
  };


  // XP BASED ON RECOVERY QUALITY
  let xpAmount = 20;

  if (sleepHours >= 8) {
    xpAmount += 10;
  }

  if (quality >= 4) {
    xpAmount += 10;
  }

  if (readiness >= 4) {
    xpAmount += 10;
  }


  // Maximum recovery XP is controlled
  // by XP_CAPS.recovery
  const earnedXP =
    addCappedXP(
      "recovery",
      xpAmount
    );


  saveData();

  updateReadiness();

  updateHomeStats();

  renderAnalytics();


  if (earnedXP > 0) {

    alert(
      `Recovery logged! +${earnedXP} XP`
    );

  } else {

    alert(
      "Recovery logged successfully. Daily recovery XP cap reached."
    );
  }
}


// ==========================================
// RECOVERY UI
// ==========================================

function updateReadiness() {

  const recovery =
    athleteData.recovery;


  const scoreElement =
    document.getElementById(
      "readinessScore"
    );

  const textElement =
    document.getElementById(
      "readinessText"
    );

  const sleepElement =
    document.getElementById(
      "sleepDisplay"
    );

  const qualityElement =
    document.getElementById(
      "qualityDisplay"
    );


  if (!recovery) {

    setText(
      "readinessScore",
      "--"
    );

    setText(
      "readinessText",
      "Log recovery to calculate readiness."
    );

    setText(
      "sleepDisplay",
      "--"
    );

    setText(
      "qualityDisplay",
      "--"
    );

    return;
  }


  const sleep =
    safeNumber(
      recovery.sleepHours,
      0
    );

  const quality =
    safeNumber(
      recovery.quality,
      0
    );

  const readiness =
    safeNumber(
      recovery.readiness,
      0
    );


  // Balanced readiness score
  const sleepScore =
    Math.min(
      100,
      Math.max(
        0,
        (sleep / 8) * 100
      )
    );

  const qualityScore =
    (quality / 5) * 100;

  const readinessScore =
    (readiness / 5) * 100;


  const finalScore =
    Math.round(
      (
        sleepScore * 0.4 +
        qualityScore * 0.3 +
        readinessScore * 0.3
      )
    );


  let readinessText;


  if (finalScore >= 85) {

    readinessText =
      "Excellent recovery. You appear ready for quality training.";

  } else if (finalScore >= 70) {

    readinessText =
      "Good recovery. Train normally while monitoring fatigue.";

  } else if (finalScore >= 50) {

    readinessText =
      "Moderate recovery. Consider keeping intensity controlled.";

  } else {

    readinessText =
      "Low recovery. Prioritize rest, sleep and easy movement.";
  }


  setText(
    "readinessScore",
    `${finalScore}%`
  );

  setText(
    "readinessText",
    readinessText
  );

  setText(
    "sleepDisplay",
    `${sleep.toFixed(1)}h`
  );

  setText(
    "qualityDisplay",
    `${quality}/5`
  );
}


// ==========================================
// NUTRITION SYSTEM
// ==========================================

function logNutrition() {

  if (!athleteData.profile) {

    alert(
      "Please complete your athlete profile first."
    );

    return;
  }


  const water =
    Number(
      getInputValue(
        "waterInput"
      ) || 0
    );

  const protein =
    Number(
      getInputValue(
        "proteinInput"
      ) || 0
    );

  const calories =
    Number(
      getInputValue(
        "caloriesInput"
      ) || 0
    );


  // VALIDATION

  if (
    !Number.isFinite(water) ||
    water < 0 ||
    water > 20
  ) {

    alert(
      "Please enter a valid water intake."
    );

    return;
  }


  if (
    !Number.isFinite(protein) ||
    protein < 0 ||
    protein > 1000
  ) {

    alert(
      "Please enter a valid protein intake."
    );

    return;
  }


  if (
    !Number.isFinite(calories) ||
    calories < 0 ||
    calories > 15000
  ) {

    alert(
      "Please enter valid calories."
    );

    return;
  }


  // Prevent completely empty logging
  if (
    water === 0 &&
    protein === 0 &&
    calories === 0
  ) {

    alert(
      "Enter at least one nutrition value."
    );

    return;
  }


  athleteData.nutrition = {
    water:
      Number(
        water.toFixed(2)
      ),

    protein:
      Number(
        protein.toFixed(1)
      ),

    calories:
      Math.round(calories),

    date:
      getToday()
  };


  const waterTarget =
    hydrationTarget();

  const proteinNeeded =
    proteinTarget();


  // Calculate nutrition XP
  let nutritionXP = 10;


  if (
    waterTarget > 0 &&
    water >= waterTarget
  ) {
    nutritionXP += 10;
  }


  if (
    proteinNeeded > 0 &&
    protein >= proteinNeeded
  ) {
    nutritionXP += 15;
  }


  if (calories > 0) {
    nutritionXP += 5;
  }


  // Maximum nutrition XP controlled
  // by XP_CAPS.nutrition
  const earnedXP =
    addCappedXP(
      "nutrition",
      nutritionXP
    );


  saveData();

  updateNutritionTargets();

  updateFuelScore();

  updateHomeStats();


  // Clear fields
  [
    "waterInput",
    "proteinInput",
    "caloriesInput"
  ].forEach(id => {

    const element =
      document.getElementById(id);

    if (element) {
      element.value = "";
    }

  });


  if (earnedXP > 0) {

    alert(
      `Nutrition logged! +${earnedXP} XP`
    );

  } else {

    alert(
      "Nutrition logged successfully. Daily nutrition XP cap reached."
    );
  }
}


// ==========================================
// NUTRITION TARGETS
// ==========================================

function updateNutritionTargets() {

  if (!athleteData.profile) return;


  const hydration =
    hydrationTarget();

  const protein =
    proteinTarget();


  const hydrationElement =
    document.getElementById(
      "hydrationTarget"
    );

  const proteinElement =
    document.getElementById(
      "proteinTarget"
    );


  if (hydrationElement) {

    hydrationElement.textContent =
      `${hydration.toFixed(1)} L/day`;
  }


  if (proteinElement) {

    proteinElement.textContent =
      `${Math.round(protein)} g/day`;
  }


  // Update secondary target elements if present
  setText(
    "hydrationNeed",
    `${hydration.toFixed(1)} L`
  );

  setText(
    "proteinNeed",
    `${Math.round(protein)} g`
  );


  updateNutritionProgress();
}


// ==========================================
// NUTRITION PROGRESS
// ==========================================

function updateNutritionProgress() {

  const nutrition =
    athleteData.nutrition;

  const waterTarget =
    hydrationTarget();

  const proteinNeeded =
    proteinTarget();


  const water =
    nutrition
      ? Math.max(
          0,
          safeNumber(
            nutrition.water,
            0
          )
        )
      : 0;


  const protein =
    nutrition
      ? Math.max(
          0,
          safeNumber(
            nutrition.protein,
            0
          )
        )
      : 0;


  const waterPercentage =
    waterTarget > 0
      ? Math.min(
          100,
          Math.round(
            (water / waterTarget) *
            100
          )
        )
      : 0;


  const proteinPercentage =
    proteinNeeded > 0
      ? Math.min(
          100,
          Math.round(
            (protein / proteinNeeded) *
            100
          )
        )
      : 0;


  setText(
    "waterValue",
    `${water.toFixed(1)} L`
  );

  setText(
    "proteinValue",
    `${Math.round(protein)} g`
  );


  setText(
    "waterPercentage",
    `${waterPercentage}%`
  );

  setText(
    "proteinPercentage",
    `${proteinPercentage}%`
  );


  const waterBar =
    document.getElementById(
      "waterProgressBar"
    );

  const proteinBar =
    document.getElementById(
      "proteinProgressBar"
    );


  if (waterBar) {

    waterBar.style.width =
      `${waterPercentage}%`;
  }


  if (proteinBar) {

    proteinBar.style.width =
      `${proteinPercentage}%`;
  }
}


// ==========================================
// FUEL SCORE
// ==========================================

function updateFuelScore() {

  const nutrition =
    athleteData.nutrition;


  const scoreElement =
    document.getElementById(
      "fuelScore"
    );

  const textElement =
    document.getElementById(
      "fuelScoreText"
    );


  if (!nutrition) {

    setText(
      "fuelScore",
      "--"
    );

    setText(
      "fuelScoreText",
      "Log nutrition to calculate your fuel score."
    );

    return;
  }


  const water =
    Math.max(
      0,
      safeNumber(
        nutrition.water,
        0
      )
    );

  const protein =
    Math.max(
      0,
      safeNumber(
        nutrition.protein,
        0
      )
    );


  const waterTarget =
    hydrationTarget();

  const proteinNeeded =
    proteinTarget();


  // Safe percentage calculations
  const waterScore =
    waterTarget > 0
      ? Math.min(
          100,
          (water / waterTarget) * 100
        )
      : 0;


  const proteinScore =
    proteinNeeded > 0
      ? Math.min(
          100,
          (protein / proteinNeeded) * 100
        )
      : 0;


  // Fuel score
  const fuelScore =
    Math.round(
      (
        waterScore * 0.5 +
        proteinScore * 0.5
      )
    );


  let fuelText;


  if (fuelScore >= 90) {

    fuelText =
      "Excellent nutrition coverage for today's targets.";

  } else if (fuelScore >= 70) {

    fuelText =
      "Good progress. Continue working toward your targets.";

  } else if (fuelScore >= 40) {

    fuelText =
      "Moderate nutrition progress. Prioritize hydration and protein.";

  } else {

    fuelText =
      "Low fuel coverage. Start by improving hydration and balanced meals.";
  }


  setText(
    "fuelScore",
    `${fuelScore}%`
  );

  setText(
    "fuelScoreText",
    fuelText
  );


  updateNutritionProgress();
}


// ==========================================
// HYDRATION HELPER
// ==========================================

function getHydrationStatus() {

  const nutrition =
    athleteData.nutrition;

  const consumed =
    Math.max(
      0,
      safeNumber(
        nutrition?.water,
        0
      )
    );

  const target =
    hydrationTarget();


  if (target <= 0) {
    return "No target available";
  }


  const percentage =
    (consumed / target) * 100;


  if (percentage >= 100) {
    return "Hydration target achieved";
  }

  if (percentage >= 75) {
    return "Almost at hydration target";
  }

  if (percentage >= 50) {
    return "Keep drinking water";
  }

  return "Hydration needs attention";
}


// ==========================================
// PROTEIN HELPER
// ==========================================

function getProteinStatus() {

  const nutrition =
    athleteData.nutrition;

  const consumed =
    Math.max(
      0,
      safeNumber(
        nutrition?.protein,
        0
      )
    );

  const target =
    proteinTarget();


  if (target <= 0) {
    return "No target available";
  }


  const percentage =
    (consumed / target) * 100;


  if (percentage >= 100) {
    return "Protein target achieved";
  }

  if (percentage >= 75) {
    return "Close to protein target";
  }

  if (percentage >= 50) {
    return "Increase protein intake gradually";
  }

  return "Protein intake needs attention";
}
// ==========================================
// ANALYTICS
// ==========================================

function renderAnalytics() {

  const activities =
    Array.isArray(athleteData.activities)
      ? athleteData.activities
      : [];

  const strengthLogs =
    Array.isArray(athleteData.strengthLogs)
      ? athleteData.strengthLogs
      : [];


  // ------------------------------
  // TOTAL ACTIVITIES
  // ------------------------------

  const totalSessions =
    activities.length;

  setText(
    "totalSessions",
    totalSessions
  );


  // ------------------------------
  // TOTAL DISTANCE
  // ------------------------------

  const totalDistance =
    activities.reduce(
      (total, activity) => {

        const distance =
          safeNumber(
            activity.distance,
            0
          );

        return total + distance;

      },
      0
    );


  setText(
    "totalDistance",
    `${totalDistance.toFixed(1)} km`
  );


  // ------------------------------
  // TOTAL TRAINING TIME
  // ------------------------------

  const totalSeconds =
    activities.reduce(
      (total, activity) => {

        return (
          total +
          safeNumber(
            activity.totalSeconds,
            0
          )
        );

      },
      0
    );


  const totalHours =
    totalSeconds / 3600;


  setText(
    "totalTrainingTime",
    `${totalHours.toFixed(1)} h`
  );


  // ------------------------------
  // AVERAGE SPEED
  // ------------------------------

  const validSpeeds =
    activities
      .map(activity =>
        safeNumber(
          activity.speed,
          0
        )
      )
      .filter(
        speed => speed > 0
      );


  const averageSpeed =
    validSpeeds.length > 0
      ? validSpeeds.reduce(
          (total, speed) =>
            total + speed,
          0
        ) / validSpeeds.length
      : 0;


  setText(
    "averageSpeed",
    `${averageSpeed.toFixed(1)} km/h`
  );


  // ------------------------------
  // STRENGTH VOLUME
  // ------------------------------

  const strengthVolume =
    strengthLogs.reduce(
      (total, log) => {

        const reps =
          safeNumber(
            log.reps,
            0
          );

        const weight =
          safeNumber(
            log.weight,
            0
          );

        return total + (
          reps * weight
        );

      },
      0
    );


  setText(
    "strengthVolume",
    `${Math.round(
      strengthVolume
    )} kg`
  );


  // ------------------------------
  // SPORT BREAKDOWN
  // ------------------------------

  renderSportBreakdown(
    activities
  );


  // ------------------------------
  // PERFORMANCE INSIGHT
  // ------------------------------

  renderPerformanceInsight(
    activities,
    strengthLogs
  );
}


// ==========================================
// SPORT BREAKDOWN
// ==========================================

function renderSportBreakdown(
  activities
) {

  const container =
    document.getElementById(
      "sportBreakdown"
    );

  if (!container) return;


  const sports = [
    "running",
    "cycling",
    "swimming"
  ];


  const sportIcons = {
    running: "🏃",
    cycling: "🚴",
    swimming: "🏊"
  };


  const breakdown =
    sports.map(sport => {

      const sportActivities =
        activities.filter(
          activity =>
            activity.sport === sport
        );


      const distance =
        sportActivities.reduce(
          (total, activity) => {

            return (
              total +
              safeNumber(
                activity.distance,
                0
              )
            );

          },
          0
        );


      return {
        sport,
        sessions:
          sportActivities.length,
        distance
      };
    });


  const hasData =
    breakdown.some(
      item => item.sessions > 0
    );


  if (!hasData) {

    container.innerHTML = `
      <div class="empty-state">
        <p>
          Log activities to see your sport breakdown.
        </p>
      </div>
    `;

    return;
  }


  container.innerHTML =
    breakdown
      .map(item => `

        <div class="analytics-row">

          <div>

            <strong>
              ${sportIcons[item.sport]}
              ${item.sport.toUpperCase()}
            </strong>

            <small>
              ${item.sessions} sessions
            </small>

          </div>

          <strong>
            ${item.distance.toFixed(1)} km
          </strong>

        </div>

      `)
      .join("");
}


// ==========================================
// PERFORMANCE INSIGHT
// ==========================================

function renderPerformanceInsight(
  activities,
  strengthLogs
) {

  const container =
    document.getElementById(
      "performanceInsight"
    );

  if (!container) return;


  const recovery =
    athleteData.recovery;

  const nutrition =
    athleteData.nutrition;


  let insights = [];


  // Training insight
  if (activities.length === 0) {

    insights.push(
      "Log your first activity to begin building performance analytics."
    );

  } else if (activities.length < 3) {

    insights.push(
      "Build consistency first. More sessions will produce better performance trends."
    );

  } else {

    insights.push(
      `You have logged ${activities.length} endurance sessions so far. Consistency matters more than occasional extreme sessions.`
    );
  }


  // Strength insight
  if (strengthLogs.length === 0) {

    insights.push(
      "Add controlled strength sessions to track your supporting athletic development."
    );

  } else if (strengthLogs.length >= 5) {

    insights.push(
      "You are building a useful strength training history. Continue prioritizing technique and recovery."
    );
  }


  // Recovery insight
  if (recovery) {

    const sleep =
      safeNumber(
        recovery.sleepHours,
        0
      );

    if (sleep < 7) {

      insights.push(
        "Your latest sleep log is below 7 hours. Prioritize recovery before increasing training intensity."
      );

    } else if (sleep >= 8) {

      insights.push(
        "Your latest recovery log shows strong sleep duration."
      );
    }
  }


  // Nutrition insight
  if (nutrition) {

    const water =
      safeNumber(
        nutrition.water,
        0
      );

    const target =
      hydrationTarget();


    if (
      target > 0 &&
      water < target * 0.75
    ) {

      insights.push(
        "Hydration is below 75% of your daily target."
      );
    }
  }


  container.innerHTML =
    insights
      .slice(0, 4)
      .map(insight => `

        <div class="insight-item">
          <span>⚡</span>
          <p>${insight}</p>
        </div>

      `)
      .join("");
}


// ==========================================
// PROFILE
// ==========================================

function renderProfile() {

  if (!athleteData.profile) return;


  const profile =
    athleteData.profile;


  setText(
    "profileName",
    profile.name
  );

  setText(
    "profileAge",
    `${profile.age} years`
  );

  setText(
    "profileWeight",
    `${profile.weight} kg`
  );

  setText(
    "profileGoal",
    formatGoal(
      profile.goal
    )
  );

  setText(
    "profileXP",
    `${Math.round(
      safeNumber(
        athleteData.xp,
        0
      )
    )} XP`
  );

  setText(
    "profileLevel",
    getLevel()
  );

  setText(
    "profileInitial",
    profile.name
      .charAt(0)
      .toUpperCase()
  );


  // Profile statistics
  const activities =
    Array.isArray(
      athleteData.activities
    )
      ? athleteData.activities
      : [];


  const totalDistance =
    activities.reduce(
      (total, activity) => {

        return (
          total +
          safeNumber(
            activity.distance,
            0
          )
        );

      },
      0
    );


  setText(
    "profileSessions",
    activities.length
  );

  setText(
    "profileDistance",
    `${totalDistance.toFixed(1)} km`
  );
}


// ==========================================
// FORMAT GOAL
// ==========================================

function formatGoal(goal) {

  const goals = {

    general:
      "General Fitness",

    endurance:
      "Endurance",

    strength:
      "Strength Development",

    multisport:
      "Multi-Sport Athlete"
  };


  return (
    goals[goal] ||
    "General Fitness"
  );
}


// ==========================================
// EDIT PROFILE
// ==========================================

function editProfile() {

  if (!athleteData.profile) return;


  const newName =
    prompt(
      "Athlete name:",
      athleteData.profile.name
    );


  if (
    newName === null
  ) {
    return;
  }


  const cleanName =
    newName.trim();


  if (!cleanName) {

    alert(
      "Name cannot be empty."
    );

    return;
  }


  const newAge =
    Number(
      prompt(
        "Age:",
        athleteData.profile.age
      )
    );


  if (
    !Number.isFinite(newAge) ||
    newAge < 10 ||
    newAge > 100
  ) {

    alert(
      "Please enter a valid age."
    );

    return;
  }


  const newWeight =
    Number(
      prompt(
        "Weight (kg):",
        athleteData.profile.weight
      )
    );


  if (
    !Number.isFinite(
      newWeight
    ) ||
    newWeight <= 0 ||
    newWeight > 300
  ) {

    alert(
      "Please enter a valid weight."
    );

    return;
  }


  athleteData.profile.name =
    cleanName;

  athleteData.profile.age =
    newAge;

  athleteData.profile.weight =
    Number(
      newWeight.toFixed(1)
    );


  saveData();

  updateAllUI();

  alert(
    "Athlete profile updated successfully."
  );
}


// ==========================================
// EXPORT BACKUP
// ==========================================

function exportData() {

  try {

    const cleanData =
      sanitizeData(
        athleteData
      );


    const backup = {
      app:
        "Youth Athlete OS",

      version:
        "1.0",

      exportedAt:
        new Date()
          .toISOString(),

      data:
        cleanData
    };


    const json =
      JSON.stringify(
        backup,
        null,
        2
      );


    const blob =
      new Blob(
        [json],
        {
          type:
            "application/json"
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement("a");


    const date =
      getToday();


    link.href = url;

    link.download =
      `youth-athlete-os-backup-${date}.json`;


    document.body.appendChild(
      link
    );


    link.click();


    document.body.removeChild(
      link
    );


    URL.revokeObjectURL(
      url
    );


    alert(
      "Backup exported successfully. Keep the JSON file somewhere safe."
    );

  } catch (error) {

    console.error(
      "Export error:",
      error
    );

    alert(
      "Unable to export backup."
    );
  }
}


// ==========================================
// IMPORT BACKUP
// ==========================================

function importData() {

  const input =
    document.createElement(
      "input"
    );


  input.type = "file";

  input.accept =
    "application/json,.json";


  input.addEventListener(
    "change",
    event => {

      const file =
        event.target.files?.[0];


      if (!file) return;


      if (
        file.size >
        5 * 1024 * 1024
      ) {

        alert(
          "Backup file is too large."
        );

        return;
      }


      const reader =
        new FileReader();


      reader.onload =
        loadEvent => {

          try {

            const text =
              loadEvent.target.result;


            const parsed =
              JSON.parse(text);


            // Support both:
            // exported backup format
            // and direct data format
            const incomingData =
              parsed.data
                ? parsed.data
                : parsed;


            if (
              !incomingData ||
              typeof incomingData !==
                "object"
            ) {

              throw new Error(
                "Invalid backup structure"
              );
            }


            const sanitized =
              sanitizeData(
                incomingData
              );


            const confirmation =
              confirm(
                "Importing this backup will replace your current athlete data. Continue?"
              );


            if (!confirmation) {
              return;
            }


            athleteData =
              sanitized;


            saveData();

            updateAllUI();


            if (
              athleteData.profile
            ) {
              openApp();
            }


            alert(
              "Backup restored successfully."
            );

          } catch (error) {

            console.error(
              "Import error:",
              error
            );

            alert(
              "Invalid backup file. Please select a valid Youth Athlete OS JSON backup."
            );
          }
        };


      reader.onerror =
        () => {

          alert(
            "Unable to read the selected file."
          );
        };


      reader.readAsText(
        file
      );
    }
  );


  input.click();
}


// ==========================================
// RESET ALL DATA
// ==========================================

function resetAllData() {

  const firstConfirmation =
    confirm(
      "WARNING: This will permanently delete all athlete data from this browser. Make sure you exported a backup first. Continue?"
    );


  if (!firstConfirmation) {
    return;
  }


  const secondConfirmation =
    confirm(
      "Final confirmation: delete profile, activities, strength logs, recovery, nutrition and XP?"
    );


  if (!secondConfirmation) {
    return;
  }


  try {

    localStorage.removeItem(
      STORAGE_KEY
    );


    athleteData =
      cloneDefaultData();


    selectedSport =
      "running";


    const app =
      document.getElementById(
        "app"
      );

    const onboarding =
      document.getElementById(
        "onboarding"
      );


    if (app) {
      app.classList.add(
        "hidden"
      );
    }


    if (onboarding) {
      onboarding.classList.remove(
        "hidden"
      );
    }


    // Clear forms
    document
      .querySelectorAll(
        "input"
      )
      .forEach(input => {

        if (
          input.type !== "file"
        ) {
          input.value = "";
        }

      });


    alert(
      "All local data has been reset."
    );

  } catch (error) {

    console.error(
      "Reset error:",
      error
    );

    alert(
      "Unable to reset data."
    );
  }
}


// ==========================================
// DELETE SINGLE ACTIVITY
// ==========================================

function deleteActivity(id) {

  if (
    !Number.isFinite(
      Number(id)
    )
  ) {
    return;
  }


  const confirmation =
    confirm(
      "Delete this activity?"
    );


  if (!confirmation) {
    return;
  }


  athleteData.activities =
    athleteData.activities.filter(
      activity =>
        Number(activity.id) !==
        Number(id)
    );


  saveData();

  renderActivityHistory();

  updateHomeStats();

  renderAnalytics();
}


// ==========================================
// DELETE STRENGTH LOG
// ==========================================

function deleteStrengthLog(id) {

  if (
    !Number.isFinite(
      Number(id)
    )
  ) {
    return;
  }


  const confirmation =
    confirm(
      "Delete this strength log?"
    );


  if (!confirmation) {
    return;
  }


  athleteData.strengthLogs =
    athleteData.strengthLogs.filter(
      log =>
        Number(log.id) !==
        Number(id)
    );


  saveData();

  renderStrengthHistory();

  renderAnalytics();
}


// ==========================================
// KEYBOARD SAFETY
// ==========================================

document.addEventListener(
  "keydown",
  event => {

    // Prevent accidental form submission
    // causing page refresh
    if (
      event.key === "Enter" &&
      event.target.tagName === "INPUT"
    ) {

      const form =
        event.target.closest("form");


      if (form) {
        event.preventDefault();
      }
    }
  }
);


// ==========================================
// FINAL APP INITIALIZATION
// ==========================================

function initializeApp() {

  // Ensure data is always valid
  athleteData =
    sanitizeData(
      athleteData
    );


  // Reset XP counters if new day
  resetDailyXPIfNeeded();


  // Save corrected data
  saveData();


  updateDate();


  if (
    athleteData.profile
  ) {

    openApp();

  } else {

    const onboarding =
      document.getElementById(
        "onboarding"
      );

    const app =
      document.getElementById(
        "app"
      );


    if (onboarding) {
      onboarding.classList.remove(
        "hidden"
      );
    }


    if (app) {
      app.classList.add(
        "hidden"
      );
    }
  }
}


// ==========================================
// START APPLICATION
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initializeApp();

  }
);