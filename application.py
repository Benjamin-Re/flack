import os

from flask import Flask, render_template, url_for, redirect
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=['POST', 'GET'])
def chat():
    return render_template("chat.html")

channels = {}
channels['general'] = []
channelArray = []
maximus = 10
active = channels['general']

@socketio.on("submit message")
def chatfield(data):
    message = {'message': data["message"], 'name': data['name'], 'time': data['time']}
    global active
    active = data['activeRoom']
    channels[active].append(message)
    if int(len(channels[active])) > maximus:
        channels[active].pop(0)
    emit("announce message", {"channels": channels, "activeRoom": active}, room=active)

@socketio.on("connect")
def connect():
    global active
    emit("load messages", {"channels": channels, "activeRoom": active})



@socketio.on("submit chatroom")
def chatroom(data):
    error = ""
    chatname = data["chatroom"]
    global active
    active = chatname
    if ' ' in chatname:
        error = "Chatroom name can't contain spaces"
    elif chatname.isdigit():
        error = "Chatroom name can't contain digits"
    elif chatname == "General":
        error = "Chatroom name already exists"
    elif chatname in channelArray:
        error = "Chatroon name already exists"
    elif chatname == '':
        error = "Chatroom name can't be an empty string"
    else:
        # add new channel to channelList, this is because js can't get nth element of dict
        channelArray.append(chatname)
        # add new chatroom to channels
        channels[chatname] = []

    emit("announce chatroom", {"channelArray": channelArray, "channels": channels, "active": active, "error": error}, broadcast=True)



@socketio.on('join')
def join(data):
    global active
    active = data['room']
    join_room(active)
    text = " has joined " + active
    message = {'message': text, 'name': data['name'], 'time': data['time']}
    channels[active].append(message)
    emit("joined", {"channels": channels, "active": active, "message": message}, room=active)

@socketio.on('leave')
def leave(data):
    global active
    active = data['room']
    leave_room(data['room'])
    message = {'message': data['message'], 'name': data['name'], 'time': data['time']}
    channels[active].append(message)
    emit("left", {"channels": channels, "active": active, "message": message}, room=active)

@socketio.on('delete')
def delete(data):
    global active
    channels[active].pop(data['index'])
    emit("load messages", {"channels": channels, "activeRoom": active}, broadcast=True)