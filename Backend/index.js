const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
dotenv.config();

const port = process.env.PORT || 5000;
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("io", io); // Attach io to app settings

const { auth } = require("./Middlewares/Auth");
const { userRouter } = require("./routes/userRouter");
const { transactionRouter } = require("./routes/transactionRouter");
const { webhookRouter } = require("./routes/webhookRouter");

app.use("/api/user", userRouter);
app.use("/api/transactions", auth, transactionRouter);
app.use("/webhook", webhookRouter);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
