"""Route and safety contracts for the Digital Shield teaching site."""

from pathlib import Path

import pytest

from app import create_app

ROOT = Path(__file__).resolve().parents[1]

PAGES = (
    "/",
    "/passwords",
    "/phishing",
    "/breaches",
    "/report",
    "/teachers",
    "/quiz",
    "/about",
)

TRAINING_PHRASES = (
    "كلمة مرور بوابة المدرسة",
    "البيانات البنكية",
    "الرقم الوطني",
    "كلمة المرور الحالية",
    "huufa-mazar-payments.com",
)


@pytest.fixture
def client():
    app = create_app()
    app.config.update(TESTING=True)
    return app.test_client()


@pytest.mark.parametrize("path", PAGES)
def test_each_page_loads_with_the_safety_disclaimer(client, path):
    # Removing a route, or the shared footer, would hide the safety line.
    response = client.get(path)
    assert response.status_code == 200
    page = response.get_data(as_text=True)
    assert 'lang="ar"' in page
    assert 'dir="rtl"' in page
    assert "school-logo.png" in page
    assert "الدرع الرقمي مشروع تعليمي لمدرسة حوفا المزار الثانوية الشاملة للبنين." in page
    assert "لا تُدخل كلمات مرور حقيقية" not in page
    assert ">للمعلمين</a>" not in page


def test_home_links_to_the_three_core_modules(client):
    page = client.get("/").get_data(as_text=True)
    assert 'href="/passwords"' in page
    assert 'href="/phishing"' in page
    assert 'href="/breaches"' in page


def test_password_lab_is_demo_only_and_cannot_be_posted(client):
    # Wrapping the sample field in a form, or accepting POST, would submit it.
    response = client.get("/passwords")
    page = response.get_data(as_text=True)
    assert "للتجربة فقط" in page
    assert 'id="demo-password"' in page
    assert "password-lab.js" in page
    assert "<form" not in page.lower()
    assert 'name="password"' not in page.lower()
    posted = client.post("/passwords", data={"password": "secret-sample"})
    assert posted.status_code == 405


def test_phishing_page_includes_the_training_scenarios(client):
    # Dropping a planned scenario would leave that red flag unpracticed.
    page = client.get("/phishing").get_data(as_text=True)
    assert "مثال تدريبي" in page
    for phrase in TRAINING_PHRASES:
        assert phrase in page
    assert page.count('data-phish-item') >= 5
    assert 'data-verdict="safe"' in page
    assert 'data-verdict="suspicious"' in page


def test_breaches_page_has_a_recovery_checklist(client):
    page = client.get("/breaches").get_data(as_text=True)
    assert "ماذا تفعل" in page
    assert page.lower().count("<li") >= 4


def test_quiz_and_teacher_pages_keep_the_answer_guide_separate(client):
    # Putting the full answer guide on the student quiz would skip the practice.
    quiz = client.get("/quiz").get_data(as_text=True)
    teachers = client.get("/teachers").get_data(as_text=True)
    assert 'data-self-check' in quiz
    assert "دليل الإجابات" not in quiz
    assert "دليل الإجابات" in teachers
    assert "30" in teachers


def test_static_quiz_script_does_not_call_the_network():
    source = (ROOT / "static" / "js" / "phish-quiz.js").read_text(encoding="utf-8").lower()
    assert "fetch(" not in source
    assert "xmlhttprequest" not in source
