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
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
exports.userRouter = router;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const UserModel_1 = require("../models/UserModel");
const generateToken_1 = __importDefault(require("../utils/generateToken"));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield UserModel_1.User.find();
        res.status(200).json(users);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
router.post('/find', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield UserModel_1.User.find({ $and: [{ username: { $ne: req.body.requester } }, { username: { $regex: req.body.searchTerm } }] }, { password: 0 });
        res.status(200).json({ users });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
router.put('/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { newUsername } = req.body;
        const existsUsername = yield UserModel_1.User.findOne({ username: newUsername });
        if (!existsUsername) {
            const user = yield UserModel_1.User.findByIdAndUpdate(userId, { username: newUsername }, { new: true }).select({ email: 1, username: 1, id: 1 });
            if (user) {
                const authToken = (0, generateToken_1.default)(user === null || user === void 0 ? void 0 : user.username, user === null || user === void 0 ? void 0 : user.email, user === null || user === void 0 ? void 0 : user.id);
                res.cookie('session', authToken, {
                    expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
                });
                res.status(200).json(user);
            }
            else {
                res.sendStatus(500);
            }
        }
        else {
            res.status(400).send('Username exists!');
        }
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
// auto login
router.get('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const session = (_a = req.headers.cookie) === null || _a === void 0 ? void 0 : _a.split('=')[1];
        if (session) {
            jsonwebtoken_1.default.verify(session, process.env.ACCESS_TOKEN || 'secondary', (err, user) => {
                if (err)
                    return res.sendStatus(403);
                return res.status(200).json({ user });
            });
            // const decodedToken = jwt.verify(session,process.env.ACCESS_TOKEN || 'secondary') as MyToken
            // if(decodedToken){
            //     const user = await User.findOne({username:decodedToken.username})
            //     res.status(200).json({
            //         username:user?.username,
            //         email:user?.email,
            //         userId:user?.id,
            //     })
            // }
            // else{
            //     res.sendStatus(403)
            // }
        }
        else
            res.sendStatus(404);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const user = yield UserModel_1.User.findOne({ username });
        if (user) {
            const validPassword = yield user.matchPassword(password);
            if (validPassword) {
                const authToken = (0, generateToken_1.default)(user.username, user.email, user.id);
                res.cookie('session', authToken, {
                    expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
                });
                res.status(200).json({
                    user: {
                        username: user.username,
                        email: user.email,
                        _id: user.id
                    }
                });
            }
            else
                res.status(404).json({ error: 'Incorrect password!' });
        }
        else
            res.status(404).json({ error: 'Incorrect username!' });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
router.post('/register', validateCredentials, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield UserModel_1.User.create(req.body);
        yield user.save();
        const authToken = (0, generateToken_1.default)(user.username, user.email, user.id);
        res.cookie('session', authToken);
        res.status(200).json({
            user: {
                username: user.username,
                email: user.email,
                _id: user.id
            }
        });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
router.delete('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield UserModel_1.User.deleteMany();
        res.status(200).send('deleted successfully!');
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
function validateCredentials(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, username, password } = req.body;
        const usernameRgx = new RegExp(/[^a-z0-9]/, 'ig');
        const numberRgx = new RegExp(/\d/, 'g');
        const capsRgx = new RegExp(/[A-Z]/, 'g');
        const lowsRgx = new RegExp(/[a-z]/, 'g');
        const exists = yield UserModel_1.User.findOne({ $or: [{ username }, { email }] });
        if (exists) {
            return res.status(400).send('Username or Email already taken');
        }
        if (usernameRgx.test(username)) {
            return res.status(400).send('Username must not contain special characters');
        }
        if (username.length < 4) {
            return res.status(400).send('Username must be atleast 4 characters long');
        }
        if (password.length < 8) {
            return res.status(400).send('Password must be atleast 8 characters long');
        }
        if (password.length < 8) {
            return res.status(400).send('Password must contain atleast 1 number , capital letters and lowercase letters');
        }
        if (!numberRgx.test(password) || !capsRgx.test(password) || !lowsRgx.test(password)) {
            return res.status(400).send('Password must fit requirements');
        }
        next();
    });
}
