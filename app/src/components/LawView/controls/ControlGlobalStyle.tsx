import { createGlobalStyle } from "styled-components";

export const ControlGlobalStyle = createGlobalStyle`
.control-parentheses-content[data-parentheses_type="square"] {
    color: rgb(158, 79, 0);
}

.lawtext-container-ref-open > .lawtext-container-ref-text {
    background-color: rgba(127, 127, 127, 0.15);
    border-bottom: 1px solid rgb(40, 167, 69);
}

.lawtext-container-ref-text:hover {
    background-color: rgb(255, 249, 160);
    border-bottom: 1px solid rgb(40, 167, 69);
}
`;

export default ControlGlobalStyle;
