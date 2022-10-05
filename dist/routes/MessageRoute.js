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
exports.messageRoute = void 0;
const express_1 = __importDefault(require("express"));
const MessageModel_1 = require("../models/MessageModel");
const router = express_1.default.Router();
exports.messageRoute = router;
router.get('/:chatId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messages = yield MessageModel_1.Message.find({ chatId: req.params.chatId }).populate('sender', { email: 1, username: 1, id: 1 });
        res.status(200).json(messages);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content, chatId, sender } = req.body;
        const message = yield MessageModel_1.Message.create({
            content,
            chatId,
            sender: sender._id
        });
        yield message.save();
        res.status(200).json({
            chatId: message.chatId,
            content: message.content,
            sender: sender,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt,
            _id: message._id,
        });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
router.delete('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield MessageModel_1.Message.deleteMany();
        res.sendStatus(200);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
