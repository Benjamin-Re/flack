document.addEventListener('DOMContentLoaded', () => {
    // save username in localStorage
    var name = localStorage.getItem('name');
    document.querySelector('#name').innerHTML = name;

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    // To start out general is the active Room
    if (!localStorage.getItem('activeRoom'))
        localStorage.setItem('activeRoom', 'general');
    var activeRoom = localStorage.getItem('activeRoom');
    // time
    const time=new Date().toLocaleTimeString();
    // join room
    socket.emit('join', {'room': activeRoom,
                        'message': 'has entered the room', 'name': name,
                        'time': time});



    // When connected emit (THIS IS A EMIT ALTHOUGH IT SAYS .ON!!!!)
    socket.on('connect', () => {
        console.log('socket connected');
    });


    socket.on('load messages', data => {
        // call loadMessages function
        loadMessages(data, activeRoom);
        // Load previously created chatrooms on pageload
        var oldRooms = document.querySelectorAll('#chatrooms li');
        var oldRooms2 = [];
        for(i = 0; i < oldRooms.length; i++){
            oldRooms2.push(oldRooms[i].innerHTML);
        }


        for (x in data["channels"]){
            if (!oldRooms2.includes(x)) {
                const li = document.createElement('li');
                li.innerHTML = [x];
                li.setAttribute('data-set', x);
                // if one of the existing rooms is activated give class active
                if (x == localStorage.getItem('activeRoom')) {
                    li.setAttribute('class', 'active');
                } else {
                    li.setAttribute('class', 'room');
                }
                document.querySelector("#chatrooms").append(li);
            }
        }


        clicky(data);
    });

    // Listen for chatroom submit
    document.querySelector('#chatroom').onsubmit = () => {
        // retrieve chatroom name from input field
        var chatroom = document.querySelector('#room-name').value;
        // emit chatroom name to server
        socket.emit('submit chatroom', {'chatroom': chatroom});
        console.log('chatroom submitted');
        // clear input field
        document.querySelector('#room-name').value = '';
        return false;
    }

    // When the server announces a chatroom
    socket.on('announce chatroom', data => {
        console.log('chatroom announced');

        if (data['error'] != ''){
            alert(data['error']);
        } else {
            // add chatrooms
            const li = document.createElement('li');
            myArrayOne = data['channelArray'];
            li.innerHTML = data['channelArray'][myArrayOne.length - 1];

            li.setAttribute('data-set', data['channelArray'][myArrayOne.length - 1]);
            li.setAttribute('class', 'room');
            document.querySelector('#chatrooms').append(li);

        }
        clicky(data);

    })

    // Listen for message submit
    document.querySelector('#chatbox').onsubmit = () => {
        // retrieve text message from input field
        var message = document.querySelector('#chatfield').value;
        // time
        const time=new Date().toLocaleTimeString();
        // emit message to server
        socket.emit('submit message', {'message': message, 'name': name, 'activeRoom': activeRoom, 'time': time});
        // clear input field
        document.querySelector('#chatfield').value = '';
        console.log('message submitted to room: ' + activeRoom);
        return false;
    }


    // When the server announces the message
    socket.on('announce message', data => {
        // get active channel
        activeRoom = data['activeRoom'];
        // create, fill and append li
        const li = document.createElement('li');
        // THis is for the next step, ignore
        myArray = data['channels'][activeRoom];
        // set content of the li to the last element of our active Channel
        content = data['channels'][activeRoom][myArray.length - 1]['name']
            + ': ' + data['channels'][activeRoom][myArray.length - 1]['message'] + ', ';
        li.innerHTML = content;
        // append a time stamp
        var timeSpan = document.createElement("span");
        timeSpan.innerHTML = data['channels'][activeRoom][myArray.length - 1]['time'];
        timeSpan.setAttribute('class', 'time');
        li.append(timeSpan);
        // append the li in the chatarea
        document.querySelector('#chatarea').append(li);
        console.log('message announced to room: ' + activeRoom);
        clicky(data);
    });



    socket.on("joined", data => {
        console.log("Joined new Channel");
        // create, fill and append li
        const li = document.createElement('li');
        li.innerHTML = data["message"]["name"] + " " + data["message"]["message"] + ', ';
        // append a time stamp
        var timeSpan = document.createElement("span");
        timeSpan.innerHTML = data['message']['time'];
        timeSpan.setAttribute('class', 'time');
        li.append(timeSpan);
        // append li to the chatarea
        document.querySelector('#chatarea').append(li);
    });

    socket.on("left", data => {
        console.log("Left room" + data['active']);
        // create, fill and append li
        const li = document.createElement('li');
        li.innerHTML = data["message"]["name"] + " " + data["message"]["message"] + ', ';
        // append a time stamp
        var timeSpan = document.createElement("span");
        timeSpan.innerHTML = data['message']['time'];
        timeSpan.setAttribute('class', 'time');
        li.append(timeSpan);
        // append li to the chatarea
        document.querySelector('#chatarea').append(li);
    });


    // Delete messages
    // Add event listener to the parent ul
    document.getElementById("chatarea").addEventListener('click', function(e){
        // e is the element clicked on
        // If the element is an li
        if (e.target && e.target.nodeName == "LI") {
            // Check if message is user's own
            var word = e.target.innerHTML.split(": ");
            if (name == word[0]) {
                // Change clicked on elements html
                e.target.innerHTML="deleted";
                // And add a class to change the font
                e.target.setAttribute('class', 'deleted');
                // Get the index of the clicked on element
                // Make an array out of the ul node list
                var listArray = Array.from(e.currentTarget.children);
                console.log(listArray);
                // find the target's place in this array, which is the index
                const index = listArray.indexOf( e.target );
                console.log(index);
                // let the server know to delete the message for real
                socket.emit('delete', {"index": index});
            }

        }
    })

    // make chatrooms clickable
    function clicky(data) {
            // get all chatrooms
            var elements = document.querySelectorAll('#chatrooms li');
            elements.forEach(function(li){
                li.onclick = function() {
                    // time
                    const time=new Date().toLocaleTimeString();
                    // Erase all active classes
                    activeElements = document.querySelectorAll('.active');
                    activeElements.forEach(function(li) {
                        li.setAttribute('class', 'room');
                        // leave the old active room
                        socket.emit('leave', {'room': li.dataset.set, 'message': 'has left the room', 'name': name,
                        'time': time});
                    });
                    // Set clicked on room to the new active room

                    localStorage.setItem('activeRoom', this.dataset.set);
                    activeRoom = localStorage.getItem('activeRoom');
                    // Give it class active, for visuals only
                    this.setAttribute('class', 'active');
                    // load the active rooms messages
                    loadMessages(data, activeRoom);

                    // Onclick join the room
                    socket.emit('join', {'room': this.dataset.set,
                        'message': 'has entered the room', 'name': name,
                        'time': time});
                };
            });

    };

    function loadMessages(data, activeRoom) {
        // first clear the screen
        console.log("loading");
        canvas = Array.from(document.querySelectorAll('#chatarea > li'));
        for (i = 0; i < canvas.length; i++) {
            canvas[i].remove();
        }

        // get all elements of the active List/ Room
        for (x in data['channels'][activeRoom]){
            const li = document.createElement('li');
            content = data['channels'][activeRoom][x]['name'] + ': '
                + data['channels'][activeRoom][x]['message']
                + ', ';
            // fill and append li with messages of the active Room
            li.innerHTML = content;
            li.style.display = "block";
            // append a time stamp
            var timeSpan = document.createElement("span");
            timeSpan.innerHTML = data['channels'][activeRoom][x]['time'];
            timeSpan.setAttribute('class', 'time');
            li.append(timeSpan);
            // append li to chatarea
            document.querySelector('#chatarea').append(li);
        }

        console.log('messages loaded');
    }


});







