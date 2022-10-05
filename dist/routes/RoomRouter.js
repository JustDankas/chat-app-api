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
exports.RoomRouter = void 0;
const express_1 = __importDefault(require("express"));
const RoomModel_1 = require("../models/RoomModel");
const UserModel_1 = require("../models/UserModel");
const router = express_1.default.Router();
exports.RoomRouter = router;
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user1, user2 } = req.body;
        const user_1 = yield UserModel_1.User.findOne({ username: user1 });
        const user_2 = yield UserModel_1.User.findOne({ username: user2 });
        if (user_1 && user_2 && user_1 != user_2) {
            const room = yield (yield RoomModel_1.Room.create({ users: [user_1.username, user_2.username] }));
            yield room.save();
            yield UserModel_1.User.updateMany({ username: { $in: [user1, user2] } }, { $push: { rooms: room._id } });
            res.sendStatus(200);
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
router.delete('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield RoomModel_1.Room.deleteMany();
        res.sendStatus(200);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
