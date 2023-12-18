const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const authRouter = require("./routes/authRoutes.js");
const codeRouter = require("./routes/codeRoutes.js");
const uploadRouter = require("./routes/uploadRoutes.js");
const videoRouter = require("./routes/videoRoutes.js");
const projectRouter = require("./routes/projectRoutes.js")
const logRouter = require("./routes/logRoutes.js")

const { PORT } = require("./config/keys");

//call mongoDB
const main = require("./models/db");
main()
  .then()
  .catch((err) => console.log(err));

// Middleware
const corsOptions = {
  origin: "*", // Allow only this origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow credentials (e.g., cookies)
};
const app = express();
app.use(bodyParser.json());
app.use(express.json());

if (process.env.NODE_ENV === "production") {
  app.use(cors(corsOptions));
} else {
  app.use(cors());
}
var server = app.listen(PORT);
var io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//call the all restful APIs

app.use('/api/auth',authRouter);
app.use('/api/codeblocks', codeRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/videos', videoRouter);
app.use('/api/project',projectRouter);
app.use('/api/userlogs',logRouter);

app.post("/", (req, res) => {
  res.json("Hello, world!");
});

io.on("connection", (socket) => {
  console.log("A user connected");

  // Listen for "newComment" event from the client
  socket.on("newComment", (comment) => {
    io.emit("newComment", comment);
  });

  // Listen for "newReply" event from the client
  socket.on("newReply", (reply) => {
    io.emit("newReply", reply);
    console.log(reply);
  });

  // Listen for "deleteComment" event from the client
  socket.on("deleteComment", ({ commentId }) => {
    // Broadcast the event to all connected clients
    io.emit("deleteComment", { commentId });
  });

  // Listen for "deleteReply" event from the client
  socket.on("deleteReply", ({ commentId, replyId }) => {
    // Broadcast the event to all connected clients
    io.emit("deleteReply", { commentId, replyId });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});
