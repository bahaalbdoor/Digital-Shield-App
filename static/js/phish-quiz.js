function bindPhishQuiz(root) {
  const items = Array.from(root.querySelectorAll("[data-phish-item]"));
  const summary = root.querySelector("[data-phish-summary]");
  let correctCount = 0;
  let answered = 0;

  items.forEach((item) => {
    const buttons = Array.from(item.querySelectorAll("[data-choice]"));
    const feedback = item.querySelector("[data-feedback]");
    const resultLabel = item.querySelector("[data-result-label]");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        if (item.dataset.answered === "true") {
          return;
        }
        item.dataset.answered = "true";
        const correct = button.dataset.choice === item.dataset.verdict;
        answered += 1;
        if (correct) {
          correctCount += 1;
        }
        if (feedback) {
          feedback.hidden = false;
          feedback.dataset.result = correct ? "correct" : "incorrect";
        }
        if (resultLabel) {
          resultLabel.textContent = correct ? "صحيح" : "ليس تماماً";
        }
        buttons.forEach((candidate) => {
          candidate.disabled = true;
          if (candidate.dataset.choice === item.dataset.verdict) {
            candidate.dataset.marked = "answer";
          }
        });
        if (summary && answered === items.length) {
          summary.hidden = false;
          summary.textContent =
            "تعرّفت إلى " +
            correctCount +
            " من " +
            items.length +
            ". التفسيرات تبقى في هذه الصفحة فقط.";
        }
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-phish-quiz]");
  if (root) {
    bindPhishQuiz(root);
  }
});
