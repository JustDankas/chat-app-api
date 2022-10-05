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
exports.groupChatRoute = void 0;
const express_1 = __importDefault(require("express"));
const GroupChatModel_1 = require("../models/GroupChatModel");
const MessageModel_1 = require("../models/MessageModel");
const router = express_1.default.Router();
exports.groupChatRoute = router;
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const gcs = yield GroupChatModel_1.GroupChat.find({ members: req.params.id }).populate('members', { username: 1, _id: 1, email: 1 });
        res.status(200).json(gcs);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
router.get('/members/:groupId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const gc = yield GroupChatModel_1.GroupChat.findById(req.params.groupId).populate('members', { username: 1, _id: 1, email: 1 }).populate('admin', { username: 1, email: 1, _id: 1 });
        res.status(200).json(gc);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
router.put('/groupName', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupName, _id } = req.body;
        const updatedGC = yield GroupChatModel_1.GroupChat.findByIdAndUpdate(_id, { groupName }, { new: true }).populate('admin', { username: 1, email: 1, _id: 1 }).populate('members', { username: 1, email: 1, _id: 1 });
        res.status(200).json(updatedGC);
        // await gc?.updateOne({groupName:groupName})
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
router.put('/:gcId/members/add', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const gc = yield GroupChatModel_1.GroupChat.findOneAndUpdate({ _id: req.params.gcId, members: { $nin: userId } }, { $push: { members: userId } }, { new: true }).populate('admin', { username: 1, email: 1, _id: 1 }).populate('members', { username: 1, email: 1, _id: 1 });
        if (gc) {
            res.status(200).json(gc);
        }
        else {
            res.sendStatus(404);
        }
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
router.put('/:gcId/members/remove', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const updatedGC = yield GroupChatModel_1.GroupChat.findByIdAndUpdate(req.params.gcId, { $pull: { members: userId } }, { new: true }).populate('admin', { username: 1, email: 1, _id: 1 }).populate('members', { username: 1, email: 1, _id: 1 });
        if (updatedGC) {
            res.status(200).json(updatedGC);
        }
        else {
            res.sendStatus(404);
        }
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { creator } = req.body;
        const gc = yield GroupChatModel_1.GroupChat.create({
            members: [creator._id],
            admin: creator._id,
            groupName: creator.username
        });
        yield gc.save();
        yield gc.populate('admin', { username: 1, email: 1, _id: 1 });
        yield gc.populate('members', { username: 1, email: 1, _id: 1 });
        res.status(200).json(gc);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield GroupChatModel_1.GroupChat.findByIdAndDelete(id);
        yield MessageModel_1.Message.deleteMany({ chatId: id });
        res.sendStatus(200);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
