"""Client-side password lab. These tests call the script the page uses."""

import json
import subprocess
from pathlib import Path

LAB_JS = Path(__file__).resolve().parents[1] / "static" / "js" / "password-lab.js"


def assess(value: str) -> dict:
    """Run assessPassword from password-lab.js. Expectations below are hand-written."""
    script = (
        "const { assessPassword } = require("
        + json.dumps(str(LAB_JS))
        + ");"
        + "process.stdout.write(JSON.stringify(assessPassword("
        + json.dumps(value)
        + ")));"
    )
    completed = subprocess.run(
        ["node", "-e", script],
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    return json.loads(completed.stdout)


def test_blank_sample_is_empty():
    # Removing the blank check would score "" as a real password.
    result = assess("   ")
    assert result["score"] == 0
    assert result["label"] == "فارغة"


def test_common_password_is_weak():
    # Dropping the common-password list would let "123456" score on length alone.
    result = assess("123456")
    assert result["score"] == 1
    assert result["label"] == "ضعيفة"
    assert any("شائعة" in tip for tip in result["tips"])


def test_word_password_is_weak():
    result = assess("password")
    assert result["label"] == "ضعيفة"
    assert result["score"] == 1


def test_name_plus_birth_year_is_weak():
    # Dropping the year-pattern check would treat ali2008 as an ordinary short word.
    result = assess("ali2008")
    assert result["score"] == 1
    assert result["label"] == "ضعيفة"
    assert any("سنة الميلاد" in tip or "الشخصية" in tip for tip in result["tips"])


def test_medium_sample_is_fair():
    # bluebook12 is 10 characters, not a known common password, and not a birth year.
    result = assess("bluebook12")
    assert result["score"] == 2
    assert result["label"] == "مقبولة"


def test_long_mixed_sample_is_good():
    # River-Market-42 is 15 characters with upper, lower, digit, and a symbol.
    result = assess("River-Market-42")
    assert result["score"] == 3
    assert result["label"] == "جيدة"


def test_long_passphrase_is_strong():
    # lantern-quiet-marble-71 is 23 characters with three character types.
    result = assess("lantern-quiet-marble-71")
    assert result["score"] == 4
    assert result["label"] == "قوية"


def test_lab_script_does_not_send_the_sample():
    # A fetch or XMLHttpRequest in this file would transmit the typed sample.
    source = LAB_JS.read_text(encoding="utf-8")
    lowered = source.lower()
    assert "fetch(" not in lowered
    assert "xmlhttprequest" not in lowered
    assert "navigator.sendbeacon" not in lowered
