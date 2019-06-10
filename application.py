import os

from flask import Flask, render_template, url_for, redirect
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=['POST', 'GET'])
def chat():
    return render_template("chat.html")

@socketio.on("submit message")
def chatfield(data):
    name = data["name"]
    message = data["message"]
    emit("announce message", {"message": message, "name": name}, broadcast=True)

@socketio.on("submit chatroom")
def chatroom(data):
    chatname = data["chatroom"]
    emit("announce chatroom", {"chatroom": chatname}, broadcast=True)