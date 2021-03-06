const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);

const users={};
// new here
// const Mongoose=require('mongoose')
// const Schema=Mongoose.Schema

// const test=new Schema({
//     value:{
//         type:String
//     }
// })

// new here end




// Peer

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

app.get("/", (req, rsp) => {
  rsp.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {

  socket.on("join-room", (roomId, userId,na) => {
     users[socket.id]=na;
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId,na);


    
    socket.on("message", (mess,na) => {
      io.to(roomId).emit("createMessage", mess,na);
    });

    socket.on("disconnect", na => {
      io.to(roomId).emit("leave", na);
      delete users[socket.id];
    });
  });
});

server.listen(process.env.PORT || 3030);