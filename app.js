const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const cookieParser = require('cookie-parser');
const requestIp = require('request-ip');
const app = express();

const authRouter = require("./routes/authRoutes.js");
const codeRouter = require("./routes/codeRoutes.js");
const uploadRouter = require("./routes/uploadRoutes.js");
const videoRouter = require("./routes/videoRoutes.js");
const projectRouter = require("./routes/projectRoutes.js")
const logRouter = require("./routes/logRoutes.js")
const urlRouter = require("./routes/urlshortner.js")

const { PORT } = require("./config/keys");
//call mongoDB
const main = require("./models/db");
const Log = require("./models/info.js");
main()
  .then()
  .catch((err) => console.log(err));

// Middleware
app.use(requestIp.mw());
app.use(cookieParser());
const corsOptions = {
  origin: "*", // Allow only this origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow credentials (e.g., cookies)
};
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
app.post('/api/userlogs', async (req, res) => {

  try {
    const ip = req.clientIp;
    const deviceInfo = req.headers['user-agent'];
    const browser = req.headers['user-agent'];
    const timing = new Date();

    const existingLog = await Log.findOne({ ip });

    if (existingLog) {
      existingLog.timing = timing;
      await existingLog.save();
      res.status(200).json({ message: 'Log updated successfully' });
    } else {
      const logEntry = new Log({ ip, deviceInfo, timing, browser });
      await logEntry.save();
      res.status(201).json({ message: 'Log saved successfully' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.use('/api/auth', authRouter);
app.use('/api/codeblocks', codeRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/videos', videoRouter);
app.use('/api/project', projectRouter);
app.use('/api/urlshortner', urlRouter);
app.use('/api/userlogs', logRouter);
app.use('/', urlRouter);



app.get("/", (req, res) => {
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
