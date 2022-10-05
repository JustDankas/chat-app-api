"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'secondary';
function generateToken(username, email, _id) {
    return jsonwebtoken_1.default.sign({ username, email, _id }, ACCESS_TOKEN);
}
exports.default = generateToken;
