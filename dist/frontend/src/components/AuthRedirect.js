"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AuthRedirect;
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const userStore_1 = require("../store/userStore");
function AuthRedirect({ children }) {
    const token = (0, userStore_1.useUserStore)((s) => s.token);
    if (token) {
        return <react_router_dom_1.Navigate to="/" replace/>;
    }
    return <>{children}</>;
}
