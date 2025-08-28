"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const react_1 = __importDefault(require("react"));
function getColor(value) {
    if (value < 40)
        return '#ef5350'; // красный
    if (value < 80)
        return '#ffb300'; // жёлтый
    return '#43a047'; // зелёный
}
const StyledLinearProgress = (0, material_1.styled)(material_1.LinearProgress)(({ barcolor }) => ({
    height: 10,
    borderRadius: 6,
    [`& .${material_1.linearProgressClasses.bar}`]: {
        borderRadius: 6,
        backgroundColor: barcolor,
        transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    background: '#e3e6ea',
}));
const ProgressBar = react_1.default.memo(({ value }) => {
    return <StyledLinearProgress variant="determinate" value={value} barcolor={getColor(value)}/>;
});
exports.default = ProgressBar;
