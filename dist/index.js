"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)());
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASSWORD}@myappcluster.kbtu0pi.mongodb.net/?retryWrites=true&w=majority`;
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(uri);
            console.log("Connected to database!");
        }
        catch (error) {
            console.log(error);
        }
    });
}
connect();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
let onlineUsers = [];
io.on("connection", (socket) => {
    socket.on("login", (user) => {
        console.log(user);
        if (!onlineUsers.some((usr) => usr.id == user._id)) {
            onlineUsers.push({
                id: user._id,
                socketId: socket.id,
            });
        }
    });
    socket.on("new-chat", (newChat, cb) => {
        const findId = newChat.members[1]._id;
        const receiver = onlineUsers.find((user) => user.id == findId);
        if (receiver) {
            socket.to(receiver === null || receiver === void 0 ? void 0 : receiver.socketId).emit("get-new-chat", newChat);
        }
        cb();
    });
    socket.on("send-msg", (msg, chatId, cb) => {
        socket.to(chatId).emit("receive-msg", msg, chatId);
        cb("Message Sent!");
    });
    socket.on("join-chat", (chatId) => {
        console.log(socket.id + " joined " + chatId);
        socket.join(chatId);
    });
    socket.on("group-chat-change", (groupChat, cb) => {
        socket.to(groupChat._id).emit("update-group-chat", groupChat);
        cb();
    });
    socket.on("group-chat-delete", (groupId, cb) => {
        socket.to(groupId).emit("group-chat-deleted", groupId);
        cb();
    });
    socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    });
});
const UserRoute_1 = require("./routes/UserRoute");
app.use("/users", UserRoute_1.userRouter);
const ChatRoute_1 = require("./routes/ChatRoute");
app.use("/chat", ChatRoute_1.chatRouter);
const MessageRoute_1 = require("./routes/MessageRoute");
app.use("/message", MessageRoute_1.messageRoute);
const GroupChatRoute_1 = require("./routes/GroupChatRoute");
app.use("/groupChat", GroupChatRoute_1.groupChatRoute);
// import {RoomRouter} from './routes/RoomRouter'
// app.use('/room',RoomRouter)
server.listen(process.env.PORT || 5000, () => {
    console.log(`App Listening to port ${process.env.PORT || 5000}`);
});
