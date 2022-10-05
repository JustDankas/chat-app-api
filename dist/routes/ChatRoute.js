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
exports.chatRouter = void 0;
const express_1 = __importDefault(require("express"));
const ChatModel_1 = require("../models/ChatModel");
const MessageModel_1 = require("../models/MessageModel");
const router = express_1.default.Router();
exports.chatRouter = router;
router.get('/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chats = yield ChatModel_1.Chat.find({ members: req.params.userId }).populate('members');
        res.status(200).json(chats);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { member1, member2 } = req.body;
        const existsChat = yield ChatModel_1.Chat.findOne({ members: { $all: [member1, member2] } });
        if (!existsChat) {
            const chat = yield ChatModel_1.Chat.create({ members: [member1, member2] });
            yield chat.save();
            yield chat.populate('members');
            res.status(200).json({
                members: chat.members,
                _id: chat.id
            });
        }
        else {
            res.status(400).send('Chat already exists');
        }
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
router.delete('/:chatId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ChatModel_1.Chat.deleteOne({ _id: req.params.chatId });
        yield MessageModel_1.Message.deleteMany({ chatId: req.params.chatId });
        res.sendStatus(200);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
router.delete('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ChatModel_1.Chat.deleteMany();
        res.sendStatus(200);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
