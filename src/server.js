import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import morgan from 'morgan';
import path from 'path';
import socketio from 'socket.io';

import * as Notes from './note_controller';


// DB Setup
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/notes';
mongoose.connect(mongoURI, { useNewUrlParser: true });
// set mongoose promises to es6 default
mongoose.Promise = global.Promise;

// initialize
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// enable/disable cross origin resource sharing if necessary
app.use(cors());

// enable/disable http request logging
app.use(morgan('dev'));

// enable only if you want templating
app.set('view engine', 'ejs');

// enable only if you want static assets from folder static
app.use(express.static('static'));

// this just allows us to render ejs from the ../app/views directory
app.set('views', path.join(__dirname, '../src/views'));

// enable json message body for posting data to API
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// additional init stuff should go before hitting the routing

// default index route
app.get('/', (req, res) => {
  res.send('hi');
});

// START THE SERVER
// =============================================================================
const port = process.env.PORT || 9090;
server.listen(port);
console.log(`listening on: ${port}`);


io.on('connection', (socket) => {
  Notes.getNotes().then((result) => {
    socket.emit('notes', result);
  });

  const pushNotes = () => {
    Notes.getNotes().then((result) => {
      io.sockets.emit('notes', result);
    });
  };

  socket.on('createNote', (fields) => {
    const newNote = Notes.createNote(fields);
    return newNote;
  });

  socket.on('updateNote', (id, fields) => {
    Notes.updateNote(id, fields).then(() => {
      pushNotes();
    });
  });

  socket.on('deleteNote', (id) => {
    Notes.deleteNote(id);
  });
});
