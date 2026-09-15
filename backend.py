from flask import Flask, request, redirect, session, render_template

app = Flask(__name__)

# Secret key for session
app.secret_key = "interviewiq_secret_key"

# Temporary users
users = []


# REGISTER
@app.route("/register", methods=["POST"])
def register():

    username = request.form.get("username")
    password = request.form.get("password")

    users.append({
        "username": username,
        "password": password
    })

    return redirect("/login")


# LOGIN
@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        username = request.form.get("username")
        password = request.form.get("password")

        for user in users:

            if user["username"] == username and user["password"] == password:

                # Save username in session
                session["username"] = username

                return redirect("/dashboard")

        return "Invalid username or password"

    return render_template("login.html")


# DASHBOARD
@app.route("/dashboard")
def dashboard():

    username = session.get("username")

    if not username:
        return redirect("/login")

    return render_template(
        "dashboard.html",
        username=username
    )


# LOGOUT
@app.route("/logout")
def logout():

    session.clear()

    return redirect("/login")


if __name__ == "__main__":
    app.run(debug=True)
