"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function authenticateToken(req, res, next) {
    var _a;
    const session = (_a = req.headers.cookie) === null || _a === void 0 ? void 0 : _a.split('=')[1];
    if (session) {
        jsonwebtoken_1.default.verify(session, process.env.ACCESS_TOKEN || 'secondary', (err, user) => {
            if (err)
                return res.sendStatus(403);
            return res.status(200).json(user);
        });
    }
    next();
}
exports.default = authenticateToken;
