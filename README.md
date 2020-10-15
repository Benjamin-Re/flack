# Project 2 - Flack Chat

A chat application that allows for the creation 
of rooms. 
It uses Flask and Javascript 
(and Socketio on both to communicate).
First type in your username. It will be saved to
your browser's local storage. On first connecting,
you will automatically join the chatroom 'general'.
On the bottom left you can create new channels and 
chat with other users, who have joined your channel 
also. Chatroom names can't be duplicates, empty strings,
or numbers. A slight yellow glow indicates the
currently active channel. If you log of and on later, 
the server will remember your username and 
your active channel. 
To delete messages, simply 
click on them in the chararea on the right. You can 
only delete your own messages. 
