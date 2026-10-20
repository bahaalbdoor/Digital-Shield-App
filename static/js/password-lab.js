/**
 * Demo-only password strength estimate.
 * This file must never send the typed sample anywhere.
 */
const COMMON_PASSWORDS = new Set([
  "password",
  "123456",
  "12345678",
  "qwerty",
  "abc123",
  "111111",
  "football",
  "letmein",
  "admin",
  "welcome",
  "iloveyou",
  "000000",
]);

function uniqueTips(tips) {
  const seen = new Set();
  const result = [];
  tips.forEach((tip) => {
    if (!seen.has(tip)) {
      seen.add(tip);
      result.push(tip);
    }
  });
  return result.slice(0, 4);
}

function assessPassword(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) {
    return {
      score: 0,
      label: "فارغة",
      tips: ["اكتب عينة هنا. لا تستخدم كلمة مرور حقيقية."],
    };
  }

  const lower = trimmed.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) {
    return {
      score: 1,
      label: "ضعيفة",
      tips: [
        "هذه كلمة مرور شائعة جداً. يخمنها الناس أولاً.",
        "كلما كانت أطول كانت أقوى. الكلمة القصيرة الشائعة تبقى سهلة التخمين.",
      ],
    };
  }

  const length = trimmed.length;
  const classes = [
    /[a-z]/.test(trimmed),
    /[A-Z]/.test(trimmed),
    /\d/.test(trimmed),
    /[^A-Za-z0-9]/.test(trimmed),
  ].filter(Boolean).length;
  const birthYear = /^[A-Za-z]+(19|20)\d{2}$/.test(trimmed);
  const tips = [];

  if (length < 8) {
    tips.push("استخدم 12 حرفاً على الأقل. الكلمات الأقصر أسهل تخميناً.");
  } else if (length < 12) {
    tips.push("كلما كانت أطول كانت أقوى. استهدف 12 حرفاً أو أكثر.");
  } else {
    tips.push("الطول يساعد. يمكن لبرنامج إدارة كلمات المرور أن يحفظ كلمة طويلة مختلفة لكل حساب.");
  }

  if (birthYear) {
    tips.push("الاسم مع سنة الميلاد سهل التخمين. تجنّب المعلومات الشخصية.");
  }
  if (classes < 2) {
    tips.push("اخلط الكلمات أو أنواع الحروف حتى لا يبقى النمط بسيطاً.");
  }
  tips.push("لا تُعد استخدام كلمة المرور بين حساب المدرسة والبريد والتطبيقات.");

  if (length < 8 || birthYear) {
    return { score: 1, label: "ضعيفة", tips: uniqueTips(tips) };
  }
  if (length < 12 || classes < 2) {
    return { score: 2, label: "مقبولة", tips: uniqueTips(tips) };
  }
  if (length >= 16 && classes >= 3) {
    return { score: 4, label: "قوية", tips: uniqueTips(tips) };
  }
  return { score: 3, label: "جيدة", tips: uniqueTips(tips) };
}

function bindPasswordLab(root) {
  const input = root.querySelector("#demo-password");
  const meter = root.querySelector("[data-strength-meter]");
  const label = root.querySelector("[data-strength-label]");
  const tips = root.querySelector("[data-strength-tips]");
  if (!input || !meter || !label || !tips) {
    return;
  }

  const update = () => {
    const result = assessPassword(input.value);
    meter.dataset.score = String(result.score);
    meter.setAttribute("aria-valuenow", String(result.score));
    meter.setAttribute("aria-valuetext", result.label);
    label.textContent = result.label;
    tips.replaceChildren();
    result.tips.forEach((tip) => {
      const item = document.createElement("li");
      item.textContent = tip;
      tips.appendChild(item);
    });
  };

  input.addEventListener("input", update);
  update();
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-password-lab]");
    if (root) {
      bindPasswordLab(root);
    }
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { assessPassword };
}
