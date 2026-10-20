function bindSelfCheck(root) {
  const questions = Array.from(root.querySelectorAll("[data-question]"));
  const summary = root.querySelector("[data-score]");
  let correctCount = 0;
  let answered = 0;

  questions.forEach((question) => {
    const buttons = Array.from(question.querySelectorAll("[data-choice]"));
    const feedback = question.querySelector("[data-feedback]");
    const why = question.querySelector("[data-why]");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        if (question.dataset.answered === "true") {
          return;
        }
        question.dataset.answered = "true";
        const correct = button.dataset.correct === "true";
        answered += 1;
        if (correct) {
          correctCount += 1;
        }
        if (feedback) {
          feedback.hidden = false;
          feedback.dataset.result = correct ? "correct" : "incorrect";
          feedback.textContent = correct ? "صحيح" : "ليس تماماً";
        }
        if (why) {
          why.hidden = false;
        }
        buttons.forEach((candidate) => {
          candidate.disabled = true;
          if (candidate.dataset.correct === "true") {
            candidate.dataset.marked = "answer";
          }
        });
        if (summary && answered === questions.length) {
          summary.hidden = false;
          summary.textContent =
            "أجبت عن " +
            correctCount +
            " من " +
            questions.length +
            ". تبقى هذه النتيجة في هذا التبويب ولا تُحفظ.";
        }
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-self-check]");
  if (root) {
    bindSelfCheck(root);
  }
});
