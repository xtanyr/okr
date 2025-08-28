"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const react_router_dom_1 = require("react-router-dom");
const Layout_1 = __importDefault(require("./components/Layout"));
const Login_1 = __importDefault(require("./pages/Login"));
const Register_1 = __importDefault(require("./pages/Register"));
const ForgotPassword_1 = __importDefault(require("./pages/ForgotPassword"));
const ResetPassword_1 = __importDefault(require("./pages/ResetPassword"));
const PrivateRoute_1 = __importDefault(require("./components/PrivateRoute"));
const AuthRedirect_1 = __importDefault(require("./components/AuthRedirect"));
const Dashboard_1 = __importDefault(require("./pages/Dashboard"));
const Profile_1 = __importDefault(require("./pages/Profile"));
const Users_1 = __importDefault(require("./pages/Users"));
function App() {
    return (<react_router_dom_1.BrowserRouter>
      <react_router_dom_1.Routes>
        <react_router_dom_1.Route path="/login" element={<AuthRedirect_1.default><Login_1.default /></AuthRedirect_1.default>}/>
        <react_router_dom_1.Route path="/register" element={<AuthRedirect_1.default><Register_1.default /></AuthRedirect_1.default>}/>
        <react_router_dom_1.Route path="/forgot-password" element={<ForgotPassword_1.default />}/>
        <react_router_dom_1.Route path="/reset-password" element={<ResetPassword_1.default />}/>
        <react_router_dom_1.Route element={<PrivateRoute_1.default />}>
          <react_router_dom_1.Route element={<Layout_1.default />}>
            <react_router_dom_1.Route index element={<Dashboard_1.default />}/>
            <react_router_dom_1.Route path="users" element={<Users_1.default />}/>
            <react_router_dom_1.Route path="profile" element={<Profile_1.default />}/>
          </react_router_dom_1.Route>
        </react_router_dom_1.Route>
        <react_router_dom_1.Route path="*" element={<react_router_dom_1.Navigate to="/"/>}/>
      </react_router_dom_1.Routes>
    </react_router_dom_1.BrowserRouter>);
}
