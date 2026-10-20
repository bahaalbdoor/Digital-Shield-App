from flask import Flask, render_template


def create_app():
    app = Flask(__name__)

    @app.get("/")
    def home():
        return render_template("home.html", active="home")

    @app.get("/passwords")
    def passwords():
        return render_template("passwords.html", active="passwords")

    @app.get("/phishing")
    def phishing():
        return render_template("phishing.html", active="phishing")

    @app.get("/breaches")
    def breaches():
        return render_template("breaches.html", active="breaches")

    @app.get("/report")
    def report():
        return render_template("report.html", active="report")

    @app.get("/teachers")
    def teachers():
        return render_template("teachers.html", active="teachers")

    @app.get("/quiz")
    def quiz():
        return render_template("quiz.html", active="quiz")

    @app.get("/about")
    def about():
        return render_template("about.html", active="about")

    return app


app = create_app()
