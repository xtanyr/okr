"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PrivateRoute;
const react_router_dom_1 = require("react-router-dom");
const userStore_1 = require("../store/userStore");
function PrivateRoute() {
    const token = (0, userStore_1.useUserStore)((s) => s.token);
    if (!token) {
        return <react_router_dom_1.Navigate to="/login" replace/>;
    }
    return <react_router_dom_1.Outlet />;
}
