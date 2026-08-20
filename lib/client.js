window.__ModuleLoader__.load({ id: "@clustrai/trading-console", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.js
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);
var React10 = __toESM(require("react"), 1);

// src/client/console.js
var React4 = __toESM(require("react"), 1);

// node_modules/.pnpm/react-icons@5.7.0_react@18.3.1/node_modules/react-icons/lib/iconBase.mjs
var import_react2 = __toESM(require("react"), 1);

// node_modules/.pnpm/react-icons@5.7.0_react@18.3.1/node_modules/react-icons/lib/iconContext.mjs
var import_react = __toESM(require("react"), 1);
var DefaultContext = {
  color: void 0,
  size: void 0,
  className: void 0,
  style: void 0,
  attr: void 0
};
var IconContext = import_react.default.createContext && /* @__PURE__ */ import_react.default.createContext(DefaultContext);

// node_modules/.pnpm/react-icons@5.7.0_react@18.3.1/node_modules/react-icons/lib/iconBase.mjs
var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(e, t) {
  if (null == e) return {};
  var o, r, i = _objectWithoutPropertiesLoose(e, t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
  }
  return i;
}
function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (-1 !== e.indexOf(n)) continue;
    t[n] = r[n];
  }
  return t;
}
function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function(n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
      _defineProperty(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /* @__PURE__ */ import_react2.default.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return (props) => /* @__PURE__ */ import_react2.default.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = (conf) => {
    var attr = props.attr, size = props.size, title = props.title, svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /* @__PURE__ */ import_react2.default.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /* @__PURE__ */ import_react2.default.createElement("title", null, title), props.children);
  };
  return IconContext !== void 0 ? /* @__PURE__ */ import_react2.default.createElement(IconContext.Consumer, null, (conf) => elem(conf)) : elem(DefaultContext);
}

// node_modules/.pnpm/react-icons@5.7.0_react@18.3.1/node_modules/react-icons/ri/index.mjs
function RiShieldCheckLine(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "currentColor" }, "child": [{ "tag": "path", "attr": { "d": "M12 1L20.2169 2.82598C20.6745 2.92766 21 3.33347 21 3.80217V13.7889C21 15.795 19.9974 17.6684 18.3282 18.7812L12 23L5.6718 18.7812C4.00261 17.6684 3 15.795 3 13.7889V3.80217C3 3.33347 3.32553 2.92766 3.78307 2.82598L12 1ZM12 3.04879L5 4.60434V13.7889C5 15.1263 5.6684 16.3752 6.7812 17.1171L12 20.5963L17.2188 17.1171C18.3316 16.3752 19 15.1263 19 13.7889V4.60434L12 3.04879ZM16.4524 8.22183L17.8666 9.63604L11.5026 16L7.25999 11.7574L8.67421 10.3431L11.5019 13.1709L16.4524 8.22183Z" }, "child": [] }] })(props);
}
function RiSearchLine(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "currentColor" }, "child": [{ "tag": "path", "attr": { "d": "M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z" }, "child": [] }] })(props);
}
function RiLock2Line(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "currentColor" }, "child": [{ "tag": "path", "attr": { "d": "M6 8V7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7V8H20C20.5523 8 21 8.44772 21 9V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V9C3 8.44772 3.44772 8 4 8H6ZM19 10H5V20H19V10ZM11 15.7324C10.4022 15.3866 10 14.7403 10 14C10 12.8954 10.8954 12 12 12C13.1046 12 14 12.8954 14 14C14 14.7403 13.5978 15.3866 13 15.7324V18H11V15.7324ZM8 8H16V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V8Z" }, "child": [] }] })(props);
}
function RiHistoryLine(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "currentColor" }, "child": [{ "tag": "path", "attr": { "d": "M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12H4C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C9.25022 4 6.82447 5.38734 5.38451 7.50024L8 7.5V9.5H2V3.5H4L3.99989 5.99918C5.82434 3.57075 8.72873 2 12 2ZM13 7L12.9998 11.585L16.2426 14.8284L14.8284 16.2426L10.9998 12.413L11 7H13Z" }, "child": [] }] })(props);
}
function RiAlertLine(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "currentColor" }, "child": [{ "tag": "path", "attr": { "d": "M12.8659 3.00017L22.3922 19.5002C22.6684 19.9785 22.5045 20.5901 22.0262 20.8662C21.8742 20.954 21.7017 21.0002 21.5262 21.0002H2.47363C1.92135 21.0002 1.47363 20.5525 1.47363 20.0002C1.47363 19.8246 1.51984 19.6522 1.60761 19.5002L11.1339 3.00017C11.41 2.52187 12.0216 2.358 12.4999 2.63414C12.6519 2.72191 12.7782 2.84815 12.8659 3.00017ZM4.20568 19.0002H19.7941L11.9999 5.50017L4.20568 19.0002ZM10.9999 16.0002H12.9999V18.0002H10.9999V16.0002ZM10.9999 9.00017H12.9999V14.0002H10.9999V9.00017Z" }, "child": [] }] })(props);
}
function RiBrainAi3Line(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "currentColor" }, "child": [{ "tag": "path", "attr": { "d": "M19.5 4.7832V7.6709L22 9.11426V14.8867L19.499 16.3311L19.5 19.2178L14.5 22.1045L12 20.6611L9.5 22.1045L4.5 19.2178V16.3311L2 14.8877L2.00098 9.11328L4.5 7.66992V4.78418L9.5 1.89746L11.999 3.34082L14.501 1.89648L19.5 4.7832ZM13 5.07227V7H11V5.07324L9.5 4.20703L6.49902 5.93848V8.8252L4 10.2676V13.7334L6.5 15.1768V18.0635L9.5 19.7959L11 18.9287V17H13V18.9297L14.5 19.7959L17.5 18.0625V15.1768L20 13.7324V10.2695L17.499 8.8252L17.5 5.9375L14.501 4.20605L13 5.07227ZM14.2646 13.1602C14.3529 12.9473 14.6472 12.9473 14.7354 13.1602L14.8623 13.4648C15.0783 13.986 15.4807 14.4027 15.9873 14.6279L16.3457 14.7871C16.5511 14.8784 16.5511 15.1773 16.3457 15.2686L15.9658 15.4375C15.4721 15.6571 15.0761 16.0586 14.8564 16.5625L14.7334 16.8447C14.6432 17.0517 14.3569 17.0517 14.2666 16.8447L14.1436 16.5625C13.9239 16.0586 13.5279 15.6571 13.0342 15.4375L12.6543 15.2686C12.4489 15.1773 12.4489 14.8784 12.6543 14.7871L13.0127 14.6279C13.5193 14.4027 13.9217 13.986 14.1377 13.4648L14.2646 13.1602ZM9.58789 7.7793C9.74239 7.40671 10.2577 7.4067 10.4121 7.7793L10.6338 8.31445C11.0118 9.22695 11.7161 9.95624 12.6025 10.3506L13.2305 10.6289C13.5899 10.7887 13.5897 11.3117 13.2305 11.4717L12.5654 11.7676C11.7013 12.152 11.0086 12.8548 10.624 13.7373L10.4082 14.2324C10.2504 14.5948 9.74973 14.5948 9.5918 14.2324L9.37598 13.7373C8.99143 12.8548 8.29875 12.152 7.43457 11.7676L6.76953 11.4717C6.41033 11.3117 6.41022 10.7887 6.76953 10.6289L7.39746 10.3506C8.2839 9.95624 8.98832 9.22697 9.36621 8.31445L9.58789 7.7793Z" }, "child": [] }] })(props);
}
function RiWallet3Line(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "currentColor" }, "child": [{ "tag": "path", "attr": { "d": "M22.0049 6.99979H23.0049V16.9998H22.0049V19.9998C22.0049 20.5521 21.5572 20.9998 21.0049 20.9998H3.00488C2.4526 20.9998 2.00488 20.5521 2.00488 19.9998V3.99979C2.00488 3.4475 2.4526 2.99979 3.00488 2.99979H21.0049C21.5572 2.99979 22.0049 3.4475 22.0049 3.99979V6.99979ZM20.0049 16.9998H14.0049C11.2435 16.9998 9.00488 14.7612 9.00488 11.9998C9.00488 9.23836 11.2435 6.99979 14.0049 6.99979H20.0049V4.99979H4.00488V18.9998H20.0049V16.9998ZM21.0049 14.9998V8.99979H14.0049C12.348 8.99979 11.0049 10.3429 11.0049 11.9998C11.0049 13.6566 12.348 14.9998 14.0049 14.9998H21.0049ZM14.0049 10.9998H17.0049V12.9998H14.0049V10.9998Z" }, "child": [] }] })(props);
}
function RiSafe2Line(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "currentColor" }, "child": [{ "tag": "path", "attr": { "d": "M20.0049 20.3331V21.9998H18.0049V20.6664L10.5871 21.9027C10.3147 21.9481 10.0571 21.7641 10.0117 21.4917C10.0072 21.4646 10.0049 21.4371 10.0049 21.4095V19.9998H6.00488V21.9998H4.00488V19.9998H3.00488C2.4526 19.9998 2.00488 19.552 2.00488 18.9998V3.99977C2.00488 3.44748 2.4526 2.99977 3.00488 2.99977H10.0049V1.59C10.0049 1.31385 10.2287 1.09 10.5049 1.09C10.5324 1.09 10.5599 1.09227 10.5871 1.0968L21.1693 2.8605C21.6515 2.94086 22.0049 3.35805 22.0049 3.84689V5.99977H23.0049V7.99977H22.0049V14.9998H23.0049V16.9998H22.0049V19.1526C22.0049 19.6415 21.6515 20.0587 21.1693 20.139L20.0049 20.3331ZM4.00488 4.99977V17.9998H10.0049V4.99977H4.00488ZM12.0049 19.6388L20.0049 18.3055V4.69402L12.0049 3.36069V19.6388ZM16.5049 13.9998C15.6765 13.9998 15.0049 12.8805 15.0049 11.4998C15.0049 10.1191 15.6765 8.99977 16.5049 8.99977C17.3333 8.99977 18.0049 10.1191 18.0049 11.4998C18.0049 12.8805 17.3333 13.9998 16.5049 13.9998Z" }, "child": [] }] })(props);
}
function RiRadarLine(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "currentColor" }, "child": [{ "tag": "path", "attr": { "d": "M12.5065 3.62326L11.4835 5.39501C8.57378 4.51629 5.96968 4.94531 5.07207 6.50001C3.89477 8.53915 5.86239 12.1524 9.75027 14.3971C13.6382 16.6418 17.7512 16.5392 18.9285 14.5C19.8261 12.9453 18.8956 10.4756 16.6797 8.39501L17.7026 6.62326C20.7847 9.33196 22.1654 12.8934 20.6605 15.5C18.8003 18.7221 13.4717 18.8551 8.75027 16.1292C4.0289 13.4033 1.47976 8.72208 3.34002 5.50001C4.84492 2.89344 8.61964 2.30849 12.5065 3.62326ZM15.8842 1.77277L17.6163 2.77277L12.6163 11.433L10.8842 10.433L15.8842 1.77277ZM6.73233 20H17.0003V22H5.01761C4.94008 22.0014 4.86194 21.9938 4.78481 21.9768C4.77025 21.9735 4.7558 21.97 4.74147 21.9662C4.6589 21.944 4.57784 21.9108 4.50028 21.866C4.47106 21.8492 4.44301 21.831 4.41616 21.8118C4.30161 21.7292 4.20524 21.623 4.1342 21.5003C4.06328 21.3772 4.01939 21.2404 4.00518 21.0997C4.00446 21.0924 4.00381 21.085 4.00325 21.0777C3.98786 20.883 4.02924 20.6819 4.13425 20.5L6.38425 16.6029L8.1163 17.6029L6.73233 20Z" }, "child": [] }] })(props);
}
function RiDatabase2Line(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "currentColor" }, "child": [{ "tag": "path", "attr": { "d": "M5 12.5C5 12.8134 5.46101 13.3584 6.53047 13.8931C7.91405 14.5849 9.87677 15 12 15C14.1232 15 16.0859 14.5849 17.4695 13.8931C18.539 13.3584 19 12.8134 19 12.5V10.3287C17.35 11.3482 14.8273 12 12 12C9.17273 12 6.64996 11.3482 5 10.3287V12.5ZM19 15.3287C17.35 16.3482 14.8273 17 12 17C9.17273 17 6.64996 16.3482 5 15.3287V17.5C5 17.8134 5.46101 18.3584 6.53047 18.8931C7.91405 19.5849 9.87677 20 12 20C14.1232 20 16.0859 19.5849 17.4695 18.8931C18.539 18.3584 19 17.8134 19 17.5V15.3287ZM3 17.5V7.5C3 5.01472 7.02944 3 12 3C16.9706 3 21 5.01472 21 7.5V17.5C21 19.9853 16.9706 22 12 22C7.02944 22 3 19.9853 3 17.5ZM12 10C14.1232 10 16.0859 9.58492 17.4695 8.89313C18.539 8.3584 19 7.81342 19 7.5C19 7.18658 18.539 6.6416 17.4695 6.10687C16.0859 5.41508 14.1232 5 12 5C9.87677 5 7.91405 5.41508 6.53047 6.10687C5.46101 6.6416 5 7.18658 5 7.5C5 7.81342 5.46101 8.3584 6.53047 8.89313C7.91405 9.58492 9.87677 10 12 10Z" }, "child": [] }] })(props);
}
function RiLineChartLine(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "currentColor" }, "child": [{ "tag": "path", "attr": { "d": "M5 3V19H21V21H3V3H5ZM20.2929 6.29289L21.7071 7.70711L16 13.4142L13 10.415L8.70711 14.7071L7.29289 13.2929L13 7.58579L16 10.585L20.2929 6.29289Z" }, "child": [] }] })(props);
}
function RiBarChartBoxAiLine(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "currentColor" }, "child": [{ "tag": "path", "attr": { "d": "M20.7134 8.12811L20.4668 8.69379C20.2864 9.10792 19.7136 9.10792 19.5331 8.69379L19.2866 8.12811C18.8471 7.11947 18.0555 6.31641 17.0677 5.87708L16.308 5.53922C15.8973 5.35653 15.8973 4.75881 16.308 4.57612L17.0252 4.25714C18.0384 3.80651 18.8442 2.97373 19.2761 1.93083L19.5293 1.31953C19.7058 0.893489 20.2942 0.893489 20.4706 1.31953L20.7238 1.93083C21.1558 2.97373 21.9616 3.80651 22.9748 4.25714L23.6919 4.57612C24.1027 4.75881 24.1027 5.35653 23.6919 5.53922L22.9323 5.87708C21.9445 6.31641 21.1529 7.11947 20.7134 8.12811ZM2 4C2 3.44772 2.44772 3 3 3H14V5H4V19H20V11H22V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4ZM7 13H9V17H7V13ZM11 7H13V17H11V7ZM15 10H17V17H15V10Z" }, "child": [] }] })(props);
}

// src/client/kline.js
var React3 = __toESM(require("react"), 1);
var BG = "rgba(5, 4, 10, .54)";
var GRID = "rgba(255,255,255,.065)";
var TEXT = "#91899c";
var UP = "#26a69a";
var DOWN = "#ef5350";
var MA1 = "#f2d45c";
var MA2 = "#4c9aff";
function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : void 0;
}
function normalizeCandles(raw) {
  const rows = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
  const out = /* @__PURE__ */ new Map();
  for (const item of rows) {
    let candle;
    if (Array.isArray(item)) {
      candle = { ts: num(item[0]), o: num(item[1]), h: num(item[2]), l: num(item[3]), c: num(item[4]), vol: num(item[5]), confirmed: item[8] == null ? true : String(item[8]) === "1" };
    } else if (item && typeof item === "object") {
      candle = { ts: num(item.ts ?? item.timestamp ?? item[0]), o: num(item.o ?? item.open ?? item[1]), h: num(item.h ?? item.high ?? item[2]), l: num(item.l ?? item.low ?? item[3]), c: num(item.c ?? item.close ?? item[4]), vol: num(item.vol ?? item.volume ?? item[5]), confirmed: item.confirmed ?? (item.confirm == null ? true : String(item.confirm) === "1") };
    }
    if (candle?.ts != null && candle.o != null && candle.c != null) out.set(candle.ts, candle);
  }
  return [...out.values()].sort((a, b) => a.ts - b.ts);
}
function ma(candles, n) {
  const out = [];
  let sum = 0;
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].c;
    if (i >= n) sum -= candles[i - n].c;
    out.push(i >= n - 1 ? sum / n : null);
  }
  return out;
}
function KLineSvg(props) {
  const { candles, annotations = [], bar, onBar, width: initialWidth = 760, height = 380, state = "ready", message } = props;
  const [hover, setHover] = React3.useState(null);
  const frameRef = React3.useRef(null);
  const [width, setWidth] = React3.useState(() => Math.max(320, Number(initialWidth) || 760));
  React3.useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return void 0;
    const updateWidth = (nextWidth) => {
      const rounded = Math.max(320, Math.floor(Number(nextWidth) || frame.getBoundingClientRect().width));
      setWidth((current) => current === rounded ? current : rounded);
    };
    updateWidth(frame.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => updateWidth(entry?.contentRect?.width));
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);
  if (!candles || candles.length === 0) {
    const emptyMessage = state === "loading" ? "\u6B63\u5728\u540C\u6B65 K \u7EBF\u6570\u636E\u2026" : state === "error" ? message || "K \u7EBF\u6570\u636E\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002" : "\u5F53\u524D\u5468\u671F\u6682\u65E0 K \u7EBF\u6570\u636E\u3002";
    return React3.createElement(
      "div",
      { ref: frameRef, style: { width: "100%", minWidth: 0 } },
      React3.createElement("div", { role: state === "error" ? "alert" : "status", style: { minHeight: 280, display: "grid", placeItems: "center", padding: 24, color: state === "error" ? DOWN : TEXT, background: BG, borderRadius: 9, border: "1px solid rgba(255,255,255,.08)" } }, emptyMessage)
    );
  }
  const padL = 56;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const highs = candles.map((c) => c.h);
  const lows = candles.map((c) => c.l);
  let min = Math.min(...lows);
  let max = Math.max(...highs);
  if (!(max > min)) {
    min -= 1;
    max += 1;
  }
  const range = max - min;
  const cw = plotW / candles.length;
  const x = (i) => padL + i * cw + cw / 2;
  const y = (v) => padT + (max - v) / range * plotH;
  const volMax = Math.max(...candles.map((c) => c.vol ?? 0), 1);
  const ma7 = ma(candles, 7);
  const ma25 = ma(candles, 25);
  const polyline = (arr) => arr.map((v, i) => v == null ? "" : `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const bars = candles.map((c, i) => {
    const up = c.c >= c.o;
    const color = up ? UP : DOWN;
    const bodyTop = y(Math.max(c.o, c.c));
    const bodyH = Math.max(1, Math.abs(y(c.o) - y(c.c)));
    const volH = (c.vol ?? 0) / volMax * 48;
    return React3.createElement(
      "g",
      { key: i },
      React3.createElement("line", { x1: x(i), y1: y(c.h), x2: x(i), y2: y(c.l), stroke: color, strokeWidth: 1 }),
      React3.createElement("rect", { x: x(i) - Math.max(1, cw * 0.32), y: bodyTop, width: Math.max(1, cw * 0.64), height: bodyH, fill: color, stroke: color, strokeWidth: 1 }),
      React3.createElement("rect", { x: x(i) - Math.max(0.5, cw * 0.32), y: height - padB - volH, width: Math.max(1, cw * 0.64), height: volH, fill: color, fillOpacity: 0.38, stroke: color, strokeWidth: 0.6 })
    );
  });
  const gridLines = [0.25, 0.5, 0.75].map((f) => React3.createElement("line", { key: f, x1: padL, y1: padT + plotH * f, x2: width - padR, y2: padT + plotH * f, stroke: GRID, strokeWidth: 1 }));
  const indexByTimestamp = new Map(candles.map((candle, index) => [Number(candle.ts), index]));
  const markers = annotations.slice(-5).map((annotation, markerIndex) => {
    const index = indexByTimestamp.get(Number(annotation.ts));
    if (index == null) return null;
    const bullish = annotation.type === "spring" || annotation.type === "sos";
    const markerY = bullish ? Math.min(height - padB - 8, y(candles[index].l) + 15) : Math.max(padT + 10, y(candles[index].h) - 15);
    const color = bullish ? UP : DOWN;
    return React3.createElement(
      "g",
      { key: `${annotation.type}-${annotation.ts}-${markerIndex}` },
      React3.createElement("circle", { cx: x(index), cy: markerY, r: 3.5, fill: color, stroke: "#080513", strokeWidth: 1 }),
      React3.createElement("text", { x: x(index), y: bullish ? markerY + 13 : markerY - 7, fill: color, fontSize: 9, textAnchor: "middle", fontWeight: 700 }, annotation.type.toUpperCase())
    );
  });
  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (width / Math.max(1, rect.width));
    const i = Math.max(0, Math.min(candles.length - 1, Math.floor((px - padL) / cw)));
    setHover((current) => current === i ? current : i);
  };
  const hov = hover != null ? candles[hover] : null;
  return React3.createElement(
    "div",
    { ref: frameRef, style: { width: "100%", minWidth: 0, fontFamily: "ui-monospace, monospace", fontSize: 11, color: TEXT } },
    React3.createElement(
      "div",
      { style: { display: "flex", gap: 8, alignItems: "center", marginBottom: 8 } },
      ["1m", "5m", "15m", "1H", "4H"].map((b) => React3.createElement("button", {
        key: b,
        onClick: () => onBar && onBar(b),
        style: { background: bar === b ? "#a69fff" : "rgba(255,255,255,.035)", color: bar === b ? "#090710" : "#f4f1f7", border: "1px solid rgba(255,255,255,.12)", borderRadius: 7, padding: "3px 9px", cursor: "pointer" }
      }, b)),
      hov ? React3.createElement("span", { style: { color: "#ffffff" } }, ` ${new Date(Number(hov.ts)).toLocaleString()}  O:${hov.o} H:${hov.h} L:${hov.l} C:${hov.c} V:${hov.vol ?? 0}`) : null
    ),
    React3.createElement(
      "svg",
      { width: "100%", height, viewBox: `0 0 ${width} ${height}`, "data-clustr-kline": "true", "aria-label": "K \u7EBF\u56FE", onMouseMove: onMove, onMouseLeave: () => setHover(null), style: { display: "block", width: "100%", maxWidth: "100%", background: BG, borderRadius: 9, border: "1px solid rgba(255,255,255,.08)" } },
      gridLines,
      bars,
      React3.createElement("polyline", { points: polyline(ma7), fill: "none", stroke: MA1, strokeWidth: 1.2 }),
      React3.createElement("polyline", { points: polyline(ma25), fill: "none", stroke: MA2, strokeWidth: 1, strokeDasharray: "4 3" }),
      markers,
      hover != null ? React3.createElement("line", { x1: x(hover), y1: padT, x2: x(hover), y2: height - padB, stroke: "#666666", strokeDasharray: "3 3" }) : null
    ),
    React3.createElement("div", { style: { marginTop: 5 } }, "\u7EFF\u8272=\u4E0A\u6DA8 \xB7 \u7EA2\u8272=\u4E0B\u8DCC \xB7 \u9EC4\u7EBF=MA7 \xB7 \u84DD\u7EBF=MA25")
  );
}

// src/client/assets/clustr-mark.png
var clustr_mark_default = "data:image/png;base64,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";

// src/client/assets/binance-wordmark.png
var binance_wordmark_default = "data:image/png;base64,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+2Ns0l8cuxed1RuSQuO6gQ0Lu7EPERHRTHRjAPgNka3fp6aSIHICX9b0lKRQbbR6P02NqmoQiBR8oFp3Tyl0cw2Nm0/6KC/+RESUT/NWCXCqVq9HLXa1BxXYqE4frTa0XghEplMhoFgQiROg1tCXEsi/J6q3nbQOWdc1VvgjIqI86voRAIyFAKD+/UNby54xkiQWl0zn+8d6Q7zsYlxfs7Wb3no59h3zb5zwR0REubMgAkDLa9X6Xat7CmFi/VgE6ypFkVpD9XjjAQpVz4hUillXvx1wuqlYaFzfz2F/IiKihTf8rVvQO9RbvgDGfEHEfaBSMpXaby0RbHb1SxLAOX3OqbvRePqdpR9tzvbnUj8iIsq7BRUAWhduVZWDWxddGfj2s4BcZExzBKC1RNCY5hdbdbuhcrXGtc196/HKPG8+ERFR11hQjwBad+0ioqr47qEflEPjo2F8rPcMEEbNxwGVIjDScM9B5aaGq21ctZ4V/oiIiI7V9asAxiMCdWH9QYvkmiR226NE60sXGykEwGjN7VArN6pX3LyK5X2JiIh+S1e0A54JBaT3NkSf67e7g1ODUSOyKgz1hMRhH4zeECeFLSsuHXp57MsX1KMOIiKiTnvTXBgH7y590og5VzwMJqhtXHEJ9s/3NhEREXWrBTUHYCKRNu71TfEnvoTR8ovx+nxvDxEREc0DVvgjIiIiIiIiOsaCXQVAREREM8cAQERElEMMAERERDnEAEBERJRDDABEREQ5xABARESUQwwAREREOcQAQERElEMMAERERDnEAEBERJRDDABEREQ5xABARESUQwwAREREOcQAQERElEMMAERERDnEAEBERJRDDABEREQ5xABARESUQwwAREREOcQAQERElEMMAERERDnEAEBERJRDDABEREQ5xABARESUQwwAREREOcQAQERElEMMAERERDnEAEBERJRDDABEREQ5xABARESUQwwAREREOcQAQERElEMMAERERDnEAEBERJRDDABEREQ5xABARESUQwwAREREOcQAQERElEMMAERERDnEAEBERJRDDABEREQ5xABARESUQwwAREREOcQAQERElEMMAERERDnEAEBERJRDDABEREQ5xABARESUQwwAREREOcQAQERElEMMAERERDnEAEBERJRDDABEREQ5xABARESUQwwAREREOcQAQERElEMMAERERDnEAEBERJRDDABEREQ5xABARESUQwwAREREOcQAQERElEMMAERERDnEAEBERJRDDABEREQ5xABARESUQwwAREREOcQAQERElEMMAERERDnEAEBERJRDDABEREQ5xABARESUQwwAREREOcQAQERElEMMAERERDnEAEBERJRDDABEREQ5xABARESUQwwAREREOcQAQERElEMMAERERDnEAEBERJRD/xMAAP//Sr5OD8zF06cAAAAASUVORK5CYII=";

// src/client/assets/okx-wordmark.svg
var okx_wordmark_default = 'data:image/svg+xml,<?xml version="1.0" encoding="UTF-8" standalone="no"?>%0A<!-- Created with Inkscape (http://www.inkscape.org/) -->%0A%0A<svg%0A   xmlns:dc="http://purl.org/dc/elements/1.1/"%0A   xmlns:cc="http://creativecommons.org/ns%23"%0A   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns%23"%0A   xmlns:svg="http://www.w3.org/2000/svg"%0A   xmlns="http://www.w3.org/2000/svg"%0A   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"%0A   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"%0A   width="157.42708mm"%0A   height="44.185417mm"%0A   viewBox="0 0 157.42708 44.185417"%0A   version="1.1"%0A   id="svg8"%0A   inkscape:version="0.92.5 (2060ec1f9f, 2020-04-08)"%0A   sodipodi:docname="okx logo.svg">%0A  <defs%0A     id="defs2" />%0A  <sodipodi:namedview%0A     id="base"%0A     pagecolor="%23ffffff"%0A     bordercolor="%23666666"%0A     borderopacity="1.0"%0A     inkscape:pageopacity="0.0"%0A     inkscape:pageshadow="2"%0A     inkscape:zoom="0.98994949"%0A     inkscape:cx="567.26578"%0A     inkscape:cy="219.28838"%0A     inkscape:document-units="mm"%0A     inkscape:current-layer="layer1"%0A     showgrid="false"%0A     inkscape:pagecheckerboard="true"%0A     fit-margin-top="0"%0A     fit-margin-left="0"%0A     fit-margin-right="0"%0A     fit-margin-bottom="0"%0A     inkscape:window-width="1920"%0A     inkscape:window-height="1017"%0A     inkscape:window-x="1912"%0A     inkscape:window-y="70"%0A     inkscape:window-maximized="1" />%0A  <metadata%0A     id="metadata5">%0A    <rdf:RDF>%0A      <cc:Work%0A         rdf:about="">%0A        <dc:format>image/svg+xml</dc:format>%0A        <dc:type%0A           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />%0A        <dc:title></dc:title>%0A      </cc:Work>%0A    </rdf:RDF>%0A  </metadata>%0A  <g%0A     inkscape:label="Layer 1"%0A     inkscape:groupmode="layer"%0A     id="layer1"%0A     transform="translate(-62.058587,-90.445746)">%0A    <g%0A       style="fill:%23000000"%0A       id="g886"%0A       transform="matrix(0.39972707,0,0,0.34817986,61.931647,90.445746)">%0A      <path%0A         id="path839"%0A         d="M 115.822,0 H 2.94268 C 2.24645,0 1.57875,0.297103 1.08644,0.825953 0.594137,1.3548 0.317566,2.07208 0.317566,2.81999 V 124.079 c 0,0.748 0.276571,1.466 0.768874,1.995 0.49231,0.528 1.16001,0.825 1.85624,0.825 H 115.822 c 0.697,0 1.364,-0.297 1.857,-0.825 0.492,-0.529 0.769,-1.247 0.769,-1.995 V 2.81999 c 0,-0.74791 -0.277,-1.46519 -0.769,-1.994037 C 117.186,0.297103 116.519,0 115.822,0 Z M 79.0709,81.7797 c 0,0.7479 -0.2766,1.4651 -0.7689,1.994 -0.4923,0.5288 -1.16,0.8259 -1.8562,0.8259 H 42.3193 c -0.6962,0 -1.3639,-0.2971 -1.8562,-0.8259 -0.4923,-0.5289 -0.7689,-1.2461 -0.7689,-1.994 V 45.1198 c 0,-0.7479 0.2766,-1.4652 0.7689,-1.994 0.4923,-0.5289 1.16,-0.826 1.8562,-0.826 h 34.1265 c 0.6962,0 1.3639,0.2971 1.8562,0.826 0.4923,0.5288 0.7689,1.2461 0.7689,1.994 z"%0A         inkscape:connector-curvature="0"%0A         style="fill:%23000000" />%0A      <path%0A         id="path841"%0A         d="m 352.131,42.305 h -34.127 c -1.449,0 -2.625,1.2625 -2.625,2.82 v 36.6598 c 0,1.5574 1.176,2.82 2.625,2.82 h 34.127 c 1.45,0 2.625,-1.2626 2.625,-2.82 V 45.125 c 0,-1.5575 -1.175,-2.82 -2.625,-2.82 z"%0A         inkscape:connector-curvature="0"%0A         style="fill:%23000000" />%0A      <path%0A         id="path843"%0A         d="m 312.763,0.00204468 h -34.126 c -1.45,0 -2.625,1.26255532 -2.625,2.81998532 V 39.4819 c 0,1.5574 1.175,2.82 2.625,2.82 h 34.126 c 1.45,0 2.626,-1.2626 2.626,-2.82 V 2.82203 c 0,-1.55743 -1.176,-2.81998532 -2.626,-2.81998532 z"%0A         inkscape:connector-curvature="0"%0A         style="fill:%23000000" />%0A      <path%0A         id="path845"%0A         d="m 391.529,0.00204468 h -34.127 c -1.449,0 -2.625,1.26255532 -2.625,2.81998532 V 39.4819 c 0,1.5574 1.176,2.82 2.625,2.82 h 34.127 c 1.45,0 2.625,-1.2626 2.625,-2.82 V 2.82203 c 0,-1.55743 -1.175,-2.81998532 -2.625,-2.81998532 z"%0A         inkscape:connector-curvature="0"%0A         style="fill:%23000000" />%0A      <path%0A         id="path847"%0A         d="m 312.763,84.6038 h -34.126 c -1.45,0 -2.625,1.2625 -2.625,2.8199 v 36.6603 c 0,1.557 1.175,2.82 2.625,2.82 h 34.126 c 1.45,0 2.626,-1.263 2.626,-2.82 V 87.4237 c 0,-1.5574 -1.176,-2.8199 -2.626,-2.8199 z"%0A         inkscape:connector-curvature="0"%0A         style="fill:%23000000" />%0A      <path%0A         id="path849"%0A         d="m 391.529,84.6038 h -34.127 c -1.449,0 -2.625,1.2625 -2.625,2.8199 v 36.6603 c 0,1.557 1.176,2.82 2.625,2.82 h 34.127 c 1.45,0 2.625,-1.263 2.625,-2.82 V 87.4237 c 0,-1.5574 -1.175,-2.8199 -2.625,-2.8199 z"%0A         inkscape:connector-curvature="0"%0A         style="fill:%23000000" />%0A      <path%0A         id="path851"%0A         d="m 253.651,0.00204468 h -34.126 c -1.45,0 -2.626,1.26255532 -2.626,2.81998532 V 39.4819 c 0,1.5574 1.176,2.82 2.626,2.82 h 34.126 c 1.45,0 2.625,-1.2626 2.625,-2.82 V 2.82203 c 0,-1.55743 -1.175,-2.81998532 -2.625,-2.81998532 z"%0A         inkscape:connector-curvature="0"%0A         style="fill:%23000000" />%0A      <path%0A         id="path853"%0A         d="m 253.651,84.6038 h -34.126 c -1.45,0 -2.626,1.2625 -2.626,2.8199 v 36.6603 c 0,1.557 1.176,2.82 2.626,2.82 h 34.126 c 1.45,0 2.625,-1.263 2.625,-2.82 V 87.4237 c 0,-1.5574 -1.175,-2.8199 -2.625,-2.8199 z"%0A         inkscape:connector-curvature="0"%0A         style="fill:%23000000" />%0A      <path%0A         id="path855"%0A         d="m 216.888,45.0881 c 0,-0.7479 -0.277,-1.4652 -0.769,-1.994 -0.492,-0.5289 -1.16,-0.826 -1.856,-0.826 H 177.511 V 2.81999 c 0,-0.74791 -0.277,-1.46519 -0.769,-1.994037 C 176.25,0.297103 175.582,0 174.886,0 H 140.76 c -0.697,0 -1.364,0.297103 -1.857,0.825953 -0.492,0.528847 -0.769,1.246127 -0.769,1.994037 V 124.016 c 0,0.748 0.277,1.465 0.769,1.994 0.493,0.529 1.16,0.826 1.857,0.826 h 34.126 c 0.696,0 1.364,-0.297 1.856,-0.826 0.492,-0.529 0.769,-1.246 0.769,-1.994 V 84.5679 h 36.752 c 0.696,0 1.364,-0.2971 1.856,-0.8259 0.492,-0.5289 0.769,-1.2462 0.769,-1.9941 z"%0A         inkscape:connector-curvature="0"%0A         style="fill:%23000000" />%0A    </g>%0A  </g>%0A</svg>%0A';

// src/client/assets/bybit-wordmark.svg
var bybit_wordmark_default = 'data:image/svg+xml,<svg width="87" height="34" viewBox="0 0 87 34" fill="none" xmlns="http://www.w3.org/2000/svg">%0A<path d="M62.0083 25.3572V3H66.5022V25.3572H62.0083Z" fill="%23F7A600"/>%0A<path d="M9.63407 31.9983H0V9.64111H9.24666C13.7406 9.64111 16.3591 12.0903 16.3591 15.9214C16.3591 18.4013 14.6774 20.0039 13.5134 20.5375C14.9028 21.1652 16.6813 22.5779 16.6813 25.5624C16.6813 29.7373 13.7406 31.9983 9.63407 31.9983ZM8.89096 13.5355H4.4939V18.6852H8.89096C10.7981 18.6852 11.8652 17.6488 11.8652 16.1095C11.8652 14.5719 10.7981 13.5355 8.89096 13.5355ZM9.18151 22.6104H4.4939V28.1056H9.18151C11.2189 28.1056 12.1874 26.8503 12.1874 25.3418C12.1874 23.835 11.2171 22.6104 9.18151 22.6104Z" fill="white"/>%0A<path d="M30.3882 22.8293V31.9983H25.926V22.8293L19.0073 9.64111H23.8886L28.1888 18.6527L32.4239 9.64111H37.3052L30.3882 22.8293Z" fill="white"/>%0A<path d="M50.0457 31.9983H40.4116V9.64111H49.6583C54.1522 9.64111 56.7707 12.0903 56.7707 15.9214C56.7707 18.4013 55.089 20.0039 53.925 20.5375C55.3144 21.1652 57.093 22.5779 57.093 25.5624C57.093 29.7373 54.1522 31.9983 50.0457 31.9983ZM49.3026 13.5355H44.9055V18.6852H49.3026C51.2097 18.6852 52.2768 17.6488 52.2768 16.1095C52.2768 14.5719 51.2097 13.5355 49.3026 13.5355ZM49.5931 22.6104H44.9055V28.1056H49.5931C51.6305 28.1056 52.599 26.8503 52.599 25.3418C52.599 23.835 51.6305 22.6104 49.5931 22.6104Z" fill="white"/>%0A<path d="M80.986 13.5355V32H76.4921V13.5355H70.4785V9.64111H86.9996V13.5355H80.986Z" fill="white"/>%0A</svg>%0A';

// src/client/assets/hyperliquid-wordmark.svg
var hyperliquid_wordmark_default = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="179" height="28" viewBox="0 0 179 28" fill="none">%0A<g clip-path="url(%23clip0_975_1209)">%0A<path d="M31.8056 11.727C31.8346 14.3384 31.2881 16.8337 30.2146 19.2178C28.6816 22.6126 25.0063 25.3885 21.6501 22.4337C18.913 20.0254 18.4052 15.1363 14.3044 14.4206C8.87845 13.7629 8.74788 20.0544 5.20315 20.7653C1.2522 21.5681 -0.0583338 14.9235 -0.000302664 11.9059C0.0577284 8.88828 0.860492 4.64717 4.294 4.64717C8.24495 4.64717 8.51092 10.6292 13.5258 10.3052C18.4923 9.96669 18.5793 3.74285 21.8242 1.07826C24.6242 -1.22364 27.9175 0.464096 29.5665 3.23508C31.0947 5.79812 31.7669 8.80606 31.8007 11.727H31.8056Z" fill="%23ffffff"/>%0A<path d="M46.7054 21.8777V1.68286H48.6204V10.4165H60.4297V1.68286H62.3157V21.8777H60.4297V12.0414H48.6204V21.8777H46.7054Z" fill="%23ffffff"/>%0A<path d="M67.316 27.9999L69.9274 21.5004L64.2694 7.92114H66.2425L69.9565 17.1191C70.1692 17.68 70.4691 18.4248 70.8559 19.3533C70.914 19.2179 70.972 19.0679 71.03 18.9035C71.0881 18.7391 71.1461 18.5892 71.2041 18.4538C71.3202 18.2023 71.4217 17.9654 71.5088 17.7429C71.5958 17.5205 71.6781 17.3028 71.7554 17.0901L75.2373 7.92114H77.1233L69.2021 27.9999H67.316Z" fill="%23ffffff"/>%0A<path d="M79.0383 28.0001V7.92135H80.8372V10.4747C81.3015 9.60426 81.9737 8.89338 82.8538 8.34208C83.734 7.79078 84.7156 7.51514 85.7989 7.51514C87.0949 7.51514 88.2217 7.82947 89.1792 8.45814C90.1367 9.08681 90.8718 9.95728 91.3844 11.0695C91.897 12.1818 92.1533 13.444 92.1533 14.8561C92.1533 16.2682 91.8873 17.5642 91.3554 18.6861C90.8234 19.8081 90.0738 20.6882 89.1067 21.3265C88.1395 21.9649 87.0369 22.284 85.7989 22.284C84.7543 22.284 83.792 22.0326 82.9118 21.5296C82.0317 21.0267 81.3402 20.2916 80.8372 19.3245V28.0001H79.0383ZM85.5378 20.8333C86.4856 20.8333 87.3222 20.5818 88.0476 20.0789C88.773 19.5759 89.3291 18.8747 89.716 17.9752C90.1029 17.0758 90.2963 16.036 90.2963 14.8561C90.2963 13.6761 90.098 12.6992 89.7015 11.8094C89.3049 10.9196 88.7488 10.2281 88.0331 9.73483C87.3174 9.24156 86.4856 8.99493 85.5378 8.99493C84.5899 8.99493 83.7823 9.23673 83.0569 9.72032C82.3315 10.2039 81.7657 10.8906 81.3595 11.7804C80.9533 12.6702 80.7502 13.6954 80.7502 14.8561C80.7502 16.0167 80.9533 17.0758 81.3595 17.9752C81.7657 18.8747 82.3267 19.5759 83.0424 20.0789C83.7581 20.5818 84.5899 20.8333 85.5378 20.8333Z" fill="%23ffffff"/>%0A<path d="M100.742 22.284C99.4267 22.284 98.2709 21.9939 97.2747 21.4136C96.2785 20.8333 95.5048 19.9821 94.9535 18.8602C94.4022 17.7383 94.1265 16.3939 94.1265 14.8271C94.1265 13.4343 94.4118 12.1818 94.9825 11.0695C95.5531 9.95728 96.3317 9.08681 97.3182 8.45814C98.3048 7.82947 99.4074 7.51514 100.626 7.51514C101.941 7.51514 103.063 7.81496 103.992 8.41462C104.92 9.01427 105.626 9.86056 106.11 10.9535C106.594 12.0464 106.835 13.3182 106.835 14.769V15.1462H95.9255C95.9255 16.3455 96.1286 17.3708 96.5348 18.2219C96.941 19.073 97.5117 19.721 98.2467 20.1659C98.9818 20.6108 99.8232 20.8333 100.771 20.8333C101.893 20.8333 102.826 20.5673 103.571 20.0353C104.316 19.5034 104.775 18.7055 104.949 17.6416H106.748C106.613 18.5314 106.299 19.3245 105.805 20.0208C105.312 20.7172 104.635 21.2685 103.774 21.6747C102.913 22.0809 101.903 22.284 100.742 22.284ZM104.92 13.7825C104.901 12.3317 104.514 11.1711 103.76 10.3006C103.005 9.43016 101.961 8.99493 100.626 8.99493C99.2913 8.99493 98.2612 9.44467 97.4198 10.3442C96.5783 11.2436 96.0996 12.3897 95.9835 13.7825H104.92Z" fill="%23ffffff"/>%0A<path d="M109.616 21.8778V7.92135H111.415V10.7068C111.802 9.77835 112.406 9.01427 113.228 8.41462C114.05 7.81496 115.013 7.51514 116.115 7.51514C116.386 7.51514 116.647 7.53448 116.899 7.57317V9.3141C116.57 9.27541 116.28 9.25607 116.028 9.25607C115.1 9.25607 114.287 9.46401 113.591 9.8799C112.895 10.2958 112.358 10.8906 111.981 11.6644C111.603 12.4381 111.415 13.3376 111.415 14.3628V21.8778H109.616Z" fill="%23ffffff"/>%0A<path d="M121.367 21.491L121.285 21.8827H115.593L115.675 21.491C117.247 21.3217 117.89 20.872 118.142 19.6969L121.338 4.63295C121.677 3.09029 121.198 2.83883 119.573 3.17251L119.655 2.7808L123.132 1.60083H123.524L119.679 19.692C119.428 20.872 119.849 21.3169 121.362 21.4861L121.367 21.491Z" fill="%23ffffff"/>%0A<path d="M127.78 21.4909L127.697 21.8826H122.006L122.088 21.4909C123.659 21.3216 124.303 20.8719 124.554 19.6967L126.488 10.523C126.827 8.9513 126.377 8.72885 124.723 9.06253L124.806 8.67082L128.283 7.49085H128.674L126.092 19.6919C125.84 20.8719 126.261 21.3168 127.775 21.486L127.78 21.4909ZM128.732 2.41797C129.492 2.41797 129.995 3.00795 129.912 3.76236C129.801 4.5216 129.129 5.08256 128.399 5.08256C127.615 5.08256 127.078 4.5216 127.194 3.76236C127.277 3.00312 127.954 2.41797 128.737 2.41797H128.732Z" fill="%23ffffff"/>%0A<path d="M137.582 25.9255L139.144 18.7103C138.162 20.8429 136.117 22.2985 133.955 22.2985C130.478 22.2985 128.848 19.0149 129.888 14.1065C130.618 10.5424 133.815 7.48608 137.601 7.48608C139.342 7.48608 140.769 8.2695 141.359 9.42045L142.679 7.48608H143.071L139.125 25.9158C138.844 27.178 139.855 27.4294 140.866 27.5987L140.783 27.9904H134.25L134.332 27.5987C136.213 27.4294 137.306 27.178 137.587 25.9158L137.582 25.9255ZM134.884 21.2636C136.678 21.2636 138.472 19.721 139.313 17.8688L140.493 12.3414C140.803 10.349 139.85 8.27434 137.127 8.27434C134.405 8.27434 132.277 10.6294 131.576 14.0774C130.676 18.3137 131.938 21.2588 134.884 21.2588V21.2636Z" fill="%23ffffff"/>%0A<path d="M162.531 21.4909L162.448 21.8826H156.756L156.839 21.4909C158.41 21.3216 159.054 20.8719 159.305 19.6967L161.239 10.523C161.578 8.9513 161.128 8.72885 159.474 9.06253L159.556 8.67082L163.034 7.49085H163.425L160.843 19.6919C160.591 20.8719 161.012 21.3168 162.526 21.486L162.531 21.4909ZM163.483 2.41797C164.242 2.41797 164.745 3.00795 164.663 3.76236C164.552 4.5216 163.88 5.08256 163.15 5.08256C162.366 5.08256 161.829 4.5216 161.945 3.76236C162.028 3.00312 162.705 2.41797 163.488 2.41797H163.483Z" fill="%23ffffff"/>%0A<path d="M154.45 19.6628L155.741 13.5018L157.013 7.49561H156.621L153.144 8.67557L153.062 9.06728C154.687 8.72877 155.165 8.95605 154.827 10.5277L153.173 18.3523C151.35 20.0642 150.059 21.0749 148.487 21.0749C146.553 21.0749 145.542 19.7547 146.021 17.4866L148.153 7.50044H147.762L144.255 8.68041L144.173 9.07212C145.827 8.7336 146.277 8.96089 145.967 10.5326L144.454 17.7139C143.864 20.3785 145.213 22.3129 147.708 22.3129C149.362 22.3129 150.818 21.3892 153.057 18.9858L152.95 19.4935V19.5177H152.946L152.443 21.897H156.055L156.137 21.4714C154.624 21.3022 154.203 20.8524 154.454 19.6773L154.45 19.6628Z" fill="%23ffffff"/>%0A<path d="M177.696 6.96871L178.828 1.60083H178.436L174.959 2.7808L174.877 3.17251C176.502 2.83399 176.98 3.09029 176.642 4.63295L175.66 9.2029C175.041 8.16318 173.697 7.49099 172.125 7.49099C168.309 7.49099 165.142 10.5183 164.33 14.3628C163.348 19.0198 164.949 22.2986 168.455 22.2986C170.64 22.2986 172.72 20.814 173.673 18.6813L173.421 19.9048L173 21.8779L176.613 21.8488L176.695 21.4571C175.181 21.2879 174.761 20.8381 175.012 19.663L177.691 6.96871H177.696ZM173.837 17.8399C172.996 19.721 171.201 21.2637 169.378 21.2637C166.433 21.2637 165.171 18.3186 166.012 14.3338C166.796 10.6295 169.04 8.27441 171.651 8.27441C174.437 8.27441 175.365 10.4844 174.998 12.4962L174.867 13.1055L173.842 17.8399H173.837Z" fill="%23ffffff"/>%0A</g>%0A<defs>%0A<clipPath id="clip0_975_1209">%0A<rect width="178.832" height="28" fill="white"/>%0A</clipPath>%0A</defs>%0A</svg>%0A';

// src/client/console.js
var h = React4.createElement;
var C = {
  bg: "rgba(5,4,10,.48)",
  panel: "rgba(12, 10, 21, .72)",
  panelStrong: "rgba(16, 13, 28, .9)",
  border: "rgba(255,255,255,.105)",
  borderBright: "rgba(196,190,255,.34)",
  text: "#f4f1f7",
  sub: "#c6bfce",
  dim: "#91899c",
  purple: "#a69fff",
  indigo: "#8580e6",
  yellow: "#f2d45c",
  green: "#8be0ba",
  red: "#ef8f9d"
};
var FONT = { fontFamily: "Geist Sans, Geist, Inter, -apple-system, BlinkMacSystemFont, sans-serif" };
var EXCHANGE_NAMES = { okx: "OKX", binance: "Binance", bybit: "Bybit", hyperliquid: "Hyperliquid" };
var MARKET_LABELS = { spot: "\u73B0\u8D27", swap: "\u6C38\u7EED", linear: "U \u672C\u4F4D", inverse: "\u5E01\u672C\u4F4D", perpetual: "\u6C38\u7EED", "usd-m-futures": "U \u672C\u4F4D\u6C38\u7EED" };
var CSS = `
  .clustr-shell{position:relative;overflow:hidden;color:${C.text};background:linear-gradient(180deg,rgba(8,7,14,.38),rgba(5,4,10,.62));border:1px solid ${C.border};border-radius:12px;padding:14px;min-height:560px;box-shadow:inset 0 1px rgba(255,255,255,.035),0 24px 80px rgba(0,0,0,.22);backdrop-filter:blur(7px)}
  .clustr-shell:before{content:"";position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.016) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px);background-size:44px 44px;mask-image:linear-gradient(to bottom,rgba(0,0,0,.55),transparent 72%)}
  .clustr-layer{position:relative;z-index:1}.clustr-glass{background:${C.panel};border:1px solid ${C.border};box-shadow:inset 0 1px rgba(255,255,255,.045),0 16px 42px rgba(0,0,0,.16);backdrop-filter:blur(20px) saturate(112%)}
  .clustr-grid{display:grid;grid-template-columns:minmax(190px,220px) minmax(440px,1fr) minmax(250px,310px);gap:10px}.clustr-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:13px;flex-wrap:wrap}
  .clustr-brand{display:flex;align-items:center;gap:11px}.clustr-mark{width:32px;height:32px;display:grid;place-items:center;background:transparent;border:0;box-shadow:none}.clustr-mark img{width:25px;height:25px;object-fit:contain;filter:drop-shadow(0 5px 16px rgba(166,159,255,.24))}
  .clustr-section-label{display:flex;align-items:center;gap:7px}.clustr-section-label svg{color:${C.purple};font-size:14px;flex:none}.clustr-exchange-logo{display:block;object-fit:contain;object-position:left center;max-width:78px;max-height:22px}.clustr-exchange-logo.okx{filter:invert(1);width:48px}.clustr-exchange-logo.binance{width:76px;height:18px;object-fit:cover;object-position:center}.clustr-exchange-logo.bybit{width:58px;height:22px}.clustr-exchange-logo.hyperliquid{width:78px;height:14px}.clustr-logo-clip{display:flex;align-items:center;width:78px;height:22px;overflow:hidden;transform-origin:left center}
  .clustr-card{border-radius:10px;padding:12px;min-width:0}.clustr-eyebrow{font-size:10px;text-transform:uppercase;letter-spacing:.14em;color:${C.dim}}.clustr-pills{display:flex;gap:6px;flex-wrap:wrap}.clustr-pill{border-radius:999px;padding:4px 9px;font-size:11px;border:1px solid ${C.border};background:rgba(255,255,255,.035);color:${C.sub}}.clustr-pill.ok{border-color:rgba(139,224,186,.28);color:${C.green}}.clustr-pill.warn{border-color:rgba(242,212,92,.28);color:${C.yellow}}
  .clustr-row{display:flex;justify-content:space-between;gap:8px;padding:7px 8px;border-radius:7px;cursor:pointer;transition:background-color .16s ease}.clustr-row:hover,.clustr-row.active{background:rgba(166,159,255,.1)}.clustr-btn{appearance:none;border:1px solid ${C.border};border-radius:8px;background:rgba(255,255,255,.045);color:${C.text};padding:7px 11px;cursor:pointer;font:inherit;transition:background-color .16s ease,border-color .16s ease,transform .16s ease}.clustr-btn:hover{border-color:${C.borderBright};background:rgba(166,159,255,.11);transform:translateY(-1px)}.clustr-btn:disabled{opacity:.48;cursor:not-allowed;transform:none}.clustr-btn.primary{background:${C.purple};color:#090710;border-color:${C.purple};font-weight:680}.clustr-btn.primary:hover{background:#bbb5ff}.clustr-btn.danger{color:${C.red}}
  .clustr-input,.clustr-select{box-sizing:border-box;width:100%;background:rgba(4,3,9,.42);color:${C.text};border:1px solid ${C.border};border-radius:8px;padding:10px 11px;outline:none}.clustr-input:focus,.clustr-select:focus{border-color:${C.purple};box-shadow:0 0 0 3px rgba(166,159,255,.1)}.clustr-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.clustr-field label{display:block;color:${C.dim};font-size:11px;margin:0 0 6px}
  .clustr-market-picker{display:grid;grid-template-columns:110px 120px minmax(180px,1fr);gap:7px;position:relative;margin:10px 0}.clustr-search-wrap{position:relative}.clustr-search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:${C.dim};pointer-events:none}.clustr-search-wrap .clustr-input{padding-left:31px}.clustr-results{position:absolute;z-index:12;left:0;right:0;top:calc(100% + 6px);max-height:310px;overflow:auto;padding:6px;border-radius:9px;background:rgba(10,8,18,.98);border:1px solid ${C.borderBright};box-shadow:0 24px 70px rgba(0,0,0,.48)}.clustr-result{width:100%;display:grid;grid-template-columns:1fr auto;gap:8px;text-align:left;border:0;border-radius:7px;background:transparent;color:${C.text};padding:9px;cursor:pointer}.clustr-result:hover,.clustr-result:focus{background:rgba(166,159,255,.12);outline:none}.clustr-result small{color:${C.dim}}
  .clustr-account-scroll{max-height:420px;overflow:auto;padding-right:2px}.clustr-account-card{border:1px solid rgba(255,255,255,.09);border-radius:8px;padding:10px;background:rgba(255,255,255,.023);margin-top:8px}.clustr-account-head{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.clustr-account-metric{font-size:19px;margin-top:7px}.clustr-mini-row{display:grid;grid-template-columns:1fr auto;gap:8px;color:${C.sub};font-size:10px;padding:4px 0;border-top:1px solid rgba(255,255,255,.055)}.clustr-cap-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:8px}.clustr-cap{border:1px solid rgba(255,255,255,.08);border-radius:7px;padding:7px;background:rgba(255,255,255,.023)}.clustr-cap small{display:block;color:${C.dim};font-size:9px;margin-bottom:3px}.clustr-cap strong{font-size:10px;font-weight:580}
  .clustr-analysis{margin-top:10px;padding:12px;border-radius:9px;border:1px solid rgba(166,159,255,.2);background:linear-gradient(135deg,rgba(166,159,255,.075),rgba(242,212,92,.025))}.clustr-analysis-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.clustr-analysis ul{margin:7px 0 0;padding-left:17px;color:${C.sub};font-size:11px;line-height:1.65}.clustr-analysis-controls{display:grid;grid-template-columns:minmax(220px,1fr) auto auto;gap:8px;align-items:center;margin-top:10px}.clustr-analysis-status{margin-top:9px;color:${C.sub};font-size:11px;line-height:1.6}.clustr-analysis-status.error{color:${C.red}}.clustr-method-brief{display:grid;grid-template-columns:auto 1fr;gap:5px 10px;margin-top:9px;padding:9px;border:1px solid rgba(255,255,255,.07);border-radius:8px;background:rgba(5,4,10,.28)}.clustr-method-brief>span{grid-row:1/3;align-self:start;border:1px solid rgba(166,159,255,.22);border-radius:999px;padding:3px 7px;color:${C.purple};font-size:9px}.clustr-method-brief p{margin:0;color:${C.sub};font-size:11px;line-height:1.5}.clustr-method-brief small{color:${C.dim};font-size:9px}.clustr-analysis-result{margin-top:10px}.clustr-analysis-summary{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid rgba(255,255,255,.08);padding-top:9px}.clustr-analysis-summary strong{font-size:13px}.clustr-evidence-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.clustr-evidence-box{border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:8px;background:rgba(255,255,255,.02)}.clustr-evidence-box>small{color:${C.dim};font-size:9px;letter-spacing:.08em}.clustr-levels{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.clustr-level{border:1px solid rgba(255,255,255,.09);border-radius:6px;padding:4px 7px;color:${C.sub};font-size:9px;background:rgba(255,255,255,.025)}.clustr-analysis-launcher strong{display:block;font-size:18px;margin-top:2px}.clustr-analysis-launcher p{color:${C.sub};font-size:11px;line-height:1.55;margin:7px 0 10px}
  .clustr-workbench{margin-top:12px}.clustr-workbench-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}.clustr-workbench-head p{margin:5px 0 0;color:${C.sub};font-size:12px;line-height:1.55;max-width:720px}.clustr-workbench-actions{display:flex;gap:7px;flex-wrap:wrap}.clustr-workbench-metrics{display:grid;grid-template-columns:repeat(4,minmax(110px,1fr));gap:7px;margin:12px 0}.clustr-workbench-tabs{display:flex;gap:4px;border-bottom:1px solid ${C.border};margin-bottom:8px}.clustr-workbench-tab{appearance:none;border:0;border-bottom:2px solid transparent;background:transparent;color:${C.dim};padding:8px 11px;cursor:pointer;font:inherit;font-size:12px}.clustr-workbench-tab[aria-selected="true"]{color:${C.text};border-bottom-color:${C.purple}}.clustr-table-wrap{overflow:auto;max-height:300px;border:1px solid rgba(255,255,255,.07);border-radius:8px}.clustr-table{border-collapse:collapse;width:100%;min-width:780px}.clustr-table th{position:sticky;top:0;z-index:1;background:rgba(13,11,22,.98);color:${C.dim};font-size:10px;font-weight:560;letter-spacing:.04em;text-align:left;padding:8px 10px;border-bottom:1px solid ${C.border}}.clustr-table td{color:${C.sub};font-size:11px;padding:9px 10px;border-bottom:1px solid rgba(255,255,255,.05);vertical-align:middle}.clustr-table tbody tr:last-child td{border-bottom:0}.clustr-table strong{color:${C.text};font-weight:620}.clustr-status{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}.clustr-empty{padding:24px 14px;text-align:center;color:${C.dim};font-size:12px;line-height:1.6}.clustr-order-id{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:${C.dim};font-size:10px}
  .clustr-tape{margin-top:12px}.clustr-tape-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.clustr-tape-metrics{display:grid;grid-template-columns:repeat(4,minmax(96px,1fr));gap:7px;margin:10px 0}.clustr-tape-metric{border:1px solid rgba(255,255,255,.075);border-radius:8px;padding:8px;background:rgba(255,255,255,.022)}.clustr-tape-metric small{display:block;color:${C.dim};font-size:9px;margin-bottom:3px}.clustr-tape-metric strong{font-size:14px}.clustr-tape-list{display:grid;gap:6px;max-height:240px;overflow:auto}.clustr-tape-entry{border:1px solid rgba(255,255,255,.075);border-radius:8px;background:rgba(5,4,10,.28);overflow:hidden}.clustr-tape-entry summary{display:grid;grid-template-columns:72px minmax(160px,1fr) 86px 90px 86px;gap:8px;align-items:center;padding:8px 10px;cursor:pointer;font-size:10px;list-style:none}.clustr-tape-entry summary::-webkit-details-marker{display:none}.clustr-tape-entry summary:hover{background:rgba(166,159,255,.06)}.clustr-tape-stages{padding:0 10px 9px 24px;border-top:1px solid rgba(255,255,255,.06)}.clustr-tape-stage{display:grid;grid-template-columns:60px 110px 1fr;gap:8px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.045);color:${C.sub};font-size:9px}.clustr-tape-note{color:${C.dim};font-size:9px;line-height:1.5;margin:7px 0 0}
  @media(max-width:1080px){.clustr-grid{grid-template-columns:200px minmax(0,1fr)}.clustr-side{grid-column:1/-1;display:grid!important;grid-template-columns:1fr 1fr}}
  @media(max-width:760px){.clustr-shell{padding:10px;border-radius:10px}.clustr-grid{grid-template-columns:1fr}.clustr-side{grid-column:auto;display:flex!important}.clustr-form{grid-template-columns:1fr}.clustr-head{align-items:flex-start}.clustr-chart-scroll{overflow-x:auto}.clustr-market-picker{grid-template-columns:1fr 1fr}.clustr-search-wrap{grid-column:1/-1}.clustr-analysis-controls{grid-template-columns:1fr 1fr}.clustr-analysis-controls .clustr-select{grid-column:1/-1}.clustr-cap-grid{grid-template-columns:1fr}.clustr-evidence-grid{grid-template-columns:1fr}.clustr-workbench-metrics{grid-template-columns:1fr 1fr}.clustr-workbench-actions{width:100%}.clustr-workbench-actions .clustr-btn{flex:1}.clustr-tape-metrics{grid-template-columns:1fr 1fr}.clustr-tape-entry summary{grid-template-columns:58px 1fr 70px}.clustr-tape-entry summary span:nth-child(4),.clustr-tape-entry summary span:nth-child(5){display:none}.clustr-tape-stage{grid-template-columns:48px 94px 1fr}}
`;
async function get(path) {
  const res = await fetch(path, { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "HTTP " + res.status);
  return data;
}
async function post(path, body, csrfToken) {
  const res = await fetch(path, { method: "POST", headers: { "content-type": "application/json", "x-clustr-csrf": csrfToken }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}
function Brand({ compact = false }) {
  return h("div", { className: "clustr-brand" }, h("div", { className: "clustr-mark" }, h("img", { src: clustr_mark_default, alt: "Clustr" })), h(
    "div",
    null,
    h("div", { style: { fontFamily: "General Sans, Geist Sans, sans-serif", fontWeight: 680, fontSize: compact ? 14 : 17 } }, "Clustr Trading Console"),
    compact ? null : h("div", { className: "clustr-eyebrow", style: { marginTop: 2 } }, "AI TRADER OPERATING SYSTEM")
  ));
}
function Styles() {
  return h("style", null, CSS);
}
function Pill({ children, kind = "" }) {
  return h("span", { className: `clustr-pill ${kind}` }, children);
}
function Card({ children, className = "", style }) {
  return h("section", { className: `clustr-card clustr-glass ${className}`, style }, children);
}
function SectionLabel({ icon: Icon, children, style }) {
  return h("div", { className: "clustr-eyebrow clustr-section-label", style }, h(Icon, { "aria-hidden": true }), h("span", null, children));
}
function ExchangeLogo({ exchange }) {
  if (exchange === "okx") return h("span", { className: "clustr-logo-clip" }, h("img", { className: "clustr-exchange-logo okx", src: okx_wordmark_default, alt: "OKX" }));
  if (exchange === "binance") return h("span", { className: "clustr-logo-clip" }, h("img", { className: "clustr-exchange-logo binance", src: binance_wordmark_default, alt: "Binance" }));
  if (exchange === "bybit") return h("span", { className: "clustr-logo-clip" }, h("img", { className: "clustr-exchange-logo bybit", src: bybit_wordmark_default, alt: "Bybit" }));
  if (exchange === "hyperliquid") return h("span", { className: "clustr-logo-clip" }, h("img", { className: "clustr-exchange-logo hyperliquid", src: hyperliquid_wordmark_default, alt: "Hyperliquid" }));
  return h("span", null, exchange);
}
function ConsoleGate({ sessionId, inputActions, ctx }) {
  const [access, setAccess] = React4.useState({ state: "checking" });
  const [retry, setRetry] = React4.useState(0);
  const [busy, setBusy] = React4.useState(false);
  React4.useEffect(() => {
    let alive = true;
    const currentId = sessionId == null ? "" : String(sessionId);
    setAccess({ state: "checking" });
    if (!currentId) {
      setAccess({ state: "isolated", effectivePreset: null });
      return () => {
        alive = false;
      };
    }
    get(`/api/crypto/session?sessionId=${encodeURIComponent(currentId)}`).then((result) => {
      if (!alive) return;
      const verified = result?.eligible === true && String(result?.sessionId ?? "") === currentId;
      setAccess({ ...result, state: verified ? "eligible" : "isolated", effectivePreset: result?.effectivePreset ?? null });
    }).catch((error) => {
      if (alive) setAccess({ state: "error", message: String(error?.message ?? error) });
    });
    return () => {
      alive = false;
    };
  }, [sessionId, retry]);
  React4.useEffect(() => {
    const currentId = sessionId == null ? "" : String(sessionId);
    const dispose = ctx?.remote?.$on?.("agent-preset/selected", (changedSessionId) => {
      if (String(changedSessionId ?? "") !== currentId) return;
      setAccess({ state: "checking" });
      setRetry((value) => value + 1);
    });
    return () => {
      if (typeof dispose === "function") dispose();
    };
  }, [ctx, sessionId]);
  if (access.state === "eligible") return h(ConsoleView, { ctx, inputActions, sessionId });
  const checking = access.state === "checking";
  const failed = access.state === "error";
  const presetEligible = access.presetEligible === true;
  const bindingState = access.bindingState;
  const title = checking ? "\u6B63\u5728\u786E\u8BA4\u4F1A\u8BDD\u72B6\u6001" : failed ? "\u4F1A\u8BDD\u72B6\u6001\u8BFB\u53D6\u5F02\u5E38" : bindingState === "available" ? "\u542F\u7528\u6B64\u4EA4\u6613\u4F1A\u8BDD" : bindingState === "occupied" ? "\u53E6\u4E00\u4E2A\u4EA4\u6613\u4F1A\u8BDD\u5DF2\u542F\u7528" : bindingState === "invalid" ? "\u6B64\u4F1A\u8BDD\u5DF2\u79BB\u5F00 Clustr \u6A21\u5F0F" : "\u8FDB\u5165 Clustr \u4EA4\u6613\u4F1A\u8BDD";
  const description = checking ? "\u6B63\u5728\u6838\u5BF9\u5F53\u524D\u4F1A\u8BDD\u7684\u6700\u65B0\u6A21\u5F0F\u4E0E\u4E13\u5C5E\u4EA4\u6613\u4F1A\u8BDD\u6388\u6743\u3002" : failed ? "\u5F53\u524D\u65E0\u6CD5\u8BFB\u53D6\u6B64\u4F1A\u8BDD\u7684\u5B8C\u6574\u72B6\u6001\u3002\u4E3A\u4FDD\u62A4\u8D26\u6237\u3001\u5BA1\u6279\u4E0E\u4EA4\u6613\u8BB0\u5F55\uFF0C\u63A7\u5236\u53F0\u6682\u65F6\u4FDD\u6301\u9694\u79BB\u3002" : bindingState === "available" ? "\u542F\u7528\u540E\uFF0C\u4FA7\u680F Clustr \u5C06\u56FA\u5B9A\u8FD4\u56DE\u6B64\u4F1A\u8BDD\uFF1B\u5176\u4ED6\u6A21\u5F0F\u548C\u5176\u4ED6 Clustr \u4F1A\u8BDD\u4ECD\u4FDD\u6301\u9694\u79BB\u3002" : bindingState === "occupied" ? "Clustr \u5F53\u524D\u56FA\u5B9A\u8FDE\u63A5\u5230\u53E6\u4E00\u4E2A\u4EA4\u6613\u4F1A\u8BDD\u3002\u4F60\u53EF\u4EE5\u8FD4\u56DE\u8BE5\u4F1A\u8BDD\uFF0C\u6216\u660E\u786E\u5C06\u4EA4\u6613\u63A7\u5236\u6743\u5207\u6362\u5230\u8FD9\u91CC\u3002" : bindingState === "invalid" ? "\u5B8C\u6574\u63A7\u5236\u53F0\u5DF2\u7ACB\u5373\u9501\u5B9A\u3002\u5BF9\u8BDD\u8BB0\u5F55\u4ECD\u7136\u4FDD\u7559\uFF1B\u5982\u9700\u7EE7\u7EED\uFF0C\u8BF7\u8FDB\u5165\u53E6\u4E00\u4E2A Clustr \u4F1A\u8BDD\u5E76\u660E\u786E\u5207\u6362\u3002" : presetEligible ? "\u6B64\u4F1A\u8BDD\u5C1A\u672A\u83B7\u5F97\u4E13\u5C5E\u4EA4\u6613\u63A7\u5236\u6743\u3002" : "\u5F53\u524D\u4F1A\u8BDD\u4E0D\u662F Clustr Trading Console \u6A21\u5F0F\u3002\u8BF7\u65B0\u5EFA\u4F1A\u8BDD\u5E76\u9009\u62E9\u8BE5\u6A21\u5F0F\u3002";
  const openBound = async () => {
    try {
      setBusy(true);
      const result = await get("/api/crypto/session");
      if (result?.eligible && result?.sessionId) {
        ctx.get("sessions")?.open(result.sessionId);
        return;
      }
      if (result?.bindingState === "query_error") alert("\u5DF2\u542F\u7528\u4EA4\u6613\u4F1A\u8BDD\u7684\u72B6\u6001\u8BFB\u53D6\u5F02\u5E38\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002");
      else if (result?.bindingState === "invalid") alert("\u5DF2\u542F\u7528\u7684\u4EA4\u6613\u4F1A\u8BDD\u5F53\u524D\u4E0D\u5728 Clustr \u6A21\u5F0F\u3002\u8BF7\u8FDB\u5165\u4E00\u4E2A Clustr \u4F1A\u8BDD\u5E76\u660E\u786E\u5207\u6362\u3002");
      else alert("\u5C1A\u672A\u542F\u7528\u4E13\u5C5E\u4EA4\u6613\u4F1A\u8BDD\u3002\u8BF7\u5728 Clustr \u4F1A\u8BDD\u4E2D\u70B9\u51FB\u300C\u542F\u7528\u6B64\u4F1A\u8BDD\u300D\u3002");
    } catch {
      alert("\u4F1A\u8BDD\u72B6\u6001\u8BFB\u53D6\u5F02\u5E38\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002");
    } finally {
      setBusy(false);
    }
  };
  const bindCurrent = async (replace) => {
    const currentId = sessionId == null ? "" : String(sessionId);
    if (!currentId) return;
    if (replace && !window.confirm("\u5C06 Clustr \u4E13\u5C5E\u4EA4\u6613\u4F1A\u8BDD\u5207\u6362\u5230\u5F53\u524D\u4F1A\u8BDD\uFF1F\u539F\u4F1A\u8BDD\u5C06\u4FDD\u7559\u5BF9\u8BDD\u8BB0\u5F55\uFF0C\u4F46\u4E0D\u518D\u663E\u793A\u5B8C\u6574\u63A7\u5236\u53F0\u3002")) return;
    try {
      setBusy(true);
      const status = await get("/api/crypto/status");
      await post("/api/crypto/session/bind", { sessionId: currentId, replace }, status.csrfToken);
      setRetry((value) => value + 1);
    } catch (error) {
      alert(String(error?.message ?? error));
    } finally {
      setBusy(false);
    }
  };
  let actions = null;
  if (failed) actions = h("button", { className: "clustr-btn primary", onClick: () => setRetry((value) => value + 1), disabled: busy }, "\u91CD\u65B0\u786E\u8BA4");
  else if (bindingState === "available") actions = h("button", { className: "clustr-btn primary", onClick: () => bindCurrent(false), disabled: busy }, busy ? "\u6B63\u5728\u542F\u7528\u2026" : "\u542F\u7528\u6B64\u4F1A\u8BDD");
  else if (bindingState === "occupied") actions = h(
    "div",
    { style: { display: "flex", gap: 9, flexWrap: "wrap" } },
    h("button", { className: "clustr-btn primary", onClick: openBound, disabled: busy }, "\u8FDB\u5165\u5DF2\u542F\u7528\u4F1A\u8BDD"),
    h("button", { className: "clustr-btn", onClick: () => bindCurrent(true), disabled: busy }, "\u6539\u7528\u5F53\u524D\u4F1A\u8BDD")
  );
  else if (!checking && bindingState !== "invalid") actions = h("button", { className: "clustr-btn primary", onClick: openBound, disabled: busy }, "\u8FDB\u5165\u5DF2\u542F\u7528\u4F1A\u8BDD  \u2192");
  return h(React4.Fragment, null, h(Styles), h("div", { className: "clustr-shell", style: { ...FONT, minHeight: 280, maxWidth: 620, margin: "24px auto" } }, h(
    "div",
    { className: "clustr-layer" },
    h(Brand),
    h("h2", { style: { margin: "34px 0 8px", fontFamily: "General Sans, Geist Sans, sans-serif", fontSize: 28 } }, title),
    h("p", { style: { color: C.sub, lineHeight: 1.7, maxWidth: 500 } }, description),
    checking ? null : actions
  )));
}
function ConsoleView({ ctx, inputActions, sessionId }) {
  const [data, setData] = React4.useState({ tickers: [], status: null, core: null, exchangeData: null, accounts: [], analysisCatalog: { methods: [] }, sessionTape: { entries: [], metrics: {} }, tradingWorkspace: { positions: [], openOrders: [], trackedOrders: [], metrics: {} } });
  const [selected, setSelected] = React4.useState({ exchange: "okx", symbol: "BTC-USDT", displaySymbol: "BTC/USDT", marketType: "spot" });
  const [bar, setBar] = React4.useState("15m");
  const [candles, setCandles] = React4.useState([]);
  const [analysisResult, setAnalysisResult] = React4.useState(null);
  const [klineState, setKlineState] = React4.useState({ status: "loading", message: "" });
  const [analysisOpen, setAnalysisOpen] = React4.useState(false);
  const [analysisType, setAnalysisType] = React4.useState("wyckoff");
  const [analysisState, setAnalysisState] = React4.useState({ status: "idle", message: "" });
  const [error, setError] = React4.useState(null);
  const [searchExchange, setSearchExchange] = React4.useState("okx");
  const [searchMarket, setSearchMarket] = React4.useState("all");
  const [searchQuery, setSearchQuery] = React4.useState("");
  const [searchResults, setSearchResults] = React4.useState([]);
  const [searchOpen, setSearchOpen] = React4.useState(false);
  const [searchState, setSearchState] = React4.useState("loading");
  const [workspaceAction, setWorkspaceAction] = React4.useState(null);
  const [workspaceNotice, setWorkspaceNotice] = React4.useState(null);
  const klineRequest = React4.useRef(0);
  const analysisRequest = React4.useRef(0);
  const searchRequest = React4.useRef(0);
  const loadAll = React4.useCallback(async () => {
    try {
      const [tickers, status2, core, exchangeData, catalog] = await Promise.all([get("/api/crypto/tickers"), get("/api/crypto/status"), get("/api/clustr/core"), get("/api/clustr/exchanges"), get("/api/clustr/analysis/catalog")]);
      const [workspace, tape] = await Promise.all([
        post("/api/clustr/trading/workspace", { sessionId: String(sessionId ?? "") }, status2.csrfToken).catch(() => ({ accounts: [], positions: [], openOrders: [], trackedOrders: [], metrics: {}, unavailable: true })),
        get(`/api/clustr/session-tape?sessionId=${encodeURIComponent(String(sessionId ?? ""))}&limit=40`).catch(() => ({ entries: [], metrics: {}, unavailable: true }))
      ]);
      setData({ tickers: tickers?.tickers ?? [], status: status2, core, exchangeData, accounts: workspace?.accounts ?? [], analysisCatalog: catalog, sessionTape: tape, tradingWorkspace: workspace });
      setError(null);
    } catch (cause) {
      setError(String(cause?.message ?? cause));
    }
  }, [sessionId]);
  const refreshTradingWorkspace = React4.useCallback(async (reconcile = false) => {
    const csrfToken = data.status?.csrfToken;
    const currentSessionId = String(sessionId ?? "");
    if (!csrfToken || !currentSessionId) return;
    try {
      setWorkspaceAction(reconcile ? "reconcile" : "refresh");
      setWorkspaceNotice(null);
      const workspace = await post(reconcile ? "/api/clustr/trading/reconcile" : "/api/clustr/trading/workspace", { sessionId: currentSessionId }, csrfToken);
      setData((current) => ({ ...current, accounts: workspace.accounts ?? current.accounts, tradingWorkspace: workspace }));
      setWorkspaceNotice(reconcile ? workspace.reconciliation?.pending > 0 ? "\u4ECD\u6709\u8BA2\u5355\u7B49\u5F85\u4EA4\u6613\u6240\u786E\u8BA4\u3002\u7CFB\u7EDF\u4F1A\u7EE7\u7EED\u6838\u5BF9\u3002" : "\u5F85\u786E\u8BA4\u8BA2\u5355\u5DF2\u5B8C\u6210\u6838\u5BF9\u3002" : "\u8D26\u6237\u3001\u8BA2\u5355\u4E0E\u6301\u4ED3\u5DF2\u5237\u65B0\u3002");
    } catch (cause) {
      setWorkspaceNotice(`\u72B6\u6001\u5237\u65B0\u5931\u8D25\uFF1A${String(cause?.message ?? cause)}`);
    } finally {
      setWorkspaceAction(null);
    }
  }, [data.status?.csrfToken, sessionId]);
  const loadKline = React4.useCallback(async (instrument, timeframe) => {
    const requestId = ++klineRequest.current;
    setCandles([]);
    setKlineState({ status: "loading", message: "" });
    try {
      const query = new URLSearchParams({ exchange: instrument.exchange, instId: instrument.symbol, marketType: instrument.marketType, bar: timeframe, limit: "200" });
      const market = await get(`/api/clustr/market/klines?${query}`);
      if (requestId !== klineRequest.current) return;
      const nextCandles = normalizeCandles(market?.candles ?? market);
      setCandles(nextCandles);
      setKlineState({ status: nextCandles.length > 0 ? "ready" : "empty", message: "" });
    } catch (cause) {
      if (requestId !== klineRequest.current) return;
      setCandles([]);
      setKlineState({ status: "error", message: String(cause?.message ?? cause) });
    }
  }, []);
  const clearAnalysis = React4.useCallback(() => {
    analysisRequest.current += 1;
    setAnalysisResult(null);
    setAnalysisState({ status: "idle", message: "" });
  }, []);
  const chooseInstrument = React4.useCallback((instrument) => {
    clearAnalysis();
    setSelected(instrument);
  }, [clearAnalysis]);
  const chooseBar = React4.useCallback((timeframe) => {
    if (timeframe !== bar) {
      clearAnalysis();
      setBar(timeframe);
    }
  }, [bar, clearAnalysis]);
  const runMarketAnalysis = React4.useCallback(async () => {
    const requestId = ++analysisRequest.current;
    const method = data.analysisCatalog?.methods?.find((item) => item.id === analysisType);
    setAnalysisResult(null);
    setAnalysisState({ status: "loading", message: `\u6B63\u5728\u8FD0\u884C${method?.label ?? "\u5E02\u573A\u5206\u6790"}\u2026` });
    try {
      const query = new URLSearchParams({ method: analysisType, exchange: selected.exchange, instId: selected.symbol, marketType: selected.marketType, bar, limit: "240" });
      const analysis = await get(`/api/clustr/analysis/run?${query}`);
      if (requestId !== analysisRequest.current) return;
      if (!analysis?.ok) {
        setAnalysisState({ status: "refused", message: analysis?.reason || "\u5F53\u524D\u6570\u636E\u4E0D\u8DB3\u4EE5\u5F62\u6210\u53EF\u9760\u7684\u7ED3\u6784\u5224\u65AD\u3002" });
        return;
      }
      setAnalysisResult(analysis);
      setAnalysisState({ status: "ready", message: "" });
    } catch (cause) {
      if (requestId !== analysisRequest.current) return;
      setAnalysisState({ status: "error", message: `\u5206\u6790\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528\uFF1A${String(cause?.message ?? cause)}` });
    }
  }, [analysisType, bar, data.analysisCatalog?.methods, selected]);
  React4.useEffect(() => {
    loadAll();
    const dispose = ctx.get("timer")?.interval(loadAll, 3e4);
    return () => {
      if (dispose) dispose();
    };
  }, [ctx, loadAll]);
  React4.useEffect(() => {
    loadKline(selected, bar);
  }, [selected, bar, loadKline]);
  React4.useEffect(() => {
    const csrfToken = data.status?.csrfToken;
    const currentId = String(sessionId ?? "");
    if (!csrfToken || !currentId) return;
    post("/api/clustr/context/update", {
      sessionId: currentId,
      exchange: selected.exchange,
      symbol: selected.symbol,
      displaySymbol: selected.displaySymbol,
      marketType: selected.marketType,
      timeframe: bar
    }, csrfToken).catch(() => {
    });
  }, [bar, data.status?.csrfToken, selected, sessionId]);
  React4.useEffect(() => {
    const requestId = ++searchRequest.current;
    setSearchState("loading");
    setSearchResults([]);
    const timerId = setTimeout(async () => {
      try {
        const query = new URLSearchParams({ exchange: searchExchange, marketType: searchMarket, query: searchQuery, limit: "24" });
        const result = await get(`/api/clustr/market/instruments?${query}`);
        if (requestId !== searchRequest.current) return;
        setSearchResults(result?.instruments ?? []);
        setSearchState((result?.instruments ?? []).length ? "ready" : "empty");
      } catch {
        if (requestId !== searchRequest.current) return;
        setSearchResults([]);
        setSearchState("error");
      }
    }, 220);
    return () => clearTimeout(timerId);
  }, [searchExchange, searchMarket, searchQuery]);
  const status = data.status ?? {};
  const providers = Array.isArray(data.exchangeData?.providers) ? data.exchangeData.providers : [];
  const connectedAccounts = data.accounts.filter((account) => account.connected);
  const connectedCount = connectedAccounts.length;
  const analysisMethods = Array.isArray(data.analysisCatalog?.methods) ? data.analysisCatalog.methods : [];
  const selectedMethod = analysisMethods.find((item) => item.id === analysisType) ?? analysisMethods[0];
  const selectSearchResult = (row) => {
    chooseInstrument({ exchange: row.exchange, symbol: row.symbol, displaySymbol: row.displaySymbol || row.symbol, marketType: row.marketType });
    setSearchExchange(row.exchange);
    setSearchMarket(row.marketType);
    setSearchQuery(row.displaySymbol || row.symbol);
    setSearchOpen(false);
  };
  return h(React4.Fragment, null, h(Styles), h("div", { className: "clustr-shell", style: FONT }, h(
    "div",
    { className: "clustr-layer" },
    h("header", { className: "clustr-head" }, h(Brand), h(
      "div",
      { className: "clustr-pills" },
      h(Pill, { kind: connectedCount > 0 ? "ok" : "warn" }, `${connectedCount} \u4E2A\u8D26\u6237\u5DF2\u8FDE\u63A5`),
      h(Pill, { kind: status.readOnly !== false ? "warn" : "ok" }, status.readOnly !== false ? "\u53EA\u8BFB\u4FDD\u62A4" : "\u5BA1\u6279\u4EA4\u6613"),
      h(Pill, null, `${data.core?.autonomy?.definition?.label ?? "\u89C2\u5BDF"}\u6743\u9650`),
      error ? h(Pill, { kind: "warn" }, "\u90E8\u5206\u6570\u636E\u8FDE\u63A5\u5F02\u5E38") : null
    )),
    h(
      "div",
      { className: "clustr-grid" },
      h(
        Card,
        null,
        h(SectionLabel, { icon: RiRadarLine, style: { marginBottom: 10 } }, "MARKET SIGNALS"),
        data.tickers.map((ticker) => {
          const up = Number(ticker.changePct) >= 0;
          const instrument = { exchange: "okx", symbol: ticker.instId, displaySymbol: ticker.instId.replace(/-SWAP$/, " \u6C38\u7EED").replace("-", "/"), marketType: ticker.instId.endsWith("-SWAP") ? "swap" : "spot" };
          return h("div", { key: ticker.instId, className: `clustr-row ${ticker.instId === selected.symbol && selected.exchange === "okx" ? "active" : ""}`, onClick: () => chooseInstrument(instrument) }, h("span", null, ticker.instId.replace("-USDT", "")), h("span", { style: { textAlign: "right" } }, h("div", null, ticker.last ?? "\u2014"), h("small", { style: { color: up ? C.green : C.red } }, ticker.changePct == null ? "\u2014" : `${up ? "+" : ""}${Number(ticker.changePct).toFixed(2)}%`)));
        }),
        data.tickers.length === 0 ? h("p", { style: { color: C.dim } }, "\u6B63\u5728\u540C\u6B65\u5E02\u573A\u4FE1\u53F7\u2026") : null,
        h(
          "div",
          { style: { borderTop: `1px solid ${C.border}`, marginTop: 12, paddingTop: 12 } },
          h(SectionLabel, { icon: RiWallet3Line }, "CONNECTED ACCOUNTS"),
          ...providers.map((provider, index) => {
            const unavailable = provider.availability === "unavailable";
            const rows = data.accounts.filter((account) => account.exchange === provider.id && account.connected);
            const ready = rows.some((account) => account.readStatus === "ready" || account.readStatus === "partial");
            const label = unavailable ? "\u672A\u5F00\u653E" : rows.length === 0 ? "\u8D26\u6237\u672A\u8FDE\u63A5" : ready ? `${rows.length} \u4E2A\u8D26\u6237\u53EF\u8BFB` : "\u8D26\u6237\u8FDE\u63A5\u5F02\u5E38";
            return h("div", { key: provider.id, className: "clustr-row", style: { marginTop: index === 0 ? 7 : 0, alignItems: "center", cursor: "default" } }, h(ExchangeLogo, { exchange: provider.id }), h("span", { style: { color: unavailable ? C.yellow : rows.length === 0 ? C.dim : ready ? C.green : C.red, fontSize: 10, textAlign: "right" } }, `\u25CF ${label}`));
          })
        )
      ),
      h(
        Card,
        { className: "clustr-chart-scroll" },
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "end", gap: 10, marginBottom: 4 } }, h("div", null, h(SectionLabel, { icon: RiLineChartLine }, "MARKET STRUCTURE"), h("h3", { style: { margin: "4px 0 0", fontSize: 18 } }, selected.displaySymbol)), h("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, h("span", { style: { color: C.dim, fontSize: 11 } }, `${EXCHANGE_NAMES[selected.exchange]} \xB7 ${MARKET_LABELS[selected.marketType] ?? selected.marketType} \xB7 \u8FD1\u5B9E\u65F6`), h("button", { className: "clustr-btn", onClick: () => setAnalysisOpen((open) => !open), "aria-expanded": analysisOpen }, analysisOpen ? "\u6536\u8D77\u5206\u6790" : "\u5E02\u573A\u5206\u6790"))),
        h(
          "div",
          { className: "clustr-market-picker" },
          h("select", { className: "clustr-select", value: searchExchange, onChange: (event) => {
            const next = event.target.value;
            setSearchExchange(next);
            setSearchMarket(defaultMarket(next));
            setSearchOpen(true);
          }, "aria-label": "\u884C\u60C5\u573A\u6240" }, Object.entries(EXCHANGE_NAMES).map(([id, name]) => h("option", { key: id, value: id }, name))),
          h("select", { className: "clustr-select", value: searchMarket, onChange: (event) => {
            setSearchMarket(event.target.value);
            setSearchOpen(true);
          }, "aria-label": "\u5E02\u573A\u7C7B\u578B" }, marketOptions(searchExchange).map((item) => h("option", { key: item.value, value: item.value }, item.label))),
          h(
            "div",
            { className: "clustr-search-wrap" },
            h(RiSearchLine, { className: "clustr-search-icon", "aria-hidden": true }),
            h("input", { className: "clustr-input", value: searchQuery, placeholder: "\u641C\u7D22 BTC\u3001SOL\u3001DOGE \u6216\u4EFB\u610F\u4EA4\u6613\u5BF9", onChange: (event) => {
              setSearchQuery(event.target.value);
              setSearchOpen(true);
            }, onFocus: () => setSearchOpen(true), onKeyDown: (event) => {
              if (event.key === "Escape") setSearchOpen(false);
            }, "aria-label": "\u641C\u7D22\u4EA4\u6613\u54C1\u79CD", "aria-expanded": searchOpen }),
            searchOpen ? h(
              "div",
              { className: "clustr-results", role: "listbox" },
              searchState === "loading" ? h("div", { style: { padding: 10, color: C.dim, fontSize: 11 } }, "\u6B63\u5728\u8BFB\u53D6\u53EF\u4EA4\u6613\u54C1\u79CD\u2026") : null,
              searchState === "error" ? h("div", { role: "alert", style: { padding: 10, color: C.red, fontSize: 11 } }, "\u8BE5\u4EA4\u6613\u573A\u6240\u7684\u54C1\u79CD\u76EE\u5F55\u6682\u65F6\u4E0D\u53EF\u7528\u3002") : null,
              searchState === "empty" ? h("div", { style: { padding: 10, color: C.dim, fontSize: 11 } }, "\u6CA1\u6709\u627E\u5230\u5339\u914D\u7684\u4EA4\u6613\u54C1\u79CD\u3002") : null,
              ...searchResults.map((row) => h("button", { key: `${row.marketType}:${row.symbol}`, className: "clustr-result", role: "option", onMouseDown: (event) => event.preventDefault(), onClick: () => selectSearchResult(row) }, h("span", null, h("strong", null, row.displaySymbol || row.symbol), h("small", { style: { display: "block", marginTop: 2 } }, row.symbol)), h("small", null, MARKET_LABELS[row.marketType] ?? row.marketType)))
            ) : null
          )
        ),
        h(KLineSvg, { candles, annotations: analysisState.status === "ready" ? analysisResult?.events ?? [] : [], bar, onBar: chooseBar, height: 340, state: klineState.status, message: klineState.message }),
        analysisOpen ? h(
          "div",
          { className: "clustr-analysis" },
          h("div", { className: "clustr-analysis-head" }, h("div", null, h(SectionLabel, { icon: RiBrainAi3Line }, "MARKET ANALYSIS LIBRARY"), h("strong", { style: { display: "block", marginTop: 5, fontSize: 13 } }, analysisState.status === "ready" ? analysisResult?.signalLabel : selectedMethod?.label ?? "\u6B63\u5728\u8BFB\u53D6\u5206\u6790\u5DE5\u5177\u5E93")), analysisState.status === "ready" && analysisResult?.ok ? h(Pill, { kind: analysisResult.structureMatchScore >= 0.65 ? "ok" : "warn" }, `\u7ED3\u6784\u5339\u914D\u5EA6 ${Math.round((analysisResult.structureMatchScore ?? 0) * 100)}%`) : h(Pill, null, `${analysisMethods.length} \u5957\u65B9\u6CD5`)),
          selectedMethod ? h("div", { className: "clustr-method-brief" }, h("span", null, selectedMethod.category), h("p", null, selectedMethod.summary), h("small", null, `\u8F93\u5165\uFF1A${selectedMethod.inputs?.join(" + ") ?? "OHLCV"} \xB7 \u81F3\u5C11 ${selectedMethod.minCandles} \u6839 K \u7EBF \xB7 \u4EC5\u5728\u70B9\u51FB\u8FD0\u884C\u540E\u8BA1\u7B97`)) : null,
          h("div", { className: "clustr-analysis-controls" }, h("select", { className: "clustr-select", value: analysisType, onChange: (event) => {
            clearAnalysis();
            setAnalysisType(event.target.value);
          }, "aria-label": "\u5E02\u573A\u5206\u6790\u65B9\u6CD5" }, analysisMethods.length ? analysisMethods.map((method) => h("option", { key: method.id, value: method.id }, `${method.category} \xB7 ${method.label}`)) : h("option", { value: "wyckoff" }, "\u6B63\u5728\u8BFB\u53D6\u5206\u6790\u5DE5\u5177\u5E93\u2026")), h("button", { className: "clustr-btn primary", onClick: runMarketAnalysis, disabled: analysisState.status === "loading" || analysisMethods.length === 0 }, analysisState.status === "loading" ? "\u5206\u6790\u4E2D\u2026" : "\u8FD0\u884C\u5206\u6790"), h("button", { className: "clustr-btn", onClick: clearAnalysis, disabled: analysisState.status === "idle" }, "\u6E05\u9664\u7ED3\u679C")),
          analysisState.status === "ready" && analysisResult?.ok ? h(AnalysisResult, { result: analysisResult }) : analysisState.status !== "idle" ? h("div", { role: analysisState.status === "error" || analysisState.status === "refused" ? "alert" : "status", className: `clustr-analysis-status ${analysisState.status === "error" ? "error" : ""}` }, analysisState.message) : h("div", { className: "clustr-analysis-status" }, "\u8BF7\u9009\u62E9\u4E00\u79CD\u4F53\u7CFB\u5E76\u4E3B\u52A8\u8FD0\u884C\u3002\u5207\u6362\u6807\u7684\u6216\u5468\u671F\u4F1A\u7ACB\u5373\u6E05\u9664\u65E7\u7ED3\u679C\u3002")
        ) : null
      ),
      h(
        "div",
        { className: "clustr-side", style: { display: "flex", flexDirection: "column", gap: 12 } },
        h(Card, null, h(SectionLabel, { icon: RiWallet3Line }, "ACCOUNT PORTFOLIOS"), h(
          "div",
          { className: "clustr-account-scroll" },
          connectedAccounts.length === 0 ? h("p", { style: { color: C.dim, fontSize: 12, lineHeight: 1.6 } }, "\u5728\u8BBE\u7F6E\u4E2D\u8FDE\u63A5\u4E00\u4E2A\u6216\u591A\u4E2A\u4EA4\u6613\u6240\u8D26\u6237\u540E\uFF0C\u8FD9\u91CC\u4F1A\u5206\u522B\u663E\u793A\u6BCF\u4E2A\u8D26\u6237\u7684\u4F59\u989D\u4E0E\u6301\u4ED3\u3002") : null,
          ...connectedAccounts.map((account) => h(AccountSummary, { key: `${account.exchange}:${account.profile}`, account }))
        )),
        h(Card, { className: "clustr-analysis-launcher" }, h(SectionLabel, { icon: RiBrainAi3Line, style: { marginBottom: 9 } }, "MARKET ANALYSIS"), h("strong", null, `${analysisMethods.length || 12} \u5957\u5206\u6790\u4F53\u7CFB`), h("p", null, selectedMethod?.summary ?? "\u9009\u62E9\u9002\u5408\u5F53\u524D\u5E02\u573A\u72B6\u6001\u7684\u5206\u6790\u65B9\u6CD5\uFF0C\u6309\u9700\u8FD0\u884C\u5E76\u4FDD\u7559\u53CD\u8BC1\u4E0E\u5931\u6548\u6761\u4EF6\u3002"), h("button", { className: "clustr-btn primary", onClick: () => setAnalysisOpen(true), style: { width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 } }, h(RiBarChartBoxAiLine, { "aria-hidden": true }), analysisOpen ? "\u5206\u6790\u5DE5\u5177\u5E93\u5DF2\u5C55\u5F00" : "\u6253\u5F00\u5206\u6790\u5DE5\u5177\u5E93"))
      )
    ),
    h(TradingWorkspacePanel, { workspace: data.tradingWorkspace, action: workspaceAction, notice: workspaceNotice, onRefresh: () => refreshTradingWorkspace(false), onReconcile: () => refreshTradingWorkspace(true) }),
    h(SessionTapePanel, { tape: data.sessionTape })
  )));
}
function orderStatus(value) {
  const state = String(value ?? "unknown").toLowerCase().replace(/_/g, "-");
  const states = {
    received: ["\u6307\u4EE4\u5DF2\u63A5\u6536", C.sub],
    validating: ["\u6838\u9A8C\u4E2D", C.sub],
    "awaiting-approval": ["\u7B49\u5F85\u6279\u51C6", C.yellow],
    approved: ["\u5DF2\u6279\u51C6", C.sub],
    submitting: ["\u63D0\u4EA4\u4E2D", C.yellow],
    unknown: ["\u7B49\u5F85\u6838\u5BF9", C.yellow],
    reconciling: ["\u6B63\u5728\u6838\u5BF9", C.yellow],
    acknowledged: ["\u4EA4\u6613\u6240\u5DF2\u63A5\u53D7", C.green],
    open: ["\u7B49\u5F85\u6210\u4EA4", C.green],
    live: ["\u7B49\u5F85\u6210\u4EA4", C.green],
    "partially-filled": ["\u90E8\u5206\u6210\u4EA4", C.yellow],
    partially_filled: ["\u90E8\u5206\u6210\u4EA4", C.yellow],
    "cancel-pending": ["\u64A4\u5355\u5904\u7406\u4E2D", C.yellow],
    filled: ["\u5DF2\u6210\u4EA4", C.green],
    canceled: ["\u5DF2\u64A4\u9500", C.dim],
    cancelled: ["\u5DF2\u64A4\u9500", C.dim],
    rejected: ["\u88AB\u62D2\u7EDD", C.red],
    denied: ["\u672A\u6279\u51C6", C.yellow],
    failed: ["\u5904\u7406\u5931\u8D25", C.red],
    "manual-review": ["\u9700\u8981\u4EBA\u5DE5\u6838\u5BF9", C.red]
  };
  const [label, color] = states[state] ?? ["\u72B6\u6001\u5F85\u786E\u8BA4", C.yellow];
  return { state, label, color };
}
function sideLabel(value) {
  return { buy: "\u4E70\u5165", sell: "\u5356\u51FA", long: "\u591A\u5934", short: "\u7A7A\u5934" }[String(value ?? "").toLowerCase()] ?? String(value ?? "\u2014");
}
function compactId(value) {
  const text = String(value ?? "");
  if (!text) return "\u2014";
  return text.length > 16 ? `${text.slice(0, 8)}\u2026${text.slice(-5)}` : text;
}
function formatTime(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "\u2014";
  return new Date(parsed).toLocaleString([], { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function TradingWorkspacePanel({ workspace, action, notice, onRefresh, onReconcile }) {
  const [tab, setTab] = React4.useState("positions");
  const positions = Array.isArray(workspace?.positions) ? workspace.positions : [];
  const openOrders = Array.isArray(workspace?.openOrders) ? workspace.openOrders : [];
  const trackedOrders = Array.isArray(workspace?.trackedOrders) ? workspace.trackedOrders : [];
  const metrics = workspace?.metrics ?? {};
  const busy = Boolean(action);
  const tabs = [
    { id: "positions", label: `\u6301\u4ED3 ${positions.length}` },
    { id: "orders", label: `\u5F53\u524D\u59D4\u6258 ${openOrders.length}` },
    { id: "lifecycle", label: `\u8BA2\u5355\u72B6\u6001 ${trackedOrders.length}` }
  ];
  const statusNotice = notice ? h("div", { role: notice.startsWith("\u72B6\u6001\u5237\u65B0\u5931\u8D25") ? "alert" : "status", style: { color: notice.startsWith("\u72B6\u6001\u5237\u65B0\u5931\u8D25") ? C.red : C.green, fontSize: 11, marginTop: 8 } }, notice) : null;
  return h(
    Card,
    { className: "clustr-workbench" },
    h(
      "div",
      { className: "clustr-workbench-head" },
      h("div", null, h(SectionLabel, { icon: RiWallet3Line }, "ORDERS & POSITIONS"), h("strong", { style: { display: "block", marginTop: 5, fontSize: 16 } }, "\u8BA2\u5355\u4E0E\u6301\u4ED3"), h("p", null, "\u7EDF\u4E00\u67E5\u770B\u5DF2\u8FDE\u63A5\u8D26\u6237\u7684\u5F53\u524D\u6301\u4ED3\u3001\u4EA4\u6613\u6240\u59D4\u6258\u548C Clustr \u8DDF\u8E2A\u7684\u8BA2\u5355\u72B6\u6001\u3002\u5F85\u786E\u8BA4\u8BA2\u5355\u53EA\u4F1A\u67E5\u8BE2\u72B6\u6001\uFF0C\u4E0D\u4F1A\u81EA\u52A8\u91CD\u590D\u4E0B\u5355\u3002")),
      h(
        "div",
        { className: "clustr-workbench-actions" },
        h("button", { className: "clustr-btn", onClick: onRefresh, disabled: busy }, action === "refresh" ? "\u6B63\u5728\u5237\u65B0\u2026" : "\u5237\u65B0\u8D26\u6237\u72B6\u6001"),
        h("button", { className: "clustr-btn primary", onClick: onReconcile, disabled: busy || Number(metrics.reconciliationOrders ?? 0) === 0 }, action === "reconcile" ? "\u6B63\u5728\u6838\u5BF9\u2026" : `\u6838\u5BF9\u5F85\u786E\u8BA4\u8BA2\u5355${Number(metrics.reconciliationOrders ?? 0) ? ` \xB7 ${metrics.reconciliationOrders}` : ""}`)
      )
    ),
    h(
      "div",
      { className: "clustr-workbench-metrics" },
      h("div", { className: "clustr-tape-metric" }, h("small", null, "\u5DF2\u8FDE\u63A5\u8D26\u6237"), h("strong", null, metrics.connectedAccounts ?? 0)),
      h("div", { className: "clustr-tape-metric" }, h("small", null, "\u5F53\u524D\u6301\u4ED3"), h("strong", null, metrics.positions ?? positions.length)),
      h("div", { className: "clustr-tape-metric" }, h("small", null, "\u5F53\u524D\u59D4\u6258"), h("strong", null, metrics.openOrders ?? openOrders.length)),
      h("div", { className: "clustr-tape-metric" }, h("small", null, "\u7B49\u5F85\u6838\u5BF9"), h("strong", { style: { color: Number(metrics.reconciliationOrders ?? 0) ? C.yellow : C.green } }, metrics.reconciliationOrders ?? 0))
    ),
    h("div", { className: "clustr-workbench-tabs", role: "tablist", "aria-label": "\u8BA2\u5355\u4E0E\u6301\u4ED3\u89C6\u56FE" }, ...tabs.map((item) => h("button", { key: item.id, className: "clustr-workbench-tab", role: "tab", "aria-selected": tab === item.id, onClick: () => setTab(item.id) }, item.label))),
    tab === "positions" ? h(PositionsTable, { positions }) : tab === "orders" ? h(OrdersTable, { orders: openOrders }) : h(LifecycleTable, { orders: trackedOrders }),
    workspace?.unavailable ? h("div", { role: "alert", style: { color: C.yellow, fontSize: 11, marginTop: 8 } }, "\u8BA2\u5355\u4E0E\u6301\u4ED3\u6682\u65F6\u65E0\u6CD5\u8BFB\u53D6\u3002\u5DF2\u6709\u8BA2\u5355\u4E0D\u4F1A\u88AB\u89C6\u4E3A\u7A7A\u8BB0\u5F55\u3002") : statusNotice
  );
}
function PositionsTable({ positions }) {
  if (!positions.length) return h("div", { className: "clustr-empty" }, "\u5F53\u524D\u6CA1\u6709\u53EF\u663E\u793A\u7684\u6301\u4ED3\u3002\u8FDE\u63A5\u8D26\u6237\u540E\uFF0C\u8FD9\u91CC\u4F1A\u6309\u4EA4\u6613\u6240\u548C\u8D26\u6237\u5206\u522B\u5C55\u793A\u3002");
  return h("div", { className: "clustr-table-wrap" }, h(
    "table",
    { className: "clustr-table" },
    h("thead", null, h("tr", null, h("th", null, "\u8D26\u6237"), h("th", null, "\u4EA4\u6613\u6807\u7684"), h("th", null, "\u65B9\u5411 / \u6570\u91CF"), h("th", null, "\u5F00\u4ED3\u4EF7 / \u6807\u8BB0\u4EF7"), h("th", null, "\u6D6E\u52A8\u76C8\u4E8F"), h("th", null, "\u6760\u6746 / \u5F3A\u5E73\u4EF7"))),
    h("tbody", null, ...positions.map((position, index) => h(
      "tr",
      { key: `${position.exchange}:${position.profile}:${position.symbol}:${index}` },
      h("td", null, h("strong", null, EXCHANGE_NAMES[position.exchange] ?? position.exchange), h("small", { style: { display: "block", color: C.dim } }, position.profile)),
      h("td", null, h("strong", null, position.symbol), h("small", { style: { display: "block", color: C.dim } }, MARKET_LABELS[position.marketType] ?? position.marketType)),
      h("td", null, h("span", { style: { color: ["long", "buy"].includes(position.side) ? C.green : C.red } }, sideLabel(position.side)), h("small", { style: { display: "block", color: C.dim } }, formatNumber(position.size))),
      h("td", null, `${formatNumber(position.entryPrice)} / ${formatNumber(position.markPrice)}`),
      h("td", { style: { color: Number(position.unrealizedPnl) >= 0 ? C.green : C.red } }, formatNumber(position.unrealizedPnl)),
      h("td", null, `${position.leverage != null ? `${formatNumber(position.leverage)}\xD7` : "\u2014"} / ${formatNumber(position.liquidationPrice)}`)
    )))
  ));
}
function OrdersTable({ orders }) {
  if (!orders.length) return h("div", { className: "clustr-empty" }, "\u5F53\u524D\u6CA1\u6709\u672A\u5B8C\u6210\u59D4\u6258\uFF0C\u4E5F\u6CA1\u6709\u7B49\u5F85\u4EA4\u6613\u6240\u786E\u8BA4\u7684\u8BA2\u5355\u3002");
  return h("div", { className: "clustr-table-wrap" }, h(
    "table",
    { className: "clustr-table" },
    h("thead", null, h("tr", null, h("th", null, "\u8D26\u6237"), h("th", null, "\u4EA4\u6613\u6807\u7684"), h("th", null, "\u65B9\u5411 / \u7C7B\u578B"), h("th", null, "\u6570\u91CF / \u5DF2\u6210\u4EA4"), h("th", null, "\u59D4\u6258\u4EF7 / \u6210\u4EA4\u5747\u4EF7"), h("th", null, "\u72B6\u6001"), h("th", null, "\u66F4\u65B0\u65F6\u95F4"))),
    h(
      "tbody",
      null,
      ...orders.map((order, index) => {
        const status = orderStatus(order.status);
        return h(
          "tr",
          { key: `${order.exchange}:${order.clientOrderId || order.id}:${index}` },
          h("td", null, h("strong", null, EXCHANGE_NAMES[order.exchange] ?? order.exchange), h("small", { style: { display: "block", color: C.dim } }, order.profile || "default")),
          h("td", null, h("strong", null, order.symbol), h("small", { className: "clustr-order-id", title: order.clientOrderId || order.id }, compactId(order.clientOrderId || order.id))),
          h("td", null, sideLabel(order.side), h("small", { style: { display: "block", color: C.dim } }, order.orderType || "\u2014")),
          h("td", null, `${formatNumber(order.size)} / ${formatNumber(order.filledSize)}`),
          h("td", null, `${formatNumber(order.price)} / ${formatNumber(order.averageFillPrice)}`),
          h("td", null, h("span", { className: "clustr-status", style: { color: status.color } }, "\u25CF", status.label)),
          h("td", null, formatTime(order.updatedAt ?? order.createdAt))
        );
      })
    )
  ));
}
function LifecycleTable({ orders }) {
  if (!orders.length) return h("div", { className: "clustr-empty" }, "\u672C\u4F1A\u8BDD\u8FD8\u6CA1\u6709\u7531 Clustr \u8DDF\u8E2A\u7684\u8BA2\u5355\u3002");
  return h("div", { className: "clustr-table-wrap" }, h(
    "table",
    { className: "clustr-table" },
    h("thead", null, h("tr", null, h("th", null, "\u4EA4\u6613\u6807\u7684"), h("th", null, "\u8BA2\u5355\u7F16\u53F7"), h("th", null, "\u72B6\u6001"), h("th", null, "\u6838\u5BF9\u6B21\u6570"), h("th", null, "\u6700\u8FD1\u53D8\u5316"), h("th", null, "\u72B6\u6001\u6765\u6E90"))),
    h(
      "tbody",
      null,
      ...orders.map((order) => {
        const status = orderStatus(order.status);
        const latest = order.timeline?.[order.timeline.length - 1];
        return h(
          "tr",
          { key: order.lifecycleId },
          h("td", null, h("strong", null, `${EXCHANGE_NAMES[order.exchange] ?? order.exchange} \xB7 ${order.symbol}`), h("small", { style: { display: "block", color: C.dim } }, `${sideLabel(order.side)} \xB7 ${order.orderType || "\u2014"}`)),
          h("td", { className: "clustr-order-id", title: order.clientOrderId }, compactId(order.clientOrderId)),
          h("td", null, h("span", { className: "clustr-status", style: { color: status.color } }, "\u25CF", status.label)),
          h("td", null, order.reconciliation?.attempts ?? 0),
          h("td", null, latest?.reason || "\u72B6\u6001\u5DF2\u66F4\u65B0"),
          h("td", null, latest?.source === "exchange-reconciliation" ? "\u4EA4\u6613\u6240\u6838\u5BF9" : latest?.source === "exchange" ? "\u4EA4\u6613\u6240\u54CD\u5E94" : latest?.source === "approval" ? "\u7528\u6237\u6279\u51C6" : "Clustr")
        );
      })
    )
  ));
}
function AnalysisResult({ result }) {
  const signalColor = result.signal === "bullish" ? C.green : result.signal === "bearish" ? C.red : C.yellow;
  const references = Array.isArray(result.references) ? result.references.map((item) => item.title).join(" \xB7 ") : "";
  return h(
    "div",
    { className: "clustr-analysis-result" },
    h("div", { className: "clustr-analysis-summary" }, h("strong", { style: { color: signalColor } }, result.signalLabel), h("small", { style: { color: C.dim } }, `${result.candleCount} \u6839 K \u7EBF \xB7 ${result.methodology}`)),
    h(
      "div",
      { className: "clustr-evidence-grid" },
      h("div", { className: "clustr-evidence-box" }, h("small", null, "\u652F\u6301\u8BC1\u636E"), (result.evidence ?? []).length ? h("ul", null, ...(result.evidence ?? []).slice(0, 5).map((item, index) => h("li", { key: index }, item))) : h("p", { style: { color: C.dim, fontSize: 10 } }, "\u6CA1\u6709\u8DB3\u591F\u7684\u540C\u5411\u8BC1\u636E\u3002")),
      h("div", { className: "clustr-evidence-box" }, h("small", null, "\u53CD\u8BC1\u4E0E\u9650\u5236"), (result.counterEvidence ?? []).length ? h("ul", null, ...(result.counterEvidence ?? []).slice(0, 5).map((item, index) => h("li", { key: index }, item))) : h("p", { style: { color: C.dim, fontSize: 10 } }, "\u5F53\u524D\u89C4\u5219\u6CA1\u6709\u8BC6\u522B\u5230\u989D\u5916\u53CD\u8BC1\u3002"))
    ),
    (result.levels ?? []).length ? h("div", { className: "clustr-levels", "aria-label": "\u5173\u952E\u4EF7\u683C\u4F4D" }, ...(result.levels ?? []).slice(0, 8).map((item, index) => h("span", { className: "clustr-level", key: `${item.label}:${index}` }, `${item.label} ${formatNumber(item.price)}`))) : null,
    h("div", { className: "clustr-analysis-status" }, h("strong", null, "\u5931\u6548\u6761\u4EF6\uFF1A"), result.invalidation),
    h("div", { className: "clustr-analysis-status", style: { color: C.dim, fontSize: 9 } }, `${result.disclaimer}${references ? ` \xB7 \u516C\u5F0F\u6838\u5BF9\uFF1A${references}` : ""}`)
  );
}
function tapeStatus(status) {
  const value = String(status ?? "unknown").toLowerCase();
  if (["ok", "accepted", "filled", "reconciled"].includes(value)) return { label: value === "filled" ? "\u5DF2\u6210\u4EA4" : value === "reconciled" ? "\u5DF2\u6838\u5BF9" : "\u5DF2\u63A5\u53D7", color: C.green };
  if (["rejected", "denied", "error", "canceled"].includes(value)) return { label: value === "denied" ? "\u672A\u6279\u51C6" : value === "canceled" ? "\u5DF2\u53D6\u6D88" : "\u88AB\u62D2\u7EDD", color: value === "error" ? C.red : C.yellow };
  return { label: value === "received" ? "\u5904\u7406\u4E2D" : "\u5F85\u6838\u5BF9", color: C.yellow };
}
function tapeAction(command = {}) {
  const action = { place: "\u4E0B\u5355", cancel: "\u64A4\u5355", close: "\u5E73\u4ED3", amend: "\u6539\u5355" }[command.action] ?? command.action ?? "\u4EA4\u6613\u6307\u4EE4";
  const side = command.side ? ` \xB7 ${{ buy: "\u4E70\u5165", sell: "\u5356\u51FA", long: "\u591A\u5934", short: "\u7A7A\u5934" }[command.side] ?? command.side}` : "";
  return `${action}${side}${command.size ? ` \xB7 ${command.size}` : ""}`;
}
function formatMs(value) {
  if (value == null || value === "") return "\u2014";
  const number = Number(value);
  if (!Number.isFinite(number)) return "\u2014";
  return number < 1e3 ? `${Math.round(number)} ms` : `${(number / 1e3).toFixed(number < 1e4 ? 2 : 1)} s`;
}
function SessionTapePanel({ tape }) {
  const entries = Array.isArray(tape?.entries) ? tape.entries : [];
  const metrics = tape?.metrics ?? {};
  const measured = Number(metrics.measuredSlippageSamples ?? 0);
  return h(
    Card,
    { className: "clustr-tape" },
    h("div", { className: "clustr-tape-head" }, h("div", null, h(SectionLabel, { icon: RiHistoryLine }, "SESSION TAPE"), h("strong", { style: { display: "block", marginTop: 5, fontSize: 15 } }, "\u4EA4\u6613\u6307\u4EE4\u56DE\u653E")), h(Pill, { kind: entries.length ? "ok" : "" }, `${entries.length} \u6761\u8BB0\u5F55`)),
    h(
      "div",
      { className: "clustr-tape-metrics" },
      h("div", { className: "clustr-tape-metric" }, h("small", null, "\u672C\u4F1A\u8BDD\u4EA4\u6613\u6307\u4EE4"), h("strong", null, metrics.commands ?? 0)),
      h("div", { className: "clustr-tape-metric" }, h("small", null, "\u54CD\u5E94\u65F6\u95F4 P50"), h("strong", null, formatMs(metrics.responseP50Ms))),
      h("div", { className: "clustr-tape-metric" }, h("small", null, "\u54CD\u5E94\u65F6\u95F4 P95"), h("strong", null, formatMs(metrics.responseP95Ms))),
      h("div", { className: "clustr-tape-metric" }, h("small", null, `\u53EF\u6838\u9A8C\u6210\u4EA4\u6ED1\u70B9 \xB7 ${measured} \u6837\u672C`), h("strong", null, measured ? `${Number(metrics.averageMeasuredSlippageBps).toFixed(2)} bps` : "\u2014"))
    ),
    entries.length ? h("div", { className: "clustr-tape-list" }, ...entries.map((entry) => {
      const status = tapeStatus(entry.status);
      const rawSlippage = entry.metrics?.slippageBps;
      const slippage = Number(rawSlippage);
      const hasSlippage = rawSlippage != null && Number.isFinite(slippage);
      return h(
        "details",
        { className: "clustr-tape-entry", key: entry.id },
        h(
          "summary",
          null,
          h("span", { style: { color: C.dim } }, entry.startedAt ? new Date(entry.startedAt).toLocaleTimeString() : "\u2014"),
          h("span", null, h("strong", null, `${String(entry.command?.exchange ?? "").toUpperCase()} ${entry.command?.instrument ?? "\u2014"}`), h("small", { style: { display: "block", color: C.dim, marginTop: 2 } }, tapeAction(entry.command))),
          h("span", { style: { color: status.color } }, `\u25CF ${status.label}`),
          h("span", null, formatMs(entry.metrics?.responseTimeMs)),
          h("span", { style: { color: hasSlippage && slippage > 0 ? C.red : C.sub } }, hasSlippage ? `${slippage.toFixed(2)} bps` : "\u6ED1\u70B9\u5F85\u6838\u9A8C")
        ),
        h("div", { className: "clustr-tape-stages" }, ...(entry.stages ?? []).map((stage, index) => h(
          "div",
          { className: "clustr-tape-stage", key: `${stage.name}:${index}` },
          h("span", { style: { color: C.dim } }, `+${formatMs(stage.offsetMs)}`),
          h("span", null, stage.label),
          h("span", { style: { color: tapeStatus(stage.status).color } }, stage.details?.reason || stage.details?.exchangeState || stage.status)
        )))
      );
    })) : h("div", { className: "clustr-analysis-status" }, tape?.unavailable ? "Session Tape \u6682\u65F6\u65E0\u6CD5\u8BFB\u53D6\uFF1B\u4E0D\u4F1A\u56E0\u6B64\u628A\u4F1A\u8BDD\u8BEF\u5224\u4E3A\u7A7A\u8BB0\u5F55\u3002" : "\u672C\u4F1A\u8BDD\u8FD8\u6CA1\u6709\u53D1\u9001\u4EA4\u6613\u6307\u4EE4\u3002\u5E02\u573A\u5206\u6790\u4E0E\u8D26\u6237\u67E5\u8BE2\u4E0D\u4F1A\u8BA1\u5165\u4EA4\u6613\u56DE\u653E\u3002"),
    h("p", { className: "clustr-tape-note" }, "\u54CD\u5E94\u65F6\u95F4\u4ECE\u4EA4\u6613\u5DE5\u5177\u63A5\u6536\u6307\u4EE4\u5F00\u59CB\u8BA1\u7B97\uFF0C\u5305\u542B\u98CE\u63A7\u3001\u7528\u6237\u5BA1\u6279\u4E0E\u4EA4\u6613\u6240\u54CD\u5E94\u3002\u6ED1\u70B9\u53EA\u5728\u4EA4\u6613\u6240\u8FD4\u56DE\u53EF\u6838\u9A8C\u6210\u4EA4\u5747\u4EF7\u540E\u8BA1\u7B97\uFF1B\u6CA1\u6709\u6210\u4EA4\u6837\u672C\u65F6\u4FDD\u6301\u4E3A\u7A7A\u3002")
  );
}
function AccountSummary({ account }) {
  const balances = Array.isArray(account.balances) ? account.balances : [];
  const positions = Array.isArray(account.positions) ? account.positions : [];
  const stateColor = account.readStatus === "ready" ? C.green : account.readStatus === "partial" ? C.yellow : C.red;
  const stateLabel = account.readStatus === "ready" ? "\u8D26\u6237\u53EF\u8BFB" : account.readStatus === "partial" ? "\u90E8\u5206\u6570\u636E\u53EF\u8BFB" : "\u8BFB\u53D6\u5F02\u5E38";
  return h(
    "div",
    { className: "clustr-account-card" },
    h("div", { className: "clustr-account-head" }, h("div", null, h(ExchangeLogo, { exchange: account.exchange }), h("small", { style: { display: "block", color: C.dim, marginTop: 3 } }, account.profile)), h("span", { style: { color: stateColor, fontSize: 10 } }, `\u25CF ${stateLabel}`)),
    h("div", { className: "clustr-account-metric" }, account.totalEquityUsd != null ? `${formatNumber(account.totalEquityUsd)} USD` : "\u8D44\u4EA7\u660E\u7EC6"),
    h("div", { style: { color: C.dim, fontSize: 10, margin: "2px 0 7px" } }, `${balances.length} \u9879\u4F59\u989D \xB7 ${positions.length} \u4E2A\u6301\u4ED3`),
    ...balances.slice(0, 3).map((row, index) => h("div", { className: "clustr-mini-row", key: `b:${index}` }, h("span", null, `${row.asset} \xB7 ${row.accountType}`), h("span", null, formatNumber(row.total)))),
    ...positions.slice(0, 3).map((row, index) => h("div", { className: "clustr-mini-row", key: `p:${index}` }, h("span", null, `${row.symbol} \xB7 ${row.side}`), h("span", { style: { color: Number(row.unrealizedPnl) >= 0 ? C.green : C.red } }, formatNumber(row.size)))),
    account.errors?.length ? h("div", { role: "status", style: { color: C.yellow, fontSize: 10, marginTop: 7, lineHeight: 1.5 } }, account.errors[0].reason) : null
  );
}
function marketOptions(exchange) {
  const values = {
    okx: [["all", "\u5168\u90E8\u5E02\u573A"], ["spot", "\u73B0\u8D27"], ["swap", "\u6C38\u7EED"]],
    binance: [["all", "\u5168\u90E8\u5E02\u573A"], ["spot", "\u73B0\u8D27"], ["usd-m-futures", "U \u672C\u4F4D\u6C38\u7EED"]],
    bybit: [["all", "\u5168\u90E8\u5E02\u573A"], ["spot", "\u73B0\u8D27"], ["linear", "U \u672C\u4F4D"], ["inverse", "\u5E01\u672C\u4F4D"]],
    hyperliquid: [["all", "\u5168\u90E8\u5E02\u573A"], ["perpetual", "\u6C38\u7EED"], ["spot", "\u73B0\u8D27"]]
  };
  return (values[exchange] ?? values.okx).map(([value, label]) => ({ value, label }));
}
function defaultMarket(exchange) {
  return exchange === "hyperliquid" ? "perpetual" : "spot";
}
function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "\u2014";
  return Math.abs(number) >= 1e3 ? number.toLocaleString(void 0, { maximumFractionDigits: 2 }) : number.toLocaleString(void 0, { maximumFractionDigits: 6 });
}
function SettingsPage() {
  const [status, setStatus] = React4.useState(null);
  const [exchangeData, setExchangeData] = React4.useState(null);
  const [exchange, setExchange] = React4.useState("okx");
  const [profile, setProfile] = React4.useState("demo");
  const [apiKey, setApiKey] = React4.useState("");
  const [secretKey, setSecretKey] = React4.useState("");
  const [bybitTestnet, setBybitTestnet] = React4.useState(false);
  const [passphrase, setPassphrase] = React4.useState("");
  const [accountAddress, setAccountAddress] = React4.useState("");
  const [notice, setNotice] = React4.useState(null);
  const [accountOverview, setAccountOverview] = React4.useState(null);
  const [sessionBinding, setSessionBinding] = React4.useState(null);
  const [busy, setBusy] = React4.useState(false);
  const [executionDuration, setExecutionDuration] = React4.useState("60");
  const [executionInstruments, setExecutionInstruments] = React4.useState("");
  const [executionMaxOrders, setExecutionMaxOrders] = React4.useState("1");
  const [executionMaxRisk, setExecutionMaxRisk] = React4.useState("1");
  const [executionExchange, setExecutionExchange] = React4.useState("okx");
  const [executionProfile, setExecutionProfile] = React4.useState("demo");
  const load = React4.useCallback(async () => {
    const nextStatus = await get("/api/crypto/status");
    setStatus(nextStatus);
    const [nextExchangeData, nextSessionBinding] = await Promise.all([
      get("/api/clustr/exchanges"),
      get("/api/crypto/session").catch((cause) => ({ bindingState: "query_error", error: String(cause?.message ?? cause) }))
    ]);
    setExchangeData(nextExchangeData);
    setSessionBinding(nextSessionBinding);
    setAccountOverview(null);
    const overview = await post("/api/clustr/accounts/overview", {}, nextStatus.csrfToken);
    setAccountOverview(Array.isArray(overview?.accounts) ? overview.accounts : []);
  }, []);
  React4.useEffect(() => {
    load().catch((cause) => setNotice({ error: true, text: String(cause?.message ?? cause) }));
  }, [load]);
  React4.useEffect(() => {
    setProfile(exchange === "okx" ? String(status?.profile ?? "demo").toLowerCase() : "default");
    setApiKey("");
    setSecretKey("");
    setPassphrase("");
    setAccountAddress("");
    setNotice(null);
  }, [exchange, status?.profile]);
  React4.useEffect(() => {
    if (!executionInstruments && Array.isArray(status?.watchlist)) setExecutionInstruments(status.watchlist.join(", "));
    if (status?.risk?.maxRiskPerTradePercent != null) setExecutionMaxRisk(String(status.risk.maxRiskPerTradePercent));
  }, [status?.watchlist, status?.risk?.maxRiskPerTradePercent, executionInstruments]);
  const providers = Array.isArray(exchangeData?.providers) ? exchangeData.providers : [];
  const accounts = Array.isArray(exchangeData?.accounts) ? exchangeData.accounts : [];
  const selectedProvider = providers.find((provider) => provider.id === exchange);
  const selectedUnavailable = selectedProvider?.availability === "unavailable";
  const vaultState = exchangeData?.vault?.state ?? status?.vault?.state ?? "unknown";
  const vaultLabel = vaultState === "unavailable" ? "\u5B89\u5168\u4FDD\u9669\u5E93\u4E0D\u53EF\u7528" : exchangeData?.vaultBackend ?? status?.vaultBackend ?? "\u7CFB\u7EDF\u5B89\u5168\u4FDD\u9669\u5E93";
  const overviewRows = Array.isArray(accountOverview) ? accountOverview : [];
  const executableAccounts = React4.useMemo(() => overviewRows.filter((account) => ["okx", "binance"].includes(account.exchange) && account.connected === true && ["ready", "partial"].includes(account.readStatus) && account.security?.highRisk !== true && account.security?.canTrade === true), [accountOverview]);
  const connectionRows = providers.flatMap((provider) => {
    const matches = accounts.filter((account) => account.exchange === provider.id && account.connected);
    return matches.length > 0 ? matches.map((account) => ({ provider, account: { ...account, ...overviewRows.find((row) => row.exchange === account.exchange && row.profile === account.profile) ?? {} } })) : [{ provider, account: null }];
  });
  React4.useEffect(() => {
    const activeExchange = status?.executionMode?.exchange;
    const activeProfile = status?.executionMode?.profile;
    const active = executableAccounts.find((item) => item.exchange === activeExchange && item.profile === activeProfile);
    const selected = active ?? executableAccounts.find((item) => item.exchange === executionExchange && item.profile === executionProfile) ?? executableAccounts[0];
    if (selected) {
      setExecutionExchange(selected.exchange);
      setExecutionProfile(selected.profile);
    }
  }, [status?.executionMode?.exchange, status?.executionMode?.profile, executionExchange, executionProfile, executableAccounts]);
  React4.useEffect(() => {
    if (status?.readOnly === false) return;
    setExecutionInstruments(executionExchange === "binance" ? "BTCUSDT, ETHUSDT" : Array.isArray(status?.watchlist) ? status.watchlist.join(", ") : "BTC-USDT, ETH-USDT-SWAP");
  }, [executionExchange, status?.readOnly]);
  const credentials = () => exchange === "okx" ? { apiKey, secretKey, passphrase } : exchange === "hyperliquid" ? { accountAddress } : exchange === "bybit" ? { apiKey, secretKey, testnet: bybitTestnet } : { apiKey, secretKey };
  const clearSecretInputs = () => {
    setApiKey("");
    setSecretKey("");
    setPassphrase("");
  };
  const verify = async () => {
    try {
      setBusy(true);
      setNotice({ text: "\u6B63\u5728\u9A8C\u8BC1\u4EA4\u6613\u6240\u8FDE\u63A5\u4E0E\u6743\u9650\u2026" });
      const result = await post("/api/clustr/credentials/verify", { exchange, profile, credentials: credentials() }, status.csrfToken);
      const partial = result.verification?.readStatus === "partial";
      setNotice({ text: partial ? "\u8FDE\u63A5\u9A8C\u8BC1\u901A\u8FC7\uFF1B\u90E8\u5206\u8D26\u6237\u8303\u56F4\u4E0D\u53EF\u8BFB\uFF0C\u8BF7\u68C0\u67E5\u5BF9\u5E94\u6743\u9650\u3002" : "\u8FDE\u63A5\u4E0E\u6743\u9650\u9A8C\u8BC1\u901A\u8FC7\u3002" });
    } catch (cause) {
      clearSecretInputs();
      setNotice({ error: true, text: String(cause?.message ?? cause) });
    } finally {
      setBusy(false);
    }
  };
  const save = async () => {
    try {
      setBusy(true);
      setNotice({ text: "\u6B63\u5728\u9A8C\u8BC1\u5E76\u5B89\u5168\u4FDD\u5B58\u2026" });
      const result = await post("/api/clustr/credentials/save", { exchange, profile, credentials: credentials() }, status.csrfToken);
      setApiKey("");
      setSecretKey("");
      setPassphrase("");
      setAccountAddress("");
      setNotice({ text: result.message });
      await load();
    } catch (cause) {
      clearSecretInputs();
      setNotice({ error: true, text: String(cause?.message ?? cause) });
    } finally {
      setBusy(false);
    }
  };
  const remove = async (account) => {
    try {
      await post("/api/clustr/credentials/remove", account, status.csrfToken);
      setNotice({ text: "\u8FDE\u63A5\u5DF2\u79FB\u9664\u3002" });
      await load();
    } catch (cause) {
      setNotice({ error: true, text: String(cause?.message ?? cause) });
    }
  };
  const toggleKillSwitch = async () => {
    const active = status?.killSwitch?.active === true;
    const confirmed = window.confirm(active ? "\u786E\u8BA4\u6062\u590D\u5199\u64CD\u4F5C\u8D44\u683C\uFF1F\u6062\u590D\u540E\u4ECD\u9700\u901A\u8FC7\u81EA\u4E3B\u6743\u3001\u98CE\u63A7\u548C\u9010\u7B14\u5BA1\u6279\u3002" : "\u786E\u8BA4\u7ACB\u5373\u505C\u6B62\u6240\u6709\u5199\u64CD\u4F5C\uFF1F\u8FD9\u4F1A\u64A4\u9500\u73B0\u6709\u6267\u884C\u8BB8\u53EF\u5E76\u628A\u81EA\u4E3B\u6743\u964D\u4E3A\u89C2\u5BDF\u3002");
    if (!confirmed) return;
    try {
      setBusy(true);
      await post("/api/clustr/kill-switch/set", { active: !active, confirmed: true, reason: active ? "\u7528\u6237\u5728\u8BBE\u7F6E\u4E2D\u6062\u590D" : "\u7528\u6237\u5728\u8BBE\u7F6E\u4E2D\u7D27\u6025\u505C\u6B62", actor: "user" }, status.csrfToken);
      setNotice({ text: active ? "\u5199\u64CD\u4F5C\u8D44\u683C\u5DF2\u6062\u590D\uFF1B\u6240\u6709\u5B89\u5168\u95F8\u95E8\u4ECD\u7136\u6709\u6548\u3002" : "\u7D27\u6025\u505C\u6B62\u5DF2\u542F\u7528\uFF1B\u6240\u6709\u5199\u64CD\u4F5C\u90FD\u4F1A\u88AB\u62D2\u7EDD\u3002" });
      await load();
    } catch (cause) {
      setNotice({ error: true, text: String(cause?.message ?? cause) });
    } finally {
      setBusy(false);
    }
  };
  const toggleExecutionMode = async () => {
    const readOnly = status?.readOnly !== false;
    if (readOnly) {
      const instruments = executionInstruments.split(/[\s,，]+/).map((item) => item.trim().toUpperCase()).filter(Boolean);
      const exchangeName = EXCHANGE_NAMES[executionExchange] ?? executionExchange;
      const confirmed = window.confirm(`\u542F\u7528 ${exchangeName} ${executionProfile} \u8D26\u6237\u7684\u9010\u7B14\u5BA1\u6279\u4EA4\u6613\uFF1F

\u6388\u6743\u8303\u56F4\uFF1A${instruments.join("\u3001") || "\u672A\u8BBE\u7F6E"}
\u6709\u6548\u671F\uFF1A${executionDuration} \u5206\u949F
\u6700\u591A\u8BA2\u5355\uFF1A${executionMaxOrders} \u7B14
\u5355\u7B14\u98CE\u9669\u4E0A\u9650\uFF1A${executionMaxRisk}%

\u6BCF\u7B14\u8BA2\u5355\u4ECD\u9700\u98CE\u9669\u8BB8\u53EF\u548C\u5355\u6B21\u5BA1\u6279\uFF1B\u63D0\u73B0\u4E0E\u5212\u8F6C\u4FDD\u6301\u7981\u7528\u3002`);
      if (!confirmed) return;
      try {
        setBusy(true);
        setNotice({ text: "\u6B63\u5728\u9A8C\u8BC1\u6267\u884C\u8D26\u6237\u3001\u6743\u9650\u4E0E\u4EA4\u6613\u5DE5\u5177\u2026" });
        const result = await post("/api/clustr/execution-mode/set", { readOnly: false, confirmed: true, exchange: executionExchange, profile: executionProfile, durationMinutes: Number(executionDuration), instruments, maxOrders: Number(executionMaxOrders), maxRiskPercent: Number(executionMaxRisk), reason: "\u7528\u6237\u5728 Clustr \u8BBE\u7F6E\u4E2D\u660E\u786E\u542F\u7528\u9010\u7B14\u5BA1\u6279\u4EA4\u6613", actor: "user" }, status.csrfToken);
        setNotice({ text: result.message });
        await load();
      } catch (cause) {
        setNotice({ error: true, text: String(cause?.message ?? cause) });
      } finally {
        setBusy(false);
      }
      return;
    }
    if (!window.confirm("\u7ACB\u5373\u6062\u590D\u53EA\u8BFB\u4FDD\u62A4\uFF1F\u6240\u6709\u5C1A\u672A\u4F7F\u7528\u7684\u6267\u884C\u8BB8\u53EF\u4F1A\u88AB\u64A4\u9500\uFF0C\u81EA\u4E3B\u6743\u4F1A\u964D\u4E3A\u89C2\u5BDF\u3002\u5DF2\u7ECF\u63D0\u4EA4\u5230\u4EA4\u6613\u6240\u7684\u8BA2\u5355\u4E0D\u4F1A\u88AB\u81EA\u52A8\u53D6\u6D88\u3002")) return;
    try {
      setBusy(true);
      const result = await post("/api/clustr/execution-mode/set", { readOnly: true, confirmed: true, reason: "\u7528\u6237\u5728 Clustr \u8BBE\u7F6E\u4E2D\u6062\u590D\u53EA\u8BFB\u4FDD\u62A4", actor: "user" }, status.csrfToken);
      setNotice({ text: result.message });
      await load();
    } catch (cause) {
      setNotice({ error: true, text: String(cause?.message ?? cause) });
    } finally {
      setBusy(false);
    }
  };
  const checkNetworkEgress = async () => {
    try {
      setBusy(true);
      setNotice({ text: "\u6B63\u5728\u67E5\u8BE2\u5F53\u524D\u7F51\u7EDC\u51FA\u53E3\u2026" });
      const result = await post("/api/clustr/network/egress", {}, status.csrfToken);
      setNotice({ text: `\u5F53\u524D\u7F51\u7EDC\u51FA\u53E3 IP\uFF1A${result.ip}` });
    } catch (cause) {
      setNotice({ error: true, text: String(cause?.message ?? cause) });
    } finally {
      setBusy(false);
    }
  };
  const unbindSession = async () => {
    if (!sessionBinding?.sessionId || !window.confirm("\u89E3\u9664\u4E13\u5C5E\u4EA4\u6613\u4F1A\u8BDD\uFF1F\u63A7\u5236\u53F0\u4F1A\u7ACB\u5373\u9501\u5B9A\uFF0C\u8D26\u6237\u8FDE\u63A5\u4E0E\u5BF9\u8BDD\u8BB0\u5F55\u4ECD\u7136\u4FDD\u7559\u3002")) return;
    try {
      setBusy(true);
      await post("/api/crypto/session/unbind", { sessionId: sessionBinding.sessionId }, status.csrfToken);
      setNotice({ text: "\u4E13\u5C5E\u4EA4\u6613\u4F1A\u8BDD\u5DF2\u89E3\u9664\u3002" });
      await load();
    } catch (cause) {
      setNotice({ error: true, text: String(cause?.message ?? cause) });
    } finally {
      setBusy(false);
    }
  };
  const bindingLabel = sessionBinding?.bindingState === "bound" ? "\u5DF2\u542F\u7528" : sessionBinding?.bindingState === "invalid" ? "\u6A21\u5F0F\u4E0D\u5339\u914D" : sessionBinding?.bindingState === "query_error" ? "\u72B6\u6001\u8BFB\u53D6\u5F02\u5E38" : "\u5C1A\u672A\u542F\u7528";
  const bindingColor = sessionBinding?.bindingState === "bound" ? C.green : sessionBinding?.bindingState === "unbound" ? C.dim : C.yellow;
  const valid = !selectedUnavailable && status && profile && apiKey && secretKey && (exchange !== "okx" || passphrase);
  return h(React4.Fragment, null, h(Styles), h("div", { className: "clustr-shell", style: { ...FONT, minHeight: 520 } }, h(
    "div",
    { className: "clustr-layer" },
    h("div", { className: "clustr-head" }, h(Brand), h("div", { className: "clustr-pills" }, h(Pill, { kind: vaultState === "unavailable" ? "warn" : "ok" }, vaultLabel), h(Pill, { kind: status?.killSwitch?.active ? "warn" : status?.readOnly !== false ? "warn" : "ok" }, status?.killSwitch?.active ? "\u7D27\u6025\u505C\u6B62" : status?.readOnly !== false ? "\u9ED8\u8BA4\u53EA\u8BFB" : "\u5BA1\u6279\u4EA4\u6613"))),
    h(
      "div",
      { style: { display: "grid", gridTemplateColumns: "minmax(0,1.35fr) minmax(280px,.65fr)", gap: 12 } },
      h(
        Card,
        null,
        h(SectionLabel, { icon: RiLock2Line }, "SECURE ACCOUNT CONNECTION"),
        h("h2", { style: { margin: "7px 0 8px", fontFamily: "General Sans, Geist Sans, sans-serif" } }, "\u8FDE\u63A5\u4E00\u4E2A\u6216\u591A\u4E2A\u4EA4\u6613\u6240\u8D26\u6237"),
        h("p", { style: { color: C.sub, lineHeight: 1.65, marginTop: 0 } }, `\u6BCF\u4E2A\u8D26\u6237\u4F7F\u7528\u72EC\u7ACB\u540D\u79F0\u4FDD\u5B58\u3002\u51ED\u8BC1\u5199\u5165 ${vaultLabel}\uFF0C\u4E0D\u4F1A\u8FDB\u5165\u804A\u5929\u8BB0\u5F55\u3001\u63D2\u4EF6\u914D\u7F6E\u3001localStorage \u6216\u5BA1\u8BA1\u65E5\u5FD7\u3002\u8D26\u6237\u8BFB\u53D6\u4E0E\u4EA4\u6613\u6267\u884C\u5206\u5F00\u6388\u6743\u3002`),
        vaultState === "unavailable" ? h("div", { role: "alert", style: { color: C.yellow, marginBottom: 12 } }, "\u5F53\u524D\u7CFB\u7EDF\u6CA1\u6709\u53EF\u7528\u7684\u51ED\u8BC1\u4FDD\u9669\u5E93\u3002\u8D26\u6237\u4FDD\u5B58\u4E0E\u79C1\u6709\u63A5\u53E3\u4FDD\u6301\u5173\u95ED\uFF1BClustr \u4E0D\u4F1A\u56DE\u9000\u4E3A\u660E\u6587\u6587\u4EF6\u3002") : null,
        h(
          "div",
          { className: "clustr-form" },
          field("\u4EA4\u6613\u6240\u8D26\u6237", h("select", { className: "clustr-select", value: exchange, onChange: (event) => setExchange(event.target.value), disabled: providers.length === 0 }, providers.length ? providers.map((provider) => h("option", { key: provider.id, value: provider.id }, provider.name)) : h("option", { value: exchange }, "\u6B63\u5728\u8BFB\u53D6\u4EA4\u6613\u6240\u2026"))),
          selectedUnavailable ? h("div", { role: "status", style: { border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px", color: C.sub, lineHeight: 1.65 } }, h("strong", { style: { color: C.yellow, display: "block", marginBottom: 4 } }, "Hyperliquid \u672A\u5F00\u653E"), "\u5F53\u524D\u7248\u672C\u4E0D\u63D0\u4F9B Hyperliquid \u8D26\u6237\u8FDE\u63A5\u3001\u8D26\u6237\u8BFB\u53D6\u6216\u4EA4\u6613\u6267\u884C\u3002\u516C\u5171\u5E02\u573A\u884C\u60C5\u4ECD\u53EF\u5728\u884C\u60C5\u533A\u4F7F\u7528\u3002") : h(
            React4.Fragment,
            null,
            field("\u8D26\u6237\u540D\u79F0", h("input", { className: "clustr-input", value: profile, onChange: (event) => setProfile(event.target.value), placeholder: "default", autoComplete: "off" })),
            field("API Key", h("input", { className: "clustr-input", type: "password", value: apiKey, onChange: (event) => setApiKey(event.target.value), autoComplete: "new-password" })),
            field("Secret Key", h("input", { className: "clustr-input", type: "password", value: secretKey, onChange: (event) => setSecretKey(event.target.value), autoComplete: "new-password" })),
            exchange === "okx" ? field("Passphrase", h("input", { className: "clustr-input", type: "password", value: passphrase, onChange: (event) => setPassphrase(event.target.value), autoComplete: "new-password" })) : null,
            exchange === "bybit" ? field("\u8D26\u6237\u73AF\u5883", h("label", { style: { display: "inline-flex", alignItems: "center", gap: 8, color: C.sub, fontSize: 12 } }, h("input", { type: "checkbox", checked: bybitTestnet, onChange: (event) => setBybitTestnet(event.target.checked) }), "Bybit Testnet")) : null
          )
        ),
        selectedProvider ? h("div", { className: "clustr-cap-grid" }, h(Capability, { label: "\u8D26\u6237\u8BFB\u53D6", value: selectedProvider.accountReadAvailable ? "\u652F\u6301" : "\u5F53\u524D\u4E0D\u53EF\u7528", color: selectedProvider.accountReadAvailable ? C.green : C.dim }), h(Capability, { label: "\u4EA4\u6613\u6267\u884C", value: selectedProvider.executionLabel, color: selectedProvider.executionEnabled ? C.green : C.yellow }), h(Capability, { label: "\u53D7\u4FE1\u8DEF\u5F84", value: selectedProvider.executionPath, color: C.sub })) : null,
        selectedUnavailable ? null : h("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 14 } }, h("button", { className: "clustr-btn", onClick: verify, disabled: !valid || busy }, "\u6D4B\u8BD5\u8FDE\u63A5"), h("button", { className: "clustr-btn primary", onClick: save, disabled: !valid || busy, style: { display: "inline-flex", alignItems: "center", gap: 7 } }, h(RiSafe2Line, { "aria-hidden": true }), "\u9A8C\u8BC1\u5E76\u4FDD\u5B58"), notice ? h("span", { style: { color: notice.error ? C.red : C.green, fontSize: 12 } }, notice.text) : null)
      ),
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 12 } },
        h(Card, null, h(SectionLabel, { icon: RiDatabase2Line, style: { marginBottom: 9 } }, "ACCOUNT CONNECTIONS"), connectionRows.map(({ provider, account }) => {
          const unavailable = provider.availability === "unavailable";
          const pending = !unavailable && account?.connected && accountOverview == null;
          const readable = account?.readStatus === "ready";
          const partial = account?.readStatus === "partial";
          const readLabel = unavailable ? "\u672A\u5F00\u653E" : pending ? "\u6B63\u5728\u8BFB\u53D6" : readable ? "\u8BFB\u53D6\u6B63\u5E38" : partial ? "\u90E8\u5206\u53EF\u8BFB" : account?.connected ? "\u8BFB\u53D6\u5F02\u5E38" : "\u7B49\u5F85\u8FDE\u63A5";
          const execution = account?.execution ?? provider;
          return h("div", { key: `${provider.id}:${account?.profile ?? "provider"}`, className: "clustr-account-card" }, h("div", { className: "clustr-account-head" }, h("div", null, h(ExchangeLogo, { exchange: provider.id }), account?.profile ? h("small", { style: { color: C.dim, display: "block", marginTop: 3 } }, account.profile) : null), account?.connected ? h("button", { className: "clustr-btn danger", onClick: () => remove({ exchange: account.exchange, profile: account.profile }) }, "\u79FB\u9664") : h("span", { style: { color: unavailable ? C.yellow : C.dim, fontSize: 11 } }, unavailable ? "\u672A\u5F00\u653E" : "\u8D26\u6237\u672A\u8FDE\u63A5")), h("div", { className: "clustr-cap-grid" }, h(Capability, { label: "\u8FDE\u63A5", value: unavailable ? "\u672A\u5F00\u653E" : account?.connected ? "\u5DF2\u4FDD\u5B58" : "\u7B49\u5F85\u8FDE\u63A5", color: unavailable ? C.yellow : account?.connected ? C.green : C.dim }), h(Capability, { label: "\u8BFB\u53D6", value: readLabel, color: unavailable ? C.yellow : pending ? C.dim : readable ? C.green : partial ? C.yellow : account?.connected ? C.red : C.dim }), h(Capability, { label: "\u6267\u884C", value: unavailable ? "\u672A\u5F00\u653E" : execution.label ?? execution.executionLabel, color: unavailable ? C.yellow : execution.enabled ?? execution.executionEnabled ? C.green : C.yellow })), account?.errors?.[0]?.reason ? h("p", { style: { color: C.red, fontSize: 11, lineHeight: 1.5, marginBottom: 0 } }, account.errors[0].reason) : null);
        })),
        h(
          Card,
          null,
          h(SectionLabel, { icon: status?.readOnly !== false ? RiLock2Line : RiShieldCheckLine }, "EXECUTION CONTROL"),
          h("h3", { style: { margin: "7px 0 6px", fontSize: 16 } }, status?.readOnly !== false ? "\u53EA\u8BFB\u4FDD\u62A4\u5DF2\u5F00\u542F" : "\u9010\u7B14\u5BA1\u6279\u4EA4\u6613\u5DF2\u5F00\u542F"),
          h("p", { style: { color: C.sub, fontSize: 12, lineHeight: 1.6, margin: "0 0 10px" } }, status?.readOnly !== false ? "\u9009\u62E9\u4E00\u4E2A\u5DF2\u9A8C\u8BC1\u4E14\u5177\u6709\u4EA4\u6613\u6743\u9650\u7684 OKX\u3001Binance \u6216 Bybit \u8D26\u6237\u3002\u6388\u6743\u53EA\u7ED1\u5B9A\u8BE5\u8D26\u6237\uFF1BHyperliquid \u8D26\u6237\u80FD\u529B\u672A\u5F00\u653E\u3002" : `\u6388\u6743\u5C06\u5728 ${status?.executionMode?.expiresAt ? new Date(status.executionMode.expiresAt).toLocaleString() : "\u5F53\u524D\u4F1A\u8BDD\u7ED3\u675F\u524D"} \u81EA\u52A8\u6062\u590D\u53EA\u8BFB\uFF1B\u6BCF\u7B14\u8BA2\u5355\u4ECD\u9700\u72EC\u7ACB\u5BA1\u6279\u3002`),
          status?.readOnly !== false ? h(
            "div",
            { className: "clustr-form" },
            field("\u6267\u884C\u8D26\u6237", h("select", { className: "clustr-select", value: `${executionExchange}:${executionProfile}`, onChange: (event) => {
              const [nextExchange, ...profileParts] = event.target.value.split(":");
              setExecutionExchange(nextExchange);
              setExecutionProfile(profileParts.join(":"));
            }, disabled: executableAccounts.length === 0 }, executableAccounts.length ? executableAccounts.map((account) => h("option", { key: `${account.exchange}:${account.profile}`, value: `${account.exchange}:${account.profile}` }, `${EXCHANGE_NAMES[account.exchange] ?? account.exchange} \xB7 ${account.profile}`)) : h("option", { value: "" }, "\u8BF7\u5148\u8FDE\u63A5\u53EF\u4EA4\u6613\u8D26\u6237"))),
            field("\u6709\u6548\u671F", h("select", { className: "clustr-select", value: executionDuration, onChange: (event) => setExecutionDuration(event.target.value) }, h("option", { value: "30" }, "30 \u5206\u949F"), h("option", { value: "60" }, "1 \u5C0F\u65F6"), h("option", { value: "240" }, "4 \u5C0F\u65F6"), h("option", { value: "480" }, "8 \u5C0F\u65F6"))),
            field("\u6700\u591A\u8BA2\u5355", h("input", { className: "clustr-input", type: "number", min: 1, max: 20, value: executionMaxOrders, onChange: (event) => setExecutionMaxOrders(event.target.value) })),
            field("\u4EA4\u6613\u6807\u7684", h("input", { className: "clustr-input", value: executionInstruments, onChange: (event) => setExecutionInstruments(event.target.value), placeholder: "BTC-USDT, ETH-USDT-SWAP", spellCheck: false })),
            field("\u5355\u7B14\u98CE\u9669\u4E0A\u9650 %", h("input", { className: "clustr-input", type: "number", min: "0.01", step: "0.01", value: executionMaxRisk, onChange: (event) => setExecutionMaxRisk(event.target.value) }))
          ) : h("div", { className: "clustr-cap-grid" }, h(Capability, { label: "\u6267\u884C\u8D26\u6237", value: `${EXCHANGE_NAMES[status?.executionMode?.exchange] ?? status?.executionMode?.exchange} \xB7 ${status?.executionMode?.profile}`, color: C.green }), h(Capability, { label: "\u6267\u884C\u65B9\u5F0F", value: "\u9010\u7B14\u5BA1\u6279", color: C.green }), h(Capability, { label: "\u6267\u884C\u8DEF\u5F84", value: status?.executionMode?.exchange === "binance" ? "Clustr REST" : status?.executionMode?.exchange === "bybit" ? "Official Trading MCP" : "Agent Trade Kit", color: C.sub })),
          status?.executionMode?.state === "error" ? h("p", { role: "alert", style: { color: C.red, fontSize: 11, lineHeight: 1.5 } }, status.executionMode.reason) : null,
          h("button", { className: `clustr-btn ${status?.readOnly !== false ? "primary" : "danger"}`, onClick: toggleExecutionMode, disabled: !status || busy || status.readOnly !== false && (status.executionMode?.allowUnlock !== true || status.killSwitch?.active === true || executableAccounts.length === 0), style: { width: "100%", marginTop: 10 } }, busy ? "\u6B63\u5728\u786E\u8BA4\u2026" : status?.readOnly !== false ? "\u542F\u7528\u9010\u7B14\u5BA1\u6279\u4EA4\u6613" : "\u7ACB\u5373\u6062\u590D\u53EA\u8BFB\u4FDD\u62A4"),
          status?.killSwitch?.active && status?.readOnly !== false ? h("p", { style: { color: C.yellow, fontSize: 11, lineHeight: 1.5, marginBottom: 0 } }, "\u7D27\u6025\u505C\u6B62\u5904\u4E8E\u542F\u7528\u72B6\u6001\u3002\u6062\u590D\u5199\u64CD\u4F5C\u8D44\u683C\u540E\u624D\u80FD\u7533\u8BF7\u9010\u7B14\u5BA1\u6279\u4EA4\u6613\u3002") : null
        ),
        h(
          Card,
          null,
          h(SectionLabel, { icon: RiShieldCheckLine }, "SECURITY BASELINE"),
          h("ul", { style: { color: C.sub, lineHeight: 1.8, paddingLeft: 18, marginBottom: 10, fontSize: 12 } }, h("li", null, "\u7981\u7528 Withdraw / Transfer \u6743\u9650"), h("li", null, "\u4E3A API Key \u914D\u7F6E IP \u767D\u540D\u5355"), h("li", null, "\u4F18\u5148\u4F7F\u7528\u5B50\u8D26\u6237\u4E0E\u53EA\u8BFB\u6743\u9650"), h("li", null, "\u6BCF\u6B21\u4EA4\u6613\u90FD\u7ECF\u8FC7\u98CE\u63A7\u4E0E\u4E00\u6B21\u6027\u5BA1\u6279")),
          h("div", { className: "clustr-cap-grid", style: { marginBottom: 9 } }, h(Capability, { label: "\u4E13\u5C5E\u4EA4\u6613\u4F1A\u8BDD", value: bindingLabel, color: bindingColor })),
          sessionBinding?.sessionId ? h("p", { style: { color: C.dim, fontSize: 11, lineHeight: 1.55, margin: "0 0 9px" } }, sessionBinding.bindingState === "bound" ? "\u4FA7\u680F Clustr \u59CB\u7EC8\u8FD4\u56DE\u5DF2\u542F\u7528\u7684\u4F1A\u8BDD\u3002" : sessionBinding.bindingState === "invalid" ? "\u5DF2\u542F\u7528\u4F1A\u8BDD\u5DF2\u79BB\u5F00 Clustr \u6A21\u5F0F\uFF0C\u5B8C\u6574\u63A7\u5236\u53F0\u4FDD\u6301\u9501\u5B9A\u3002" : "\u5DF2\u542F\u7528\u4F1A\u8BDD\u7684\u72B6\u6001\u6682\u65F6\u65E0\u6CD5\u786E\u8BA4\u3002") : null,
          h(
            "div",
            { style: { display: "grid", gap: 7 } },
            h("button", { className: "clustr-btn", onClick: checkNetworkEgress, disabled: !status || busy, style: { width: "100%" } }, "\u67E5\u8BE2\u5F53\u524D\u7F51\u7EDC\u51FA\u53E3 IP"),
            sessionBinding?.sessionId ? h("button", { className: "clustr-btn", onClick: unbindSession, disabled: !status || busy, style: { width: "100%" } }, "\u89E3\u9664\u4E13\u5C5E\u4EA4\u6613\u4F1A\u8BDD") : null,
            h("button", { className: `clustr-btn ${status?.killSwitch?.active ? "" : "danger"}`, onClick: toggleKillSwitch, disabled: !status || busy, style: { width: "100%" } }, status?.killSwitch?.active ? "\u6062\u590D\u5199\u64CD\u4F5C\u8D44\u683C" : "\u7D27\u6025\u505C\u6B62\u6240\u6709\u5199\u64CD\u4F5C")
          )
        )
      )
    )
  )));
}
function Capability({ label, value, color }) {
  return h("div", { className: "clustr-cap" }, h("small", null, label), h("strong", { style: { color } }, value));
}
function field(label, child) {
  return h("div", { className: "clustr-field" }, h("label", null, label), child);
}
function useClustrContext(sessionId, ctx) {
  const [value, setValue] = React4.useState(null);
  const [revision, setRevision] = React4.useState(0);
  React4.useEffect(() => {
    const currentId = sessionId == null ? "" : String(sessionId);
    const dispose = ctx?.remote?.$on?.("agent-preset/selected", (changedSessionId) => {
      if (String(changedSessionId ?? "") === currentId) setRevision((value2) => value2 + 1);
    });
    return () => {
      if (typeof dispose === "function") dispose();
    };
  }, [ctx, sessionId]);
  React4.useEffect(() => {
    let alive = true;
    const currentId = sessionId == null ? "" : String(sessionId);
    if (!currentId) {
      setValue(false);
      return () => {
        alive = false;
      };
    }
    Promise.all([get(`/api/crypto/session?sessionId=${encodeURIComponent(currentId)}`), get("/api/crypto/status")]).then(([access, status]) => {
      if (alive) setValue(access?.eligible === true && String(access?.sessionId ?? "") === currentId ? status : false);
    }).catch(() => {
      if (alive) setValue(false);
    });
    return () => {
      alive = false;
    };
  }, [sessionId, revision]);
  return value;
}
function ClustrHeaderStatus({ sessionId, ctx }) {
  const status = useClustrContext(sessionId, ctx);
  if (!status) return null;
  return h("span", { title: "Clustr Trading Console \u5B89\u5168\u72B6\u6001", style: { ...FONT, display: "inline-flex", alignItems: "center", gap: 5, border: "1px solid rgba(196,190,255,.25)", borderRadius: 999, padding: "4px 9px", color: C.sub, background: "rgba(166,159,255,.09)", boxShadow: "inset 0 1px rgba(255,255,255,.05)", fontSize: 11 } }, h("span", { style: { color: status.readOnly ? C.yellow : C.green } }, "\u25CF"), status.readOnly ? "Clustr \xB7 \u53EA\u8BFB" : "Clustr \xB7 \u5BA1\u6279\u4EA4\u6613");
}

// src/client/experience.js
var React6 = __toESM(require("react"), 1);

// src/client/scanner.js
var React5 = __toESM(require("react"), 1);

// node_modules/.pnpm/ogl@1.0.11/node_modules/ogl/src/math/functions/Vec3Func.js
function length(a) {
  let x = a[0];
  let y = a[1];
  let z = a[2];
  return Math.sqrt(x * x + y * y + z * z);
}
function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
function set(out, x, y, z) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}
function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}
function multiply(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  return out;
}
function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  return out;
}
function scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  return out;
}
function distance(a, b) {
  let x = b[0] - a[0];
  let y = b[1] - a[1];
  let z = b[2] - a[2];
  return Math.sqrt(x * x + y * y + z * z);
}
function squaredDistance(a, b) {
  let x = b[0] - a[0];
  let y = b[1] - a[1];
  let z = b[2] - a[2];
  return x * x + y * y + z * z;
}
function squaredLength(a) {
  let x = a[0];
  let y = a[1];
  let z = a[2];
  return x * x + y * y + z * z;
}
function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  return out;
}
function inverse(out, a) {
  out[0] = 1 / a[0];
  out[1] = 1 / a[1];
  out[2] = 1 / a[2];
  return out;
}
function normalize(out, a) {
  let x = a[0];
  let y = a[1];
  let z = a[2];
  let len = x * x + y * y + z * z;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }
  out[0] = a[0] * len;
  out[1] = a[1] * len;
  out[2] = a[2] * len;
  return out;
}
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cross(out, a, b) {
  let ax = a[0], ay = a[1], az = a[2];
  let bx = b[0], by = b[1], bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}
function lerp(out, a, b, t) {
  let ax = a[0];
  let ay = a[1];
  let az = a[2];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  return out;
}
function smoothLerp(out, a, b, decay, dt) {
  const exp = Math.exp(-decay * dt);
  let ax = a[0];
  let ay = a[1];
  let az = a[2];
  out[0] = b[0] + (ax - b[0]) * exp;
  out[1] = b[1] + (ay - b[1]) * exp;
  out[2] = b[2] + (az - b[2]) * exp;
  return out;
}
function transformMat4(out, a, m) {
  let x = a[0], y = a[1], z = a[2];
  let w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1;
  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}
function scaleRotateMat4(out, a, m) {
  let x = a[0], y = a[1], z = a[2];
  let w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1;
  out[0] = (m[0] * x + m[4] * y + m[8] * z) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z) / w;
  return out;
}
function transformMat3(out, a, m) {
  let x = a[0], y = a[1], z = a[2];
  out[0] = x * m[0] + y * m[3] + z * m[6];
  out[1] = x * m[1] + y * m[4] + z * m[7];
  out[2] = x * m[2] + y * m[5] + z * m[8];
  return out;
}
function transformQuat(out, a, q) {
  let x = a[0], y = a[1], z = a[2];
  let qx = q[0], qy = q[1], qz = q[2], qw = q[3];
  let uvx = qy * z - qz * y;
  let uvy = qz * x - qx * z;
  let uvz = qx * y - qy * x;
  let uuvx = qy * uvz - qz * uvy;
  let uuvy = qz * uvx - qx * uvz;
  let uuvz = qx * uvy - qy * uvx;
  let w2 = qw * 2;
  uvx *= w2;
  uvy *= w2;
  uvz *= w2;
  uuvx *= 2;
  uuvy *= 2;
  uuvz *= 2;
  out[0] = x + uvx + uuvx;
  out[1] = y + uvy + uuvy;
  out[2] = z + uvz + uuvz;
  return out;
}
var angle = /* @__PURE__ */ (function() {
  const tempA = [0, 0, 0];
  const tempB = [0, 0, 0];
  return function(a, b) {
    copy(tempA, a);
    copy(tempB, b);
    normalize(tempA, tempA);
    normalize(tempB, tempB);
    let cosine = dot(tempA, tempB);
    if (cosine > 1) {
      return 0;
    } else if (cosine < -1) {
      return Math.PI;
    } else {
      return Math.acos(cosine);
    }
  };
})();
function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

// node_modules/.pnpm/ogl@1.0.11/node_modules/ogl/src/math/Vec3.js
var Vec3 = class _Vec3 extends Array {
  constructor(x = 0, y = x, z = x) {
    super(x, y, z);
    return this;
  }
  get x() {
    return this[0];
  }
  get y() {
    return this[1];
  }
  get z() {
    return this[2];
  }
  set x(v) {
    this[0] = v;
  }
  set y(v) {
    this[1] = v;
  }
  set z(v) {
    this[2] = v;
  }
  set(x, y = x, z = x) {
    if (x.length) return this.copy(x);
    set(this, x, y, z);
    return this;
  }
  copy(v) {
    copy(this, v);
    return this;
  }
  add(va, vb) {
    if (vb) add(this, va, vb);
    else add(this, this, va);
    return this;
  }
  sub(va, vb) {
    if (vb) subtract(this, va, vb);
    else subtract(this, this, va);
    return this;
  }
  multiply(v) {
    if (v.length) multiply(this, this, v);
    else scale(this, this, v);
    return this;
  }
  divide(v) {
    if (v.length) divide(this, this, v);
    else scale(this, this, 1 / v);
    return this;
  }
  inverse(v = this) {
    inverse(this, v);
    return this;
  }
  // Can't use 'length' as Array.prototype uses it
  len() {
    return length(this);
  }
  distance(v) {
    if (v) return distance(this, v);
    else return length(this);
  }
  squaredLen() {
    return squaredLength(this);
  }
  squaredDistance(v) {
    if (v) return squaredDistance(this, v);
    else return squaredLength(this);
  }
  negate(v = this) {
    negate(this, v);
    return this;
  }
  cross(va, vb) {
    if (vb) cross(this, va, vb);
    else cross(this, this, va);
    return this;
  }
  scale(v) {
    scale(this, this, v);
    return this;
  }
  normalize() {
    normalize(this, this);
    return this;
  }
  dot(v) {
    return dot(this, v);
  }
  equals(v) {
    return exactEquals(this, v);
  }
  applyMatrix3(mat3) {
    transformMat3(this, this, mat3);
    return this;
  }
  applyMatrix4(mat4) {
    transformMat4(this, this, mat4);
    return this;
  }
  scaleRotateMatrix4(mat4) {
    scaleRotateMat4(this, this, mat4);
    return this;
  }
  applyQuaternion(q) {
    transformQuat(this, this, q);
    return this;
  }
  angle(v) {
    return angle(this, v);
  }
  lerp(v, t) {
    lerp(this, this, v, t);
    return this;
  }
  smoothLerp(v, decay, dt) {
    smoothLerp(this, this, v, decay, dt);
    return this;
  }
  clone() {
    return new _Vec3(this[0], this[1], this[2]);
  }
  fromArray(a, o = 0) {
    this[0] = a[o];
    this[1] = a[o + 1];
    this[2] = a[o + 2];
    return this;
  }
  toArray(a = [], o = 0) {
    a[o] = this[0];
    a[o + 1] = this[1];
    a[o + 2] = this[2];
    return a;
  }
  transformDirection(mat4) {
    const x = this[0];
    const y = this[1];
    const z = this[2];
    this[0] = mat4[0] * x + mat4[4] * y + mat4[8] * z;
    this[1] = mat4[1] * x + mat4[5] * y + mat4[9] * z;
    this[2] = mat4[2] * x + mat4[6] * y + mat4[10] * z;
    return this.normalize();
  }
};

// node_modules/.pnpm/ogl@1.0.11/node_modules/ogl/src/core/Geometry.js
var tempVec3 = /* @__PURE__ */ new Vec3();
var ID = 1;
var ATTR_ID = 1;
var isBoundsWarned = false;
var Geometry = class {
  constructor(gl, attributes = {}) {
    if (!gl.canvas) console.error("gl not passed as first argument to Geometry");
    this.gl = gl;
    this.attributes = attributes;
    this.id = ID++;
    this.VAOs = {};
    this.drawRange = { start: 0, count: 0 };
    this.instancedCount = 0;
    this.gl.renderer.bindVertexArray(null);
    this.gl.renderer.currentGeometry = null;
    this.glState = this.gl.renderer.state;
    for (let key in attributes) {
      this.addAttribute(key, attributes[key]);
    }
  }
  addAttribute(key, attr) {
    this.attributes[key] = attr;
    attr.id = ATTR_ID++;
    attr.size = attr.size || 1;
    attr.type = attr.type || (attr.data.constructor === Float32Array ? this.gl.FLOAT : attr.data.constructor === Uint16Array ? this.gl.UNSIGNED_SHORT : this.gl.UNSIGNED_INT);
    attr.target = key === "index" ? this.gl.ELEMENT_ARRAY_BUFFER : this.gl.ARRAY_BUFFER;
    attr.normalized = attr.normalized || false;
    attr.stride = attr.stride || 0;
    attr.offset = attr.offset || 0;
    attr.count = attr.count || (attr.stride ? attr.data.byteLength / attr.stride : attr.data.length / attr.size);
    attr.divisor = attr.instanced || 0;
    attr.needsUpdate = false;
    attr.usage = attr.usage || this.gl.STATIC_DRAW;
    if (!attr.buffer) {
      this.updateAttribute(attr);
    }
    if (attr.divisor) {
      this.isInstanced = true;
      if (this.instancedCount && this.instancedCount !== attr.count * attr.divisor) {
        console.warn("geometry has multiple instanced buffers of different length");
        return this.instancedCount = Math.min(this.instancedCount, attr.count * attr.divisor);
      }
      this.instancedCount = attr.count * attr.divisor;
    } else if (key === "index") {
      this.drawRange.count = attr.count;
    } else if (!this.attributes.index) {
      this.drawRange.count = Math.max(this.drawRange.count, attr.count);
    }
  }
  updateAttribute(attr) {
    const isNewBuffer = !attr.buffer;
    if (isNewBuffer) attr.buffer = this.gl.createBuffer();
    if (this.glState.boundBuffer !== attr.buffer) {
      this.gl.bindBuffer(attr.target, attr.buffer);
      this.glState.boundBuffer = attr.buffer;
    }
    if (isNewBuffer) {
      this.gl.bufferData(attr.target, attr.data, attr.usage);
    } else {
      this.gl.bufferSubData(attr.target, 0, attr.data);
    }
    attr.needsUpdate = false;
  }
  setIndex(value) {
    this.addAttribute("index", value);
  }
  setDrawRange(start, count) {
    this.drawRange.start = start;
    this.drawRange.count = count;
  }
  setInstancedCount(value) {
    this.instancedCount = value;
  }
  createVAO(program) {
    this.VAOs[program.attributeOrder] = this.gl.renderer.createVertexArray();
    this.gl.renderer.bindVertexArray(this.VAOs[program.attributeOrder]);
    this.bindAttributes(program);
  }
  bindAttributes(program) {
    program.attributeLocations.forEach((location, { name, type }) => {
      if (!this.attributes[name]) {
        console.warn(`active attribute ${name} not being supplied`);
        return;
      }
      const attr = this.attributes[name];
      this.gl.bindBuffer(attr.target, attr.buffer);
      this.glState.boundBuffer = attr.buffer;
      let numLoc = 1;
      if (type === 35674) numLoc = 2;
      if (type === 35675) numLoc = 3;
      if (type === 35676) numLoc = 4;
      const size = attr.size / numLoc;
      const stride = numLoc === 1 ? 0 : numLoc * numLoc * 4;
      const offset = numLoc === 1 ? 0 : numLoc * 4;
      for (let i = 0; i < numLoc; i++) {
        this.gl.vertexAttribPointer(location + i, size, attr.type, attr.normalized, attr.stride + stride, attr.offset + i * offset);
        this.gl.enableVertexAttribArray(location + i);
        this.gl.renderer.vertexAttribDivisor(location + i, attr.divisor);
      }
    });
    if (this.attributes.index) this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.attributes.index.buffer);
  }
  draw({ program, mode = this.gl.TRIANGLES }) {
    if (this.gl.renderer.currentGeometry !== `${this.id}_${program.attributeOrder}`) {
      if (!this.VAOs[program.attributeOrder]) this.createVAO(program);
      this.gl.renderer.bindVertexArray(this.VAOs[program.attributeOrder]);
      this.gl.renderer.currentGeometry = `${this.id}_${program.attributeOrder}`;
    }
    program.attributeLocations.forEach((location, { name }) => {
      const attr = this.attributes[name];
      if (attr.needsUpdate) this.updateAttribute(attr);
    });
    let indexBytesPerElement = 2;
    if (this.attributes.index?.type === this.gl.UNSIGNED_INT) indexBytesPerElement = 4;
    if (this.isInstanced) {
      if (this.attributes.index) {
        this.gl.renderer.drawElementsInstanced(
          mode,
          this.drawRange.count,
          this.attributes.index.type,
          this.attributes.index.offset + this.drawRange.start * indexBytesPerElement,
          this.instancedCount
        );
      } else {
        this.gl.renderer.drawArraysInstanced(mode, this.drawRange.start, this.drawRange.count, this.instancedCount);
      }
    } else {
      if (this.attributes.index) {
        this.gl.drawElements(
          mode,
          this.drawRange.count,
          this.attributes.index.type,
          this.attributes.index.offset + this.drawRange.start * indexBytesPerElement
        );
      } else {
        this.gl.drawArrays(mode, this.drawRange.start, this.drawRange.count);
      }
    }
  }
  getPosition() {
    const attr = this.attributes.position;
    if (attr.data) return attr;
    if (isBoundsWarned) return;
    console.warn("No position buffer data found to compute bounds");
    return isBoundsWarned = true;
  }
  computeBoundingBox(attr) {
    if (!attr) attr = this.getPosition();
    const array = attr.data;
    const stride = attr.size;
    if (!this.bounds) {
      this.bounds = {
        min: new Vec3(),
        max: new Vec3(),
        center: new Vec3(),
        scale: new Vec3(),
        radius: Infinity
      };
    }
    const min = this.bounds.min;
    const max = this.bounds.max;
    const center = this.bounds.center;
    const scale5 = this.bounds.scale;
    min.set(Infinity);
    max.set(-Infinity);
    for (let i = 0, l = array.length; i < l; i += stride) {
      const x = array[i];
      const y = array[i + 1];
      const z = array[i + 2];
      min.x = Math.min(x, min.x);
      min.y = Math.min(y, min.y);
      min.z = Math.min(z, min.z);
      max.x = Math.max(x, max.x);
      max.y = Math.max(y, max.y);
      max.z = Math.max(z, max.z);
    }
    scale5.sub(max, min);
    center.add(min, max).divide(2);
  }
  computeBoundingSphere(attr) {
    if (!attr) attr = this.getPosition();
    const array = attr.data;
    const stride = attr.size;
    if (!this.bounds) this.computeBoundingBox(attr);
    let maxRadiusSq = 0;
    for (let i = 0, l = array.length; i < l; i += stride) {
      tempVec3.fromArray(array, i);
      maxRadiusSq = Math.max(maxRadiusSq, this.bounds.center.squaredDistance(tempVec3));
    }
    this.bounds.radius = Math.sqrt(maxRadiusSq);
  }
  remove() {
    for (let key in this.VAOs) {
      this.gl.renderer.deleteVertexArray(this.VAOs[key]);
      delete this.VAOs[key];
    }
    for (let key in this.attributes) {
      this.gl.deleteBuffer(this.attributes[key].buffer);
      delete this.attributes[key];
    }
  }
};

// node_modules/.pnpm/ogl@1.0.11/node_modules/ogl/src/core/Program.js
var ID2 = 1;
var arrayCacheF32 = {};
var Program = class {
  constructor(gl, {
    vertex: vertex2,
    fragment: fragment2,
    uniforms = {},
    transparent = false,
    cullFace = gl.BACK,
    frontFace = gl.CCW,
    depthTest = true,
    depthWrite = true,
    depthFunc = gl.LEQUAL
  } = {}) {
    if (!gl.canvas) console.error("gl not passed as first argument to Program");
    this.gl = gl;
    this.uniforms = uniforms;
    this.id = ID2++;
    if (!vertex2) console.warn("vertex shader not supplied");
    if (!fragment2) console.warn("fragment shader not supplied");
    this.transparent = transparent;
    this.cullFace = cullFace;
    this.frontFace = frontFace;
    this.depthTest = depthTest;
    this.depthWrite = depthWrite;
    this.depthFunc = depthFunc;
    this.blendFunc = {};
    this.blendEquation = {};
    this.stencilFunc = {};
    this.stencilOp = {};
    if (this.transparent && !this.blendFunc.src) {
      if (this.gl.renderer.premultipliedAlpha) this.setBlendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
      else this.setBlendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    }
    this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
    this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    this.program = gl.createProgram();
    gl.attachShader(this.program, this.vertexShader);
    gl.attachShader(this.program, this.fragmentShader);
    this.setShaders({ vertex: vertex2, fragment: fragment2 });
  }
  setShaders({ vertex: vertex2, fragment: fragment2 }) {
    if (vertex2) {
      this.gl.shaderSource(this.vertexShader, vertex2);
      this.gl.compileShader(this.vertexShader);
      if (this.gl.getShaderInfoLog(this.vertexShader) !== "") {
        console.warn(`${this.gl.getShaderInfoLog(this.vertexShader)}
Vertex Shader
${addLineNumbers(vertex2)}`);
      }
    }
    if (fragment2) {
      this.gl.shaderSource(this.fragmentShader, fragment2);
      this.gl.compileShader(this.fragmentShader);
      if (this.gl.getShaderInfoLog(this.fragmentShader) !== "") {
        console.warn(`${this.gl.getShaderInfoLog(this.fragmentShader)}
Fragment Shader
${addLineNumbers(fragment2)}`);
      }
    }
    this.gl.linkProgram(this.program);
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      return console.warn(this.gl.getProgramInfoLog(this.program));
    }
    this.uniformLocations = /* @__PURE__ */ new Map();
    let numUniforms = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);
    for (let uIndex = 0; uIndex < numUniforms; uIndex++) {
      let uniform = this.gl.getActiveUniform(this.program, uIndex);
      this.uniformLocations.set(uniform, this.gl.getUniformLocation(this.program, uniform.name));
      const split = uniform.name.match(/(\w+)/g);
      uniform.uniformName = split[0];
      uniform.nameComponents = split.slice(1);
    }
    this.attributeLocations = /* @__PURE__ */ new Map();
    const locations = [];
    const numAttribs = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
    for (let aIndex = 0; aIndex < numAttribs; aIndex++) {
      const attribute = this.gl.getActiveAttrib(this.program, aIndex);
      const location = this.gl.getAttribLocation(this.program, attribute.name);
      if (location === -1) continue;
      locations[location] = attribute.name;
      this.attributeLocations.set(attribute, location);
    }
    this.attributeOrder = locations.join("");
  }
  setBlendFunc(src, dst, srcAlpha, dstAlpha) {
    this.blendFunc.src = src;
    this.blendFunc.dst = dst;
    this.blendFunc.srcAlpha = srcAlpha;
    this.blendFunc.dstAlpha = dstAlpha;
    if (src) this.transparent = true;
  }
  setBlendEquation(modeRGB, modeAlpha) {
    this.blendEquation.modeRGB = modeRGB;
    this.blendEquation.modeAlpha = modeAlpha;
  }
  setStencilFunc(func, ref, mask) {
    this.stencilRef = ref;
    this.stencilFunc.func = func;
    this.stencilFunc.ref = ref;
    this.stencilFunc.mask = mask;
  }
  setStencilOp(stencilFail, depthFail, depthPass) {
    this.stencilOp.stencilFail = stencilFail;
    this.stencilOp.depthFail = depthFail;
    this.stencilOp.depthPass = depthPass;
  }
  applyState() {
    if (this.depthTest) this.gl.renderer.enable(this.gl.DEPTH_TEST);
    else this.gl.renderer.disable(this.gl.DEPTH_TEST);
    if (this.cullFace) this.gl.renderer.enable(this.gl.CULL_FACE);
    else this.gl.renderer.disable(this.gl.CULL_FACE);
    if (this.blendFunc.src) this.gl.renderer.enable(this.gl.BLEND);
    else this.gl.renderer.disable(this.gl.BLEND);
    if (this.cullFace) this.gl.renderer.setCullFace(this.cullFace);
    this.gl.renderer.setFrontFace(this.frontFace);
    this.gl.renderer.setDepthMask(this.depthWrite);
    this.gl.renderer.setDepthFunc(this.depthFunc);
    if (this.blendFunc.src) this.gl.renderer.setBlendFunc(this.blendFunc.src, this.blendFunc.dst, this.blendFunc.srcAlpha, this.blendFunc.dstAlpha);
    this.gl.renderer.setBlendEquation(this.blendEquation.modeRGB, this.blendEquation.modeAlpha);
    if (this.stencilFunc.func || this.stencilOp.stencilFail) this.gl.renderer.enable(this.gl.STENCIL_TEST);
    else this.gl.renderer.disable(this.gl.STENCIL_TEST);
    this.gl.renderer.setStencilFunc(this.stencilFunc.func, this.stencilFunc.ref, this.stencilFunc.mask);
    this.gl.renderer.setStencilOp(this.stencilOp.stencilFail, this.stencilOp.depthFail, this.stencilOp.depthPass);
  }
  use({ flipFaces = false } = {}) {
    let textureUnit = -1;
    const programActive = this.gl.renderer.state.currentProgram === this.id;
    if (!programActive) {
      this.gl.useProgram(this.program);
      this.gl.renderer.state.currentProgram = this.id;
    }
    this.uniformLocations.forEach((location, activeUniform) => {
      let uniform = this.uniforms[activeUniform.uniformName];
      for (const component of activeUniform.nameComponents) {
        if (!uniform) break;
        if (component in uniform) {
          uniform = uniform[component];
        } else if (Array.isArray(uniform.value)) {
          break;
        } else {
          uniform = void 0;
          break;
        }
      }
      if (!uniform) {
        return warn(`Active uniform ${activeUniform.name} has not been supplied`);
      }
      if (uniform && uniform.value === void 0) {
        return warn(`${activeUniform.name} uniform is missing a value parameter`);
      }
      if (uniform.value.texture) {
        textureUnit = textureUnit + 1;
        uniform.value.update(textureUnit);
        return setUniform(this.gl, activeUniform.type, location, textureUnit);
      }
      if (uniform.value.length && uniform.value[0].texture) {
        const textureUnits = [];
        uniform.value.forEach((value) => {
          textureUnit = textureUnit + 1;
          value.update(textureUnit);
          textureUnits.push(textureUnit);
        });
        return setUniform(this.gl, activeUniform.type, location, textureUnits);
      }
      setUniform(this.gl, activeUniform.type, location, uniform.value);
    });
    this.applyState();
    if (flipFaces) this.gl.renderer.setFrontFace(this.frontFace === this.gl.CCW ? this.gl.CW : this.gl.CCW);
  }
  remove() {
    this.gl.deleteProgram(this.program);
  }
};
function setUniform(gl, type, location, value) {
  value = value.length ? flatten(value) : value;
  const setValue = gl.renderer.state.uniformLocations.get(location);
  if (value.length) {
    if (setValue === void 0 || setValue.length !== value.length) {
      gl.renderer.state.uniformLocations.set(location, value.slice(0));
    } else {
      if (arraysEqual(setValue, value)) return;
      setValue.set ? setValue.set(value) : setArray(setValue, value);
      gl.renderer.state.uniformLocations.set(location, setValue);
    }
  } else {
    if (setValue === value) return;
    gl.renderer.state.uniformLocations.set(location, value);
  }
  switch (type) {
    case 5126:
      return value.length ? gl.uniform1fv(location, value) : gl.uniform1f(location, value);
    // FLOAT
    case 35664:
      return gl.uniform2fv(location, value);
    // FLOAT_VEC2
    case 35665:
      return gl.uniform3fv(location, value);
    // FLOAT_VEC3
    case 35666:
      return gl.uniform4fv(location, value);
    // FLOAT_VEC4
    case 35670:
    // BOOL
    case 5124:
    // INT
    case 35678:
    // SAMPLER_2D
    case 36306:
    // U_SAMPLER_2D
    case 35680:
    // SAMPLER_CUBE
    case 36289:
      return value.length ? gl.uniform1iv(location, value) : gl.uniform1i(location, value);
    // SAMPLER_CUBE
    case 35671:
    // BOOL_VEC2
    case 35667:
      return gl.uniform2iv(location, value);
    // INT_VEC2
    case 35672:
    // BOOL_VEC3
    case 35668:
      return gl.uniform3iv(location, value);
    // INT_VEC3
    case 35673:
    // BOOL_VEC4
    case 35669:
      return gl.uniform4iv(location, value);
    // INT_VEC4
    case 35674:
      return gl.uniformMatrix2fv(location, false, value);
    // FLOAT_MAT2
    case 35675:
      return gl.uniformMatrix3fv(location, false, value);
    // FLOAT_MAT3
    case 35676:
      return gl.uniformMatrix4fv(location, false, value);
  }
}
function addLineNumbers(string) {
  let lines = string.split("\n");
  for (let i = 0; i < lines.length; i++) {
    lines[i] = i + 1 + ": " + lines[i];
  }
  return lines.join("\n");
}
function flatten(a) {
  const arrayLen = a.length;
  const valueLen = a[0].length;
  if (valueLen === void 0) return a;
  const length3 = arrayLen * valueLen;
  let value = arrayCacheF32[length3];
  if (!value) arrayCacheF32[length3] = value = new Float32Array(length3);
  for (let i = 0; i < arrayLen; i++) value.set(a[i], i * valueLen);
  return value;
}
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0, l = a.length; i < l; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
function setArray(a, b) {
  for (let i = 0, l = a.length; i < l; i++) {
    a[i] = b[i];
  }
}
var warnCount = 0;
function warn(message) {
  if (warnCount > 100) return;
  console.warn(message);
  warnCount++;
  if (warnCount > 100) console.warn("More than 100 program warnings - stopping logs.");
}

// node_modules/.pnpm/ogl@1.0.11/node_modules/ogl/src/core/Renderer.js
var tempVec32 = /* @__PURE__ */ new Vec3();
var ID3 = 1;
var Renderer = class {
  constructor({
    canvas = document.createElement("canvas"),
    width = 300,
    height = 150,
    dpr = 1,
    alpha = false,
    depth = true,
    stencil = false,
    antialias = false,
    premultipliedAlpha = false,
    preserveDrawingBuffer = false,
    powerPreference = "default",
    autoClear = true,
    webgl = 2
  } = {}) {
    const attributes = { alpha, depth, stencil, antialias, premultipliedAlpha, preserveDrawingBuffer, powerPreference };
    this.dpr = dpr;
    this.alpha = alpha;
    this.color = true;
    this.depth = depth;
    this.stencil = stencil;
    this.premultipliedAlpha = premultipliedAlpha;
    this.autoClear = autoClear;
    this.id = ID3++;
    if (webgl === 2) this.gl = canvas.getContext("webgl2", attributes);
    this.isWebgl2 = !!this.gl;
    if (!this.gl) this.gl = canvas.getContext("webgl", attributes);
    if (!this.gl) console.error("unable to create webgl context");
    this.gl.renderer = this;
    this.setSize(width, height);
    this.state = {};
    this.state.blendFunc = { src: this.gl.ONE, dst: this.gl.ZERO };
    this.state.blendEquation = { modeRGB: this.gl.FUNC_ADD };
    this.state.cullFace = false;
    this.state.frontFace = this.gl.CCW;
    this.state.depthMask = true;
    this.state.depthFunc = this.gl.LEQUAL;
    this.state.premultiplyAlpha = false;
    this.state.flipY = false;
    this.state.unpackAlignment = 4;
    this.state.framebuffer = null;
    this.state.viewport = { x: 0, y: 0, width: null, height: null };
    this.state.textureUnits = [];
    this.state.activeTextureUnit = 0;
    this.state.boundBuffer = null;
    this.state.uniformLocations = /* @__PURE__ */ new Map();
    this.state.currentProgram = null;
    this.extensions = {};
    if (this.isWebgl2) {
      this.getExtension("EXT_color_buffer_float");
      this.getExtension("OES_texture_float_linear");
    } else {
      this.getExtension("OES_texture_float");
      this.getExtension("OES_texture_float_linear");
      this.getExtension("OES_texture_half_float");
      this.getExtension("OES_texture_half_float_linear");
      this.getExtension("OES_element_index_uint");
      this.getExtension("OES_standard_derivatives");
      this.getExtension("EXT_sRGB");
      this.getExtension("WEBGL_depth_texture");
      this.getExtension("WEBGL_draw_buffers");
    }
    this.getExtension("WEBGL_compressed_texture_astc");
    this.getExtension("EXT_texture_compression_bptc");
    this.getExtension("WEBGL_compressed_texture_s3tc");
    this.getExtension("WEBGL_compressed_texture_etc1");
    this.getExtension("WEBGL_compressed_texture_pvrtc");
    this.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
    this.vertexAttribDivisor = this.getExtension("ANGLE_instanced_arrays", "vertexAttribDivisor", "vertexAttribDivisorANGLE");
    this.drawArraysInstanced = this.getExtension("ANGLE_instanced_arrays", "drawArraysInstanced", "drawArraysInstancedANGLE");
    this.drawElementsInstanced = this.getExtension("ANGLE_instanced_arrays", "drawElementsInstanced", "drawElementsInstancedANGLE");
    this.createVertexArray = this.getExtension("OES_vertex_array_object", "createVertexArray", "createVertexArrayOES");
    this.bindVertexArray = this.getExtension("OES_vertex_array_object", "bindVertexArray", "bindVertexArrayOES");
    this.deleteVertexArray = this.getExtension("OES_vertex_array_object", "deleteVertexArray", "deleteVertexArrayOES");
    this.drawBuffers = this.getExtension("WEBGL_draw_buffers", "drawBuffers", "drawBuffersWEBGL");
    this.parameters = {};
    this.parameters.maxTextureUnits = this.gl.getParameter(this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    this.parameters.maxAnisotropy = this.getExtension("EXT_texture_filter_anisotropic") ? this.gl.getParameter(this.getExtension("EXT_texture_filter_anisotropic").MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0;
  }
  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.gl.canvas.width = width * this.dpr;
    this.gl.canvas.height = height * this.dpr;
    if (!this.gl.canvas.style) return;
    Object.assign(this.gl.canvas.style, {
      width: width + "px",
      height: height + "px"
    });
  }
  setViewport(width, height, x = 0, y = 0) {
    if (this.state.viewport.width === width && this.state.viewport.height === height) return;
    this.state.viewport.width = width;
    this.state.viewport.height = height;
    this.state.viewport.x = x;
    this.state.viewport.y = y;
    this.gl.viewport(x, y, width, height);
  }
  setScissor(width, height, x = 0, y = 0) {
    this.gl.scissor(x, y, width, height);
  }
  enable(id) {
    if (this.state[id] === true) return;
    this.gl.enable(id);
    this.state[id] = true;
  }
  disable(id) {
    if (this.state[id] === false) return;
    this.gl.disable(id);
    this.state[id] = false;
  }
  setBlendFunc(src, dst, srcAlpha, dstAlpha) {
    if (this.state.blendFunc.src === src && this.state.blendFunc.dst === dst && this.state.blendFunc.srcAlpha === srcAlpha && this.state.blendFunc.dstAlpha === dstAlpha)
      return;
    this.state.blendFunc.src = src;
    this.state.blendFunc.dst = dst;
    this.state.blendFunc.srcAlpha = srcAlpha;
    this.state.blendFunc.dstAlpha = dstAlpha;
    if (srcAlpha !== void 0) this.gl.blendFuncSeparate(src, dst, srcAlpha, dstAlpha);
    else this.gl.blendFunc(src, dst);
  }
  setBlendEquation(modeRGB, modeAlpha) {
    modeRGB = modeRGB || this.gl.FUNC_ADD;
    if (this.state.blendEquation.modeRGB === modeRGB && this.state.blendEquation.modeAlpha === modeAlpha) return;
    this.state.blendEquation.modeRGB = modeRGB;
    this.state.blendEquation.modeAlpha = modeAlpha;
    if (modeAlpha !== void 0) this.gl.blendEquationSeparate(modeRGB, modeAlpha);
    else this.gl.blendEquation(modeRGB);
  }
  setCullFace(value) {
    if (this.state.cullFace === value) return;
    this.state.cullFace = value;
    this.gl.cullFace(value);
  }
  setFrontFace(value) {
    if (this.state.frontFace === value) return;
    this.state.frontFace = value;
    this.gl.frontFace(value);
  }
  setDepthMask(value) {
    if (this.state.depthMask === value) return;
    this.state.depthMask = value;
    this.gl.depthMask(value);
  }
  setDepthFunc(value) {
    if (this.state.depthFunc === value) return;
    this.state.depthFunc = value;
    this.gl.depthFunc(value);
  }
  setStencilMask(value) {
    if (this.state.stencilMask === value) return;
    this.state.stencilMask = value;
    this.gl.stencilMask(value);
  }
  setStencilFunc(func, ref, mask) {
    if (this.state.stencilFunc === func && this.state.stencilRef === ref && this.state.stencilFuncMask === mask) return;
    this.state.stencilFunc = func || this.gl.ALWAYS;
    this.state.stencilRef = ref || 0;
    this.state.stencilFuncMask = mask || 0;
    this.gl.stencilFunc(func || this.gl.ALWAYS, ref || 0, mask || 0);
  }
  setStencilOp(stencilFail, depthFail, depthPass) {
    if (this.state.stencilFail === stencilFail && this.state.stencilDepthFail === depthFail && this.state.stencilDepthPass === depthPass) return;
    this.state.stencilFail = stencilFail;
    this.state.stencilDepthFail = depthFail;
    this.state.stencilDepthPass = depthPass;
    this.gl.stencilOp(stencilFail, depthFail, depthPass);
  }
  activeTexture(value) {
    if (this.state.activeTextureUnit === value) return;
    this.state.activeTextureUnit = value;
    this.gl.activeTexture(this.gl.TEXTURE0 + value);
  }
  bindFramebuffer({ target = this.gl.FRAMEBUFFER, buffer = null } = {}) {
    if (this.state.framebuffer === buffer) return;
    this.state.framebuffer = buffer;
    this.gl.bindFramebuffer(target, buffer);
  }
  getExtension(extension, webgl2Func, extFunc) {
    if (webgl2Func && this.gl[webgl2Func]) return this.gl[webgl2Func].bind(this.gl);
    if (!this.extensions[extension]) {
      this.extensions[extension] = this.gl.getExtension(extension);
    }
    if (!webgl2Func) return this.extensions[extension];
    if (!this.extensions[extension]) return null;
    return this.extensions[extension][extFunc].bind(this.extensions[extension]);
  }
  sortOpaque(a, b) {
    if (a.renderOrder !== b.renderOrder) {
      return a.renderOrder - b.renderOrder;
    } else if (a.program.id !== b.program.id) {
      return a.program.id - b.program.id;
    } else if (a.zDepth !== b.zDepth) {
      return a.zDepth - b.zDepth;
    } else {
      return b.id - a.id;
    }
  }
  sortTransparent(a, b) {
    if (a.renderOrder !== b.renderOrder) {
      return a.renderOrder - b.renderOrder;
    }
    if (a.zDepth !== b.zDepth) {
      return b.zDepth - a.zDepth;
    } else {
      return b.id - a.id;
    }
  }
  sortUI(a, b) {
    if (a.renderOrder !== b.renderOrder) {
      return a.renderOrder - b.renderOrder;
    } else if (a.program.id !== b.program.id) {
      return a.program.id - b.program.id;
    } else {
      return b.id - a.id;
    }
  }
  getRenderList({ scene, camera, frustumCull, sort }) {
    let renderList = [];
    if (camera && frustumCull) camera.updateFrustum();
    scene.traverse((node) => {
      if (!node.visible) return true;
      if (!node.draw) return;
      if (frustumCull && node.frustumCulled && camera) {
        if (!camera.frustumIntersectsMesh(node)) return;
      }
      renderList.push(node);
    });
    if (sort) {
      const opaque = [];
      const transparent = [];
      const ui = [];
      renderList.forEach((node) => {
        if (!node.program.transparent) {
          opaque.push(node);
        } else if (node.program.depthTest) {
          transparent.push(node);
        } else {
          ui.push(node);
        }
        node.zDepth = 0;
        if (node.renderOrder !== 0 || !node.program.depthTest || !camera) return;
        node.worldMatrix.getTranslation(tempVec32);
        tempVec32.applyMatrix4(camera.projectionViewMatrix);
        node.zDepth = tempVec32.z;
      });
      opaque.sort(this.sortOpaque);
      transparent.sort(this.sortTransparent);
      ui.sort(this.sortUI);
      renderList = opaque.concat(transparent, ui);
    }
    return renderList;
  }
  render({ scene, camera, target = null, update = true, sort = true, frustumCull = true, clear }) {
    if (target === null) {
      this.bindFramebuffer();
      this.setViewport(this.width * this.dpr, this.height * this.dpr);
    } else {
      this.bindFramebuffer(target);
      this.setViewport(target.width, target.height);
    }
    if (clear || this.autoClear && clear !== false) {
      if (this.depth && (!target || target.depth)) {
        this.enable(this.gl.DEPTH_TEST);
        this.setDepthMask(true);
      }
      if (this.stencil || (!target || target.stencil)) {
        this.enable(this.gl.STENCIL_TEST);
        this.setStencilMask(255);
      }
      this.gl.clear(
        (this.color ? this.gl.COLOR_BUFFER_BIT : 0) | (this.depth ? this.gl.DEPTH_BUFFER_BIT : 0) | (this.stencil ? this.gl.STENCIL_BUFFER_BIT : 0)
      );
    }
    if (update) scene.updateMatrixWorld();
    if (camera) camera.updateMatrixWorld();
    const renderList = this.getRenderList({ scene, camera, frustumCull, sort });
    renderList.forEach((node) => {
      node.draw({ camera });
    });
  }
};

// node_modules/.pnpm/ogl@1.0.11/node_modules/ogl/src/math/functions/Vec4Func.js
function copy2(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
function set2(out, x, y, z, w) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
function normalize2(out, a) {
  let x = a[0];
  let y = a[1];
  let z = a[2];
  let w = a[3];
  let len = x * x + y * y + z * z + w * w;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }
  out[0] = x * len;
  out[1] = y * len;
  out[2] = z * len;
  out[3] = w * len;
  return out;
}
function dot2(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

// node_modules/.pnpm/ogl@1.0.11/node_modules/ogl/src/math/functions/QuatFunc.js
function identity(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  return out;
}
function setAxisAngle(out, axis, rad) {
  rad = rad * 0.5;
  let s = Math.sin(rad);
  out[0] = s * axis[0];
  out[1] = s * axis[1];
  out[2] = s * axis[2];
  out[3] = Math.cos(rad);
  return out;
}
function multiply2(out, a, b) {
  let ax = a[0], ay = a[1], az = a[2], aw = a[3];
  let bx = b[0], by = b[1], bz = b[2], bw = b[3];
  out[0] = ax * bw + aw * bx + ay * bz - az * by;
  out[1] = ay * bw + aw * by + az * bx - ax * bz;
  out[2] = az * bw + aw * bz + ax * by - ay * bx;
  out[3] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}
function rotateX(out, a, rad) {
  rad *= 0.5;
  let ax = a[0], ay = a[1], az = a[2], aw = a[3];
  let bx = Math.sin(rad), bw = Math.cos(rad);
  out[0] = ax * bw + aw * bx;
  out[1] = ay * bw + az * bx;
  out[2] = az * bw - ay * bx;
  out[3] = aw * bw - ax * bx;
  return out;
}
function rotateY(out, a, rad) {
  rad *= 0.5;
  let ax = a[0], ay = a[1], az = a[2], aw = a[3];
  let by = Math.sin(rad), bw = Math.cos(rad);
  out[0] = ax * bw - az * by;
  out[1] = ay * bw + aw * by;
  out[2] = az * bw + ax * by;
  out[3] = aw * bw - ay * by;
  return out;
}
function rotateZ(out, a, rad) {
  rad *= 0.5;
  let ax = a[0], ay = a[1], az = a[2], aw = a[3];
  let bz = Math.sin(rad), bw = Math.cos(rad);
  out[0] = ax * bw + ay * bz;
  out[1] = ay * bw - ax * bz;
  out[2] = az * bw + aw * bz;
  out[3] = aw * bw - az * bz;
  return out;
}
function slerp(out, a, b, t) {
  let ax = a[0], ay = a[1], az = a[2], aw = a[3];
  let bx = b[0], by = b[1], bz = b[2], bw = b[3];
  let omega, cosom, sinom, scale0, scale1;
  cosom = ax * bx + ay * by + az * bz + aw * bw;
  if (cosom < 0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  }
  if (1 - cosom > 1e-6) {
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    scale0 = 1 - t;
    scale1 = t;
  }
  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;
  return out;
}
function invert(out, a) {
  let a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
  let dot4 = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
  let invDot = dot4 ? 1 / dot4 : 0;
  out[0] = -a0 * invDot;
  out[1] = -a1 * invDot;
  out[2] = -a2 * invDot;
  out[3] = a3 * invDot;
  return out;
}
function conjugate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  return out;
}
function fromMat3(out, m) {
  let fTrace = m[0] + m[4] + m[8];
  let fRoot;
  if (fTrace > 0) {
    fRoot = Math.sqrt(fTrace + 1);
    out[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[0] = (m[5] - m[7]) * fRoot;
    out[1] = (m[6] - m[2]) * fRoot;
    out[2] = (m[1] - m[3]) * fRoot;
  } else {
    let i = 0;
    if (m[4] > m[0]) i = 1;
    if (m[8] > m[i * 3 + i]) i = 2;
    let j = (i + 1) % 3;
    let k = (i + 2) % 3;
    fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
    out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
    out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
  }
  return out;
}
function fromEuler(out, euler, order = "YXZ") {
  let sx = Math.sin(euler[0] * 0.5);
  let cx = Math.cos(euler[0] * 0.5);
  let sy = Math.sin(euler[1] * 0.5);
  let cy = Math.cos(euler[1] * 0.5);
  let sz = Math.sin(euler[2] * 0.5);
  let cz = Math.cos(euler[2] * 0.5);
  if (order === "XYZ") {
    out[0] = sx * cy * cz + cx * sy * sz;
    out[1] = cx * sy * cz - sx * cy * sz;
    out[2] = cx * cy * sz + sx * sy * cz;
    out[3] = cx * cy * cz - sx * sy * sz;
  } else if (order === "YXZ") {
    out[0] = sx * cy * cz + cx * sy * sz;
    out[1] = cx * sy * cz - sx * cy * sz;
    out[2] = cx * cy * sz - sx * sy * cz;
    out[3] = cx * cy * cz + sx * sy * sz;
  } else if (order === "ZXY") {
    out[0] = sx * cy * cz - cx * sy * sz;
    out[1] = cx * sy * cz + sx * cy * sz;
    out[2] = cx * cy * sz + sx * sy * cz;
    out[3] = cx * cy * cz - sx * sy * sz;
  } else if (order === "ZYX") {
    out[0] = sx * cy * cz - cx * sy * sz;
    out[1] = cx * sy * cz + sx * cy * sz;
    out[2] = cx * cy * sz - sx * sy * cz;
    out[3] = cx * cy * cz + sx * sy * sz;
  } else if (order === "YZX") {
    out[0] = sx * cy * cz + cx * sy * sz;
    out[1] = cx * sy * cz + sx * cy * sz;
    out[2] = cx * cy * sz - sx * sy * cz;
    out[3] = cx * cy * cz - sx * sy * sz;
  } else if (order === "XZY") {
    out[0] = sx * cy * cz - cx * sy * sz;
    out[1] = cx * sy * cz - sx * cy * sz;
    out[2] = cx * cy * sz + sx * sy * cz;
    out[3] = cx * cy * cz + sx * sy * sz;
  }
  return out;
}
var copy3 = copy2;
var set3 = set2;
var dot3 = dot2;
var normalize3 = normalize2;

// node_modules/.pnpm/ogl@1.0.11/node_modules/ogl/src/math/Quat.js
var Quat = class extends Array {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    super(x, y, z, w);
    this.onChange = () => {
    };
    this._target = this;
    const triggerProps = ["0", "1", "2", "3"];
    return new Proxy(this, {
      set(target, property) {
        const success = Reflect.set(...arguments);
        if (success && triggerProps.includes(property)) target.onChange();
        return success;
      }
    });
  }
  get x() {
    return this[0];
  }
  get y() {
    return this[1];
  }
  get z() {
    return this[2];
  }
  get w() {
    return this[3];
  }
  set x(v) {
    this._target[0] = v;
    this.onChange();
  }
  set y(v) {
    this._target[1] = v;
    this.onChange();
  }
  set z(v) {
    this._target[2] = v;
    this.onChange();
  }
  set w(v) {
    this._target[3] = v;
    this.onChange();
  }
  identity() {
    identity(this._target);
    this.onChange();
    return this;
  }
  set(x, y, z, w) {
    if (x.length) return this.copy(x);
    set3(this._target, x, y, z, w);
    this.onChange();
    return this;
  }
  rotateX(a) {
    rotateX(this._target, this._target, a);
    this.onChange();
    return this;
  }
  rotateY(a) {
    rotateY(this._target, this._target, a);
    this.onChange();
    return this;
  }
  rotateZ(a) {
    rotateZ(this._target, this._target, a);
    this.onChange();
    return this;
  }
  inverse(q = this._target) {
    invert(this._target, q);
    this.onChange();
    return this;
  }
  conjugate(q = this._target) {
    conjugate(this._target, q);
    this.onChange();
    return this;
  }
  copy(q) {
    copy3(this._target, q);
    this.onChange();
    return this;
  }
  normalize(q = this._target) {
    normalize3(this._target, q);
    this.onChange();
    return this;
  }
  multiply(qA, qB) {
    if (qB) {
      multiply2(this._target, qA, qB);
    } else {
      multiply2(this._target, this._target, qA);
    }
    this.onChange();
    return this;
  }
  dot(v) {
    return dot3(this._target, v);
  }
  fromMatrix3(matrix3) {
    fromMat3(this._target, matrix3);
    this.onChange();
    return this;
  }
  fromEuler(euler, isInternal) {
    fromEuler(this._target, euler, euler.order);
    if (!isInternal) this.onChange();
    return this;
  }
  fromAxisAngle(axis, a) {
    setAxisAngle(this._target, axis, a);
    this.onChange();
    return this;
  }
  slerp(q, t) {
    slerp(this._target, this._target, q, t);
    this.onChange();
    return this;
  }
  fromArray(a, o = 0) {
    this._target[0] = a[o];
    this._target[1] = a[o + 1];
    this._target[2] = a[o + 2];
    this._target[3] = a[o + 3];
    this.onChange();
    return this;
  }
  toArray(a = [], o = 0) {
    a[o] = this[0];
    a[o + 1] = this[1];
    a[o + 2] = this[2];
    a[o + 3] = this[3];
    return a;
  }
};

// node_modules/.pnpm/ogl@1.0.11/node_modules/ogl/src/math/functions/Mat4Func.js
var EPSILON = 1e-6;
function copy4(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
function set4(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
function identity2(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function invert2(out, a) {
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  let b00 = a00 * a11 - a01 * a10;
  let b01 = a00 * a12 - a02 * a10;
  let b02 = a00 * a13 - a03 * a10;
  let b03 = a01 * a12 - a02 * a11;
  let b04 = a01 * a13 - a03 * a11;
  let b05 = a02 * a13 - a03 * a12;
  let b06 = a20 * a31 - a21 * a30;
  let b07 = a20 * a32 - a22 * a30;
  let b08 = a20 * a33 - a23 * a30;
  let b09 = a21 * a32 - a22 * a31;
  let b10 = a21 * a33 - a23 * a31;
  let b11 = a22 * a33 - a23 * a32;
  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) {
    return null;
  }
  det = 1 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}
function determinant(a) {
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  let b00 = a00 * a11 - a01 * a10;
  let b01 = a00 * a12 - a02 * a10;
  let b02 = a00 * a13 - a03 * a10;
  let b03 = a01 * a12 - a02 * a11;
  let b04 = a01 * a13 - a03 * a11;
  let b05 = a02 * a13 - a03 * a12;
  let b06 = a20 * a31 - a21 * a30;
  let b07 = a20 * a32 - a22 * a30;
  let b08 = a20 * a33 - a23 * a30;
  let b09 = a21 * a32 - a22 * a31;
  let b10 = a21 * a33 - a23 * a31;
  let b11 = a22 * a33 - a23 * a32;
  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
}
function multiply3(out, a, b) {
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}
function translate(out, a, v) {
  let x = v[0], y = v[1], z = v[2];
  let a00, a01, a02, a03;
  let a10, a11, a12, a13;
  let a20, a21, a22, a23;
  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a03;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a20;
    out[9] = a21;
    out[10] = a22;
    out[11] = a23;
    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }
  return out;
}
function scale3(out, a, v) {
  let x = v[0], y = v[1], z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
function rotate(out, a, rad, axis) {
  let x = axis[0], y = axis[1], z = axis[2];
  let len = Math.hypot(x, y, z);
  let s, c, t;
  let a00, a01, a02, a03;
  let a10, a11, a12, a13;
  let a20, a21, a22, a23;
  let b00, b01, b02;
  let b10, b11, b12;
  let b20, b21, b22;
  if (Math.abs(len) < EPSILON) {
    return null;
  }
  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  a00 = a[0];
  a01 = a[1];
  a02 = a[2];
  a03 = a[3];
  a10 = a[4];
  a11 = a[5];
  a12 = a[6];
  a13 = a[7];
  a20 = a[8];
  a21 = a[9];
  a22 = a[10];
  a23 = a[11];
  b00 = x * x * t + c;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c;
  out[0] = a00 * b00 + a10 * b01 + a20 * b02;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22;
  if (a !== out) {
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  return out;
}
function getTranslation(out, mat) {
  out[0] = mat[12];
  out[1] = mat[13];
  out[2] = mat[14];
  return out;
}
function getScaling(out, mat) {
  let m11 = mat[0];
  let m12 = mat[1];
  let m13 = mat[2];
  let m21 = mat[4];
  let m22 = mat[5];
  let m23 = mat[6];
  let m31 = mat[8];
  let m32 = mat[9];
  let m33 = mat[10];
  out[0] = Math.hypot(m11, m12, m13);
  out[1] = Math.hypot(m21, m22, m23);
  out[2] = Math.hypot(m31, m32, m33);
  return out;
}
function getMaxScaleOnAxis(mat) {
  let m11 = mat[0];
  let m12 = mat[1];
  let m13 = mat[2];
  let m21 = mat[4];
  let m22 = mat[5];
  let m23 = mat[6];
  let m31 = mat[8];
  let m32 = mat[9];
  let m33 = mat[10];
  const x = m11 * m11 + m12 * m12 + m13 * m13;
  const y = m21 * m21 + m22 * m22 + m23 * m23;
  const z = m31 * m31 + m32 * m32 + m33 * m33;
  return Math.sqrt(Math.max(x, y, z));
}
var getRotation = /* @__PURE__ */ (function() {
  const temp = [1, 1, 1];
  return function(out, mat) {
    let scaling = temp;
    getScaling(scaling, mat);
    let is1 = 1 / scaling[0];
    let is2 = 1 / scaling[1];
    let is3 = 1 / scaling[2];
    let sm11 = mat[0] * is1;
    let sm12 = mat[1] * is2;
    let sm13 = mat[2] * is3;
    let sm21 = mat[4] * is1;
    let sm22 = mat[5] * is2;
    let sm23 = mat[6] * is3;
    let sm31 = mat[8] * is1;
    let sm32 = mat[9] * is2;
    let sm33 = mat[10] * is3;
    let trace = sm11 + sm22 + sm33;
    let S = 0;
    if (trace > 0) {
      S = Math.sqrt(trace + 1) * 2;
      out[3] = 0.25 * S;
      out[0] = (sm23 - sm32) / S;
      out[1] = (sm31 - sm13) / S;
      out[2] = (sm12 - sm21) / S;
    } else if (sm11 > sm22 && sm11 > sm33) {
      S = Math.sqrt(1 + sm11 - sm22 - sm33) * 2;
      out[3] = (sm23 - sm32) / S;
      out[0] = 0.25 * S;
      out[1] = (sm12 + sm21) / S;
      out[2] = (sm31 + sm13) / S;
    } else if (sm22 > sm33) {
      S = Math.sqrt(1 + sm22 - sm11 - sm33) * 2;
      out[3] = (sm31 - sm13) / S;
      out[0] = (sm12 + sm21) / S;
      out[1] = 0.25 * S;
      out[2] = (sm23 + sm32) / S;
    } else {
      S = Math.sqrt(1 + sm33 - sm11 - sm22) * 2;
      out[3] = (sm12 - sm21) / S;
      out[0] = (sm31 + sm13) / S;
      out[1] = (sm23 + sm32) / S;
      out[2] = 0.25 * S;
    }
    return out;
  };
})();
function decompose(srcMat, dstRotation, dstTranslation, dstScale) {
  let sx = length([srcMat[0], srcMat[1], srcMat[2]]);
  const sy = length([srcMat[4], srcMat[5], srcMat[6]]);
  const sz = length([srcMat[8], srcMat[9], srcMat[10]]);
  const det = determinant(srcMat);
  if (det < 0) sx = -sx;
  dstTranslation[0] = srcMat[12];
  dstTranslation[1] = srcMat[13];
  dstTranslation[2] = srcMat[14];
  const _m1 = srcMat.slice();
  const invSX = 1 / sx;
  const invSY = 1 / sy;
  const invSZ = 1 / sz;
  _m1[0] *= invSX;
  _m1[1] *= invSX;
  _m1[2] *= invSX;
  _m1[4] *= invSY;
  _m1[5] *= invSY;
  _m1[6] *= invSY;
  _m1[8] *= invSZ;
  _m1[9] *= invSZ;
  _m1[10] *= invSZ;
  getRotation(dstRotation, _m1);
  dstScale[0] = sx;
  dstScale[1] = sy;
  dstScale[2] = sz;
}
function compose(dstMat, srcRotation, srcTranslation, srcScale) {
  const te = dstMat;
  const x = srcRotation[0], y = srcRotation[1], z = srcRotation[2], w = srcRotation[3];
  const x2 = x + x, y2 = y + y, z2 = z + z;
  const xx = x * x2, xy = x * y2, xz = x * z2;
  const yy = y * y2, yz = y * z2, zz = z * z2;
  const wx = w * x2, wy = w * y2, wz = w * z2;
  const sx = srcScale[0], sy = srcScale[1], sz = srcScale[2];
  te[0] = (1 - (yy + zz)) * sx;
  te[1] = (xy + wz) * sx;
  te[2] = (xz - wy) * sx;
  te[3] = 0;
  te[4] = (xy - wz) * sy;
  te[5] = (1 - (xx + zz)) * sy;
  te[6] = (yz + wx) * sy;
  te[7] = 0;
  te[8] = (xz + wy) * sz;
  te[9] = (yz - wx) * sz;
  te[10] = (1 - (xx + yy)) * sz;
  te[11] = 0;
  te[12] = srcTranslation[0];
  te[13] = srcTranslation[1];
  te[14] = srcTranslation[2];
  te[15] = 1;
  return te;
}
function fromQuat(out, q) {
  let x = q[0], y = q[1], z = q[2], w = q[3];
  let x2 = x + x;
  let y2 = y + y;
  let z2 = z + z;
  let xx = x * x2;
  let yx = y * x2;
  let yy = y * y2;
  let zx = z * x2;
  let zy = z * y2;
  let zz = z * z2;
  let wx = w * x2;
  let wy = w * y2;
  let wz = w * z2;
  out[0] = 1 - yy - zz;
  out[1] = yx + wz;
  out[2] = zx - wy;
  out[3] = 0;
  out[4] = yx - wz;
  out[5] = 1 - xx - zz;
  out[6] = zy + wx;
  out[7] = 0;
  out[8] = zx + wy;
  out[9] = zy - wx;
  out[10] = 1 - xx - yy;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function perspective(out, fovy, aspect, near, far) {
  let f = 1 / Math.tan(fovy / 2);
  let nf = 1 / (near - far);
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = 2 * far * near * nf;
  out[15] = 0;
  return out;
}
function ortho(out, left, right, bottom, top, near, far) {
  let lr = 1 / (left - right);
  let bt = 1 / (bottom - top);
  let nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}
function targetTo(out, eye, target, up) {
  let eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2];
  let z0 = eyex - target[0], z1 = eyey - target[1], z2 = eyez - target[2];
  let len = z0 * z0 + z1 * z1 + z2 * z2;
  if (len === 0) {
    z2 = 1;
  } else {
    len = 1 / Math.sqrt(len);
    z0 *= len;
    z1 *= len;
    z2 *= len;
  }
  let x0 = upy * z2 - upz * z1, x1 = upz * z0 - upx * z2, x2 = upx * z1 - upy * z0;
  len = x0 * x0 + x1 * x1 + x2 * x2;
  if (len === 0) {
    if (upz) {
      upx += 1e-6;
    } else if (upy) {
      upz += 1e-6;
    } else {
      upy += 1e-6;
    }
    x0 = upy * z2 - upz * z1, x1 = upz * z0 - upx * z2, x2 = upx * z1 - upy * z0;
    len = x0 * x0 + x1 * x1 + x2 * x2;
  }
  len = 1 / Math.sqrt(len);
  x0 *= len;
  x1 *= len;
  x2 *= len;
  out[0] = x0;
  out[1] = x1;
  out[2] = x2;
  out[3] = 0;
  out[4] = z1 * x2 - z2 * x1;
  out[5] = z2 * x0 - z0 * x2;
  out[6] = z0 * x1 - z1 * x0;
  out[7] = 0;
  out[8] = z0;
  out[9] = z1;
  out[10] = z2;
  out[11] = 0;
  out[12] = eyex;
  out[13] = eyey;
  out[14] = eyez;
  out[15] = 1;
  return out;
}
function add3(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  out[9] = a[9] + b[9];
  out[10] = a[10] + b[10];
  out[11] = a[11] + b[11];
  out[12] = a[12] + b[12];
  out[13] = a[13] + b[13];
  out[14] = a[14] + b[14];
  out[15] = a[15] + b[15];
  return out;
}
function subtract2(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  out[9] = a[9] - b[9];
  out[10] = a[10] - b[10];
  out[11] = a[11] - b[11];
  out[12] = a[12] - b[12];
  out[13] = a[13] - b[13];
  out[14] = a[14] - b[14];
  out[15] = a[15] - b[15];
  return out;
}
function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  out[9] = a[9] * b;
  out[10] = a[10] * b;
  out[11] = a[11] * b;
  out[12] = a[12] * b;
  out[13] = a[13] * b;
  out[14] = a[14] * b;
  out[15] = a[15] * b;
  return out;
}

// node_modules/.pnpm/ogl@1.0.11/node_modules/ogl/src/math/Mat4.js
var Mat4 = class extends Array {
  constructor(m00 = 1, m01 = 0, m02 = 0, m03 = 0, m10 = 0, m11 = 1, m12 = 0, m13 = 0, m20 = 0, m21 = 0, m22 = 1, m23 = 0, m30 = 0, m31 = 0, m32 = 0, m33 = 1) {
    super(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33);
    return this;
  }
  get x() {
    return this[12];
  }
  get y() {
    return this[13];
  }
  get z() {
    return this[14];
  }
  get w() {
    return this[15];
  }
  set x(v) {
    this[12] = v;
  }
  set y(v) {
    this[13] = v;
  }
  set z(v) {
    this[14] = v;
  }
  set w(v) {
    this[15] = v;
  }
  set(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
    if (m00.length) return this.copy(m00);
    set4(this, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33);
    return this;
  }
  translate(v, m = this) {
    translate(this, m, v);
    return this;
  }
  rotate(v, axis, m = this) {
    rotate(this, m, v, axis);
    return this;
  }
  scale(v, m = this) {
    scale3(this, m, typeof v === "number" ? [v, v, v] : v);
    return this;
  }
  add(ma2, mb) {
    if (mb) add3(this, ma2, mb);
    else add3(this, this, ma2);
    return this;
  }
  sub(ma2, mb) {
    if (mb) subtract2(this, ma2, mb);
    else subtract2(this, this, ma2);
    return this;
  }
  multiply(ma2, mb) {
    if (!ma2.length) {
      multiplyScalar(this, this, ma2);
    } else if (mb) {
      multiply3(this, ma2, mb);
    } else {
      multiply3(this, this, ma2);
    }
    return this;
  }
  identity() {
    identity2(this);
    return this;
  }
  copy(m) {
    copy4(this, m);
    return this;
  }
  fromPerspective({ fov, aspect, near, far } = {}) {
    perspective(this, fov, aspect, near, far);
    return this;
  }
  fromOrthogonal({ left, right, bottom, top, near, far }) {
    ortho(this, left, right, bottom, top, near, far);
    return this;
  }
  fromQuaternion(q) {
    fromQuat(this, q);
    return this;
  }
  setPosition(v) {
    this.x = v[0];
    this.y = v[1];
    this.z = v[2];
    return this;
  }
  inverse(m = this) {
    invert2(this, m);
    return this;
  }
  compose(q, pos, scale5) {
    compose(this, q, pos, scale5);
    return this;
  }
  decompose(q, pos, scale5) {
    decompose(this, q, pos, scale5);
    return this;
  }
  getRotation(q) {
    getRotation(q, this);
    return this;
  }
  getTranslation(pos) {
    getTranslation(pos, this);
    return this;
  }
  getScaling(scale5) {
    getScaling(scale5, this);
    return this;
  }
  getMaxScaleOnAxis() {
    return getMaxScaleOnAxis(this);
  }
  lookAt(eye, target, up) {
    targetTo(this, eye, target, up);
    return this;
  }
  determinant() {
    return determinant(this);
  }
  fromArray(a, o = 0) {
    this[0] = a[o];
    this[1] = a[o + 1];
    this[2] = a[o + 2];
    this[3] = a[o + 3];
    this[4] = a[o + 4];
    this[5] = a[o + 5];
    this[6] = a[o + 6];
    this[7] = a[o + 7];
    this[8] = a[o + 8];
    this[9] = a[o + 9];
    this[10] = a[o + 10];
    this[11] = a[o + 11];
    this[12] = a[o + 12];
    this[13] = a[o + 13];
    this[14] = a[o + 14];
    this[15] = a[o + 15];
    return this;
  }
  toArray(a = [], o = 0) {
    a[o] = this[0];
    a[o + 1] = this[1];
    a[o + 2] = this[2];
    a[o + 3] = this[3];
    a[o + 4] = this[4];
    a[o + 5] = this[5];
    a[o + 6] = this[6];
    a[o + 7] = this[7];
    a[o + 8] = this[8];
    a[o + 9] = this[9];
    a[o + 10] = this[10];
    a[o + 11] = this[11];
    a[o + 12] = this[12];
    a[o + 13] = this[13];
    a[o + 14] = this[14];
    a[o + 15] = this[15];
    return a;
  }
};

// node_modules/.pnpm/ogl@1.0.11/node_modules/ogl/src/math/functions/EulerFunc.js
function fromRotationMatrix(out, m, order = "YXZ") {
  if (order === "XYZ") {
    out[1] = Math.asin(Math.min(Math.max(m[8], -1), 1));
    if (Math.abs(m[8]) < 0.99999) {
      out[0] = Math.atan2(-m[9], m[10]);
      out[2] = Math.atan2(-m[4], m[0]);
    } else {
      out[0] = Math.atan2(m[6], m[5]);
      out[2] = 0;
    }
  } else if (order === "YXZ") {
    out[0] = Math.asin(-Math.min(Math.max(m[9], -1), 1));
    if (Math.abs(m[9]) < 0.99999) {
      out[1] = Math.atan2(m[8], m[10]);
      out[2] = Math.atan2(m[1], m[5]);
    } else {
      out[1] = Math.atan2(-m[2], m[0]);
      out[2] = 0;
    }
  } else if (order === "ZXY") {
    out[0] = Math.asin(Math.min(Math.max(m[6], -1), 1));
    if (Math.abs(m[6]) < 0.99999) {
      out[1] = Math.atan2(-m[2], m[10]);
      out[2] = Math.atan2(-m[4], m[5]);
    } else {
      out[1] = 0;
      out[2] = Math.atan2(m[1], m[0]);
    }
  } else if (order === "ZYX") {
    out[1] = Math.asin(-Math.min(Math.max(m[2], -1), 1));
    if (Math.abs(m[2]) < 0.99999) {
      out[0] = Math.atan2(m[6], m[10]);
      out[2] = Math.atan2(m[1], m[0]);
    } else {
      out[0] = 0;
      out[2] = Math.atan2(-m[4], m[5]);
    }
  } else if (order === "YZX") {
    out[2] = Math.asin(Math.min(Math.max(m[1], -1), 1));
    if (Math.abs(m[1]) < 0.99999) {
      out[0] = Math.atan2(-m[9], m[5]);
      out[1] = Math.atan2(-m[2], m[0]);
    } else {
      out[0] = 0;
      out[1] = Math.atan2(m[8], m[10]);
    }
  } else if (order === "XZY") {
    out[2] = Math.asin(-Math.min(Math.max(m[4], -1), 1));
    if (Math.abs(m[4]) < 0.99999) {
      out[0] = Math.atan2(m[6], m[5]);
      out[1] = Math.atan2(m[8], m[0]);
    } else {
      out[0] = Math.atan2(-m[9], m[10]);
      out[1] = 0;
    }
  }
  return out;
}

// node_modules/.pnpm/ogl@1.0.11/node_modules/ogl/src/math/Euler.js
var tmpMat4 = /* @__PURE__ */ new Mat4();
var Euler = class extends Array {
  constructor(x = 0, y = x, z = x, order = "YXZ") {
    super(x, y, z);
    this.order = order;
    this.onChange = () => {
    };
    this._target = this;
    const triggerProps = ["0", "1", "2"];
    return new Proxy(this, {
      set(target, property) {
        const success = Reflect.set(...arguments);
        if (success && triggerProps.includes(property)) target.onChange();
        return success;
      }
    });
  }
  get x() {
    return this[0];
  }
  get y() {
    return this[1];
  }
  get z() {
    return this[2];
  }
  set x(v) {
    this._target[0] = v;
    this.onChange();
  }
  set y(v) {
    this._target[1] = v;
    this.onChange();
  }
  set z(v) {
    this._target[2] = v;
    this.onChange();
  }
  set(x, y = x, z = x) {
    if (x.length) return this.copy(x);
    this._target[0] = x;
    this._target[1] = y;
    this._target[2] = z;
    this.onChange();
    return this;
  }
  copy(v) {
    this._target[0] = v[0];
    this._target[1] = v[1];
    this._target[2] = v[2];
    this.onChange();
    return this;
  }
  reorder(order) {
    this._target.order = order;
    this.onChange();
    return this;
  }
  fromRotationMatrix(m, order = this.order) {
    fromRotationMatrix(this._target, m, order);
    this.onChange();
    return this;
  }
  fromQuaternion(q, order = this.order, isInternal) {
    tmpMat4.fromQuaternion(q);
    this._target.fromRotationMatrix(tmpMat4, order);
    if (!isInternal) this.onChange();
    return this;
  }
  fromArray(a, o = 0) {
    this._target[0] = a[o];
    this._target[1] = a[o + 1];
    this._target[2] = a[o + 2];
    return this;
  }
  toArray(a = [], o = 0) {
    a[o] = this[0];
    a[o + 1] = this[1];
    a[o + 2] = this[2];
    return a;
  }
};

// node_modules/.pnpm/ogl@1.0.11/node_modules/ogl/src/core/Transform.js
var Transform = class {
  constructor() {
    this.parent = null;
    this.children = [];
    this.visible = true;
    this.matrix = new Mat4();
    this.worldMatrix = new Mat4();
    this.matrixAutoUpdate = true;
    this.worldMatrixNeedsUpdate = false;
    this.position = new Vec3();
    this.quaternion = new Quat();
    this.scale = new Vec3(1);
    this.rotation = new Euler();
    this.up = new Vec3(0, 1, 0);
    this.rotation._target.onChange = () => this.quaternion.fromEuler(this.rotation, true);
    this.quaternion._target.onChange = () => this.rotation.fromQuaternion(this.quaternion, void 0, true);
  }
  setParent(parent, notifyParent = true) {
    if (this.parent && parent !== this.parent) this.parent.removeChild(this, false);
    this.parent = parent;
    if (notifyParent && parent) parent.addChild(this, false);
  }
  addChild(child, notifyChild = true) {
    if (!~this.children.indexOf(child)) this.children.push(child);
    if (notifyChild) child.setParent(this, false);
  }
  removeChild(child, notifyChild = true) {
    if (!!~this.children.indexOf(child)) this.children.splice(this.children.indexOf(child), 1);
    if (notifyChild) child.setParent(null, false);
  }
  updateMatrixWorld(force) {
    if (this.matrixAutoUpdate) this.updateMatrix();
    if (this.worldMatrixNeedsUpdate || force) {
      if (this.parent === null) this.worldMatrix.copy(this.matrix);
      else this.worldMatrix.multiply(this.parent.worldMatrix, this.matrix);
      this.worldMatrixNeedsUpdate = false;
      force = true;
    }
    for (let i = 0, l = this.children.length; i < l; i++) {
      this.children[i].updateMatrixWorld(force);
    }
  }
  updateMatrix() {
    this.matrix.compose(this.quaternion, this.position, this.scale);
    this.worldMatrixNeedsUpdate = true;
  }
  traverse(callback) {
    if (callback(this)) return;
    for (let i = 0, l = this.children.length; i < l; i++) {
      this.children[i].traverse(callback);
    }
  }
  decompose() {
    this.matrix.decompose(this.quaternion._target, this.position, this.scale);
    this.rotation.fromQuaternion(this.quaternion);
  }
  lookAt(target, invert4 = false) {
    if (invert4) this.matrix.lookAt(this.position, target, this.up);
    else this.matrix.lookAt(target, this.position, this.up);
    this.matrix.getRotation(this.quaternion._target);
    this.rotation.fromQuaternion(this.quaternion);
  }
};

// node_modules/.pnpm/ogl@1.0.11/node_modules/ogl/src/math/functions/Mat3Func.js
function fromMat4(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[4];
  out[4] = a[5];
  out[5] = a[6];
  out[6] = a[8];
  out[7] = a[9];
  out[8] = a[10];
  return out;
}
function fromQuat2(out, q) {
  let x = q[0], y = q[1], z = q[2], w = q[3];
  let x2 = x + x;
  let y2 = y + y;
  let z2 = z + z;
  let xx = x * x2;
  let yx = y * x2;
  let yy = y * y2;
  let zx = z * x2;
  let zy = z * y2;
  let zz = z * z2;
  let wx = w * x2;
  let wy = w * y2;
  let wz = w * z2;
  out[0] = 1 - yy - zz;
  out[3] = yx - wz;
  out[6] = zx + wy;
  out[1] = yx + wz;
  out[4] = 1 - xx - zz;
  out[7] = zy - wx;
  out[2] = zx - wy;
  out[5] = zy + wx;
  out[8] = 1 - xx - yy;
  return out;
}
function copy5(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}
function set5(out, m00, m01, m02, m10, m11, m12, m20, m21, m22) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m10;
  out[4] = m11;
  out[5] = m12;
  out[6] = m20;
  out[7] = m21;
  out[8] = m22;
  return out;
}
function identity3(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 1;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}
function invert3(out, a) {
  let a00 = a[0], a01 = a[1], a02 = a[2];
  let a10 = a[3], a11 = a[4], a12 = a[5];
  let a20 = a[6], a21 = a[7], a22 = a[8];
  let b01 = a22 * a11 - a12 * a21;
  let b11 = -a22 * a10 + a12 * a20;
  let b21 = a21 * a10 - a11 * a20;
  let det = a00 * b01 + a01 * b11 + a02 * b21;
  if (!det) {
    return null;
  }
  det = 1 / det;
  out[0] = b01 * det;
  out[1] = (-a22 * a01 + a02 * a21) * det;
  out[2] = (a12 * a01 - a02 * a11) * det;
  out[3] = b11 * det;
  out[4] = (a22 * a00 - a02 * a20) * det;
  out[5] = (-a12 * a00 + a02 * a10) * det;
  out[6] = b21 * det;
  out[7] = (-a21 * a00 + a01 * a20) * det;
  out[8] = (a11 * a00 - a01 * a10) * det;
  return out;
}
function multiply4(out, a, b) {
  let a00 = a[0], a01 = a[1], a02 = a[2];
  let a10 = a[3], a11 = a[4], a12 = a[5];
  let a20 = a[6], a21 = a[7], a22 = a[8];
  let b00 = b[0], b01 = b[1], b02 = b[2];
  let b10 = b[3], b11 = b[4], b12 = b[5];
  let b20 = b[6], b21 = b[7], b22 = b[8];
  out[0] = b00 * a00 + b01 * a10 + b02 * a20;
  out[1] = b00 * a01 + b01 * a11 + b02 * a21;
  out[2] = b00 * a02 + b01 * a12 + b02 * a22;
  out[3] = b10 * a00 + b11 * a10 + b12 * a20;
  out[4] = b10 * a01 + b11 * a11 + b12 * a21;
  out[5] = b10 * a02 + b11 * a12 + b12 * a22;
  out[6] = b20 * a00 + b21 * a10 + b22 * a20;
  out[7] = b20 * a01 + b21 * a11 + b22 * a21;
  out[8] = b20 * a02 + b21 * a12 + b22 * a22;
  return out;
}
function translate2(out, a, v) {
  let a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8], x = v[0], y = v[1];
  out[0] = a00;
  out[1] = a01;
  out[2] = a02;
  out[3] = a10;
  out[4] = a11;
  out[5] = a12;
  out[6] = x * a00 + y * a10 + a20;
  out[7] = x * a01 + y * a11 + a21;
  out[8] = x * a02 + y * a12 + a22;
  return out;
}
function rotate2(out, a, rad) {
  let a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8], s = Math.sin(rad), c = Math.cos(rad);
  out[0] = c * a00 + s * a10;
  out[1] = c * a01 + s * a11;
  out[2] = c * a02 + s * a12;
  out[3] = c * a10 - s * a00;
  out[4] = c * a11 - s * a01;
  out[5] = c * a12 - s * a02;
  out[6] = a20;
  out[7] = a21;
  out[8] = a22;
  return out;
}
function scale4(out, a, v) {
  let x = v[0], y = v[1];
  out[0] = x * a[0];
  out[1] = x * a[1];
  out[2] = x * a[2];
  out[3] = y * a[3];
  out[4] = y * a[4];
  out[5] = y * a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}
function normalFromMat4(out, a) {
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  let b00 = a00 * a11 - a01 * a10;
  let b01 = a00 * a12 - a02 * a10;
  let b02 = a00 * a13 - a03 * a10;
  let b03 = a01 * a12 - a02 * a11;
  let b04 = a01 * a13 - a03 * a11;
  let b05 = a02 * a13 - a03 * a12;
  let b06 = a20 * a31 - a21 * a30;
  let b07 = a20 * a32 - a22 * a30;
  let b08 = a20 * a33 - a23 * a30;
  let b09 = a21 * a32 - a22 * a31;
  let b10 = a21 * a33 - a23 * a31;
  let b11 = a22 * a33 - a23 * a32;
  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) {
    return null;
  }
  det = 1 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  return out;
}

// node_modules/.pnpm/ogl@1.0.11/node_modules/ogl/src/math/Mat3.js
var Mat3 = class extends Array {
  constructor(m00 = 1, m01 = 0, m02 = 0, m10 = 0, m11 = 1, m12 = 0, m20 = 0, m21 = 0, m22 = 1) {
    super(m00, m01, m02, m10, m11, m12, m20, m21, m22);
    return this;
  }
  set(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
    if (m00.length) return this.copy(m00);
    set5(this, m00, m01, m02, m10, m11, m12, m20, m21, m22);
    return this;
  }
  translate(v, m = this) {
    translate2(this, m, v);
    return this;
  }
  rotate(v, m = this) {
    rotate2(this, m, v);
    return this;
  }
  scale(v, m = this) {
    scale4(this, m, v);
    return this;
  }
  multiply(ma2, mb) {
    if (mb) {
      multiply4(this, ma2, mb);
    } else {
      multiply4(this, this, ma2);
    }
    return this;
  }
  identity() {
    identity3(this);
    return this;
  }
  copy(m) {
    copy5(this, m);
    return this;
  }
  fromMatrix4(m) {
    fromMat4(this, m);
    return this;
  }
  fromQuaternion(q) {
    fromQuat2(this, q);
    return this;
  }
  fromBasis(vec3a, vec3b, vec3c) {
    this.set(vec3a[0], vec3a[1], vec3a[2], vec3b[0], vec3b[1], vec3b[2], vec3c[0], vec3c[1], vec3c[2]);
    return this;
  }
  inverse(m = this) {
    invert3(this, m);
    return this;
  }
  getNormalMatrix(m) {
    normalFromMat4(this, m);
    return this;
  }
};

// node_modules/.pnpm/ogl@1.0.11/node_modules/ogl/src/core/Mesh.js
var ID4 = 0;
var Mesh = class extends Transform {
  constructor(gl, { geometry, program, mode = gl.TRIANGLES, frustumCulled = true, renderOrder = 0 } = {}) {
    super();
    if (!gl.canvas) console.error("gl not passed as first argument to Mesh");
    this.gl = gl;
    this.id = ID4++;
    this.geometry = geometry;
    this.program = program;
    this.mode = mode;
    this.frustumCulled = frustumCulled;
    this.renderOrder = renderOrder;
    this.modelViewMatrix = new Mat4();
    this.normalMatrix = new Mat3();
    this.beforeRenderCallbacks = [];
    this.afterRenderCallbacks = [];
  }
  onBeforeRender(f) {
    this.beforeRenderCallbacks.push(f);
    return this;
  }
  onAfterRender(f) {
    this.afterRenderCallbacks.push(f);
    return this;
  }
  draw({ camera } = {}) {
    if (camera) {
      if (!this.program.uniforms.modelMatrix) {
        Object.assign(this.program.uniforms, {
          modelMatrix: { value: null },
          viewMatrix: { value: null },
          modelViewMatrix: { value: null },
          normalMatrix: { value: null },
          projectionMatrix: { value: null },
          cameraPosition: { value: null }
        });
      }
      this.program.uniforms.projectionMatrix.value = camera.projectionMatrix;
      this.program.uniforms.cameraPosition.value = camera.worldPosition;
      this.program.uniforms.viewMatrix.value = camera.viewMatrix;
      this.modelViewMatrix.multiply(camera.viewMatrix, this.worldMatrix);
      this.normalMatrix.getNormalMatrix(this.modelViewMatrix);
      this.program.uniforms.modelMatrix.value = this.worldMatrix;
      this.program.uniforms.modelViewMatrix.value = this.modelViewMatrix;
      this.program.uniforms.normalMatrix.value = this.normalMatrix;
    }
    this.beforeRenderCallbacks.forEach((f) => f && f({ mesh: this, camera }));
    let flipFaces = this.program.cullFace && this.worldMatrix.determinant() < 0;
    this.program.use({ flipFaces });
    this.geometry.draw({ mode: this.mode, program: this.program });
    this.afterRenderCallbacks.forEach((f) => f && f({ mesh: this, camera }));
  }
};

// node_modules/.pnpm/ogl@1.0.11/node_modules/ogl/src/extras/Triangle.js
var Triangle = class extends Geometry {
  constructor(gl, { attributes = {} } = {}) {
    Object.assign(attributes, {
      position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
      uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) }
    });
    super(gl, attributes);
  }
};

// src/client/scanner.js
var vertex = `#version 300 es
in vec2 position;
void main(){gl_Position=vec4(position,0.0,1.0);}
`;
var fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uSweepSpeed;
uniform float uSweepWidth;
uniform float uSweepFalloff;
uniform float uScale;
uniform float uFrequency;
uniform float uRipple;
uniform float uBandDensity;
uniform float uLineSharpness;
uniform float uGlow;
uniform float uColorSpread;
uniform float uBrightness;
uniform float uContrast;
uniform float uSoftness;
uniform float uVignette;
uniform float uOpacity;
uniform float uScanline;
uniform float uGrain;
uniform float uGrainIntensity;
uniform float uDirection;
uniform vec2 uMouse;
uniform float uMouseEnabled;
uniform float uMouseRadius;
uniform float uMouseStrength;
uniform float uMouseActive;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;

const float TAU=6.2831853;

float signalField(vec2 p,float t){
  float w=sin(p.x*1.3+t*0.7);
  w+=sin(p.y*1.7-t*0.52)*0.8;
  w+=sin((p.x+p.y)*0.9+t*0.91)*0.6;
  w+=sin((p.x-p.y)*1.53-t*0.63)*0.42;
  return w*0.35;
}

vec3 palette(float f){
  f=clamp(f,0.0,1.0);
  f=pow(f,uContrast);
  vec3 c=mix(uColor1,uColor2,smoothstep(0.08,0.6,f));
  return mix(c,uColor3,smoothstep(0.68,1.0,f));
}

float scanBand(float x,float aa,float sharp){
  float v=mix(0.5,0.5+0.5*cos(x*TAU),aa);
  return pow(v,sharp);
}

void main(){
  float aspect=iResolution.x/iResolution.y;
  vec2 uv0=(gl_FragCoord.xy*2.0-iResolution.xy)/iResolution.y;
  vec2 p=uv0/max(uScale,0.001);
  float t=iTime*uSpeed;
  float mouseBoost=0.0;
  if(uMouseEnabled>0.5){
    vec2 mUv=vec2((uMouse.x*2.0-1.0)*aspect,uMouse.y*2.0-1.0);
    vec2 md=uv0-mUv;
    float r=max(uMouseRadius,0.001);
    mouseBoost=exp(-dot(md,md)/(r*r))*uMouseStrength*uMouseActive;
  }
  float axis;
  if(uDirection<0.5)axis=p.y;
  else if(uDirection<1.5)axis=p.x;
  else axis=(p.x+p.y)*0.70710678;
  float sig=signalField(p*uFrequency,t);
  float coord=axis+sig*uRipple;
  float phase=coord/max(uSweepWidth,0.05)-t*uSweepSpeed;
  float sweep=pow(0.5+0.5*cos(phase*TAU),max(uSweepFalloff,0.1));
  float lc=coord*uBandDensity;
  float aa=1.0/(1.0+uSoftness*fwidth(lc)*3.0);
  aa=clamp(aa*(1.0+mouseBoost*0.6),0.0,1.0);
  float bodyBase=clamp(0.5+0.5*sig,0.0,1.0);
  float body=bodyBase*bodyBase*uGlow*sweep;
  float sharp=max(uLineSharpness,0.1);
  float split=uColorSpread*0.16;
  float fr=clamp(scanBand(lc+split,aa,sharp)*sweep+body,0.0,1.0);
  float fg=clamp(scanBand(lc,aa,sharp)*sweep+body,0.0,1.0);
  float fb=clamp(scanBand(lc-split,aa,sharp)*sweep+body,0.0,1.0);
  vec3 col=vec3(palette(fr).r,palette(fg).g,palette(fb).b);
  float inten=(fr+fg+fb)*0.3333333*uBrightness;
  inten*=1.0+mouseBoost*0.9;
  if(uScanline>0.5)inten*=1.0-0.18*(0.5+0.5*cos(gl_FragCoord.y*1.7));
  if(uGrain>0.5){
    float g=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233))+iTime)*43758.5453);
    inten+=(g-0.5)*uGrainIntensity;
  }
  inten*=clamp(1.0-uVignette*smoothstep(0.55,1.65,length(uv0)),0.0,1.0);
  inten=clamp(inten,0.0,1.0);
  float a=clamp(inten*uOpacity,0.0,1.0);
  fragColor=vec4(clamp(col,0.0,1.0)*a,a);
}
`;
var contexts = /* @__PURE__ */ new WeakMap();
var hexToRgb = (hex) => {
  const value = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return value ? [parseInt(value[1], 16) / 255, parseInt(value[2], 16) / 255, parseInt(value[3], 16) / 255] : [1, 1, 1];
};
var directionToFloat = (direction) => direction === "horizontal" ? 1 : direction === "diagonal" ? 2 : 0;
function Scanner({
  color1 = "#e0deea",
  color2 = "#a69fff",
  color3 = "#ffffff",
  speed = 0.15,
  sweepSpeed = 0.25,
  sweepWidth = 1.6,
  sweepFalloff = 6,
  scale: scale5 = 1.5,
  frequency = 2,
  ripple = 0.7,
  bandDensity = 11,
  lineSharpness = 5.5,
  glow = 0.2,
  scanDirection = "vertical",
  colorSpread = 0.69,
  brightness = 1,
  contrast = 1.2,
  softness = 1.55,
  vignette = 0.45,
  scanline = true,
  grain = true,
  grainIntensity = 0.05,
  opacity = 0.4,
  mouseInteraction = true,
  mouseRadius = 0.5,
  mouseStrength = 0.5,
  className = "",
  portal = false
}) {
  const containerRef = React5.useRef(null);
  const hostRef = React5.useRef(null);
  const mouseEnabledRef = React5.useRef(mouseInteraction);
  React5.useEffect(() => {
    const anchor = containerRef.current;
    if (!anchor) return void 0;
    const container = portal ? document.createElement("div") : anchor;
    if (portal) {
      container.className = `clustr-scanner ${className}`.trim();
      container.setAttribute("aria-hidden", "true");
      document.body.prepend(container);
    }
    hostRef.current = container;
    let renderer;
    try {
      renderer = new Renderer({ webgl: 2, alpha: true, premultipliedAlpha: true, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 1.6) });
    } catch {
      container.dataset.scannerFallback = "true";
      return () => {
        if (portal) container.remove();
        hostRef.current = null;
      };
    }
    const gl = renderer.gl;
    if (!gl) {
      container.dataset.scannerFallback = "true";
      return () => {
        if (portal) container.remove();
        hostRef.current = null;
      };
    }
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas;
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, { width: "100%", height: "100%", display: "block" });
    container.appendChild(canvas);
    let program;
    let mesh;
    try {
      program = new Program(gl, { vertex, fragment, uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uSpeed: { value: 0.15 },
        uSweepSpeed: { value: 0.25 },
        uSweepWidth: { value: 1.6 },
        uSweepFalloff: { value: 6 },
        uScale: { value: 1.5 },
        uFrequency: { value: 2 },
        uRipple: { value: 0.7 },
        uBandDensity: { value: 11 },
        uLineSharpness: { value: 5.5 },
        uGlow: { value: 0.2 },
        uColorSpread: { value: 0.69 },
        uBrightness: { value: 1 },
        uContrast: { value: 1.2 },
        uSoftness: { value: 1.55 },
        uVignette: { value: 0.45 },
        uOpacity: { value: 0.4 },
        uScanline: { value: 1 },
        uGrain: { value: 1 },
        uGrainIntensity: { value: 0.05 },
        uDirection: { value: 0 },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uMouseEnabled: { value: 1 },
        uMouseRadius: { value: 0.5 },
        uMouseStrength: { value: 0.5 },
        uMouseActive: { value: 0 },
        uColor1: { value: new Float32Array([1, 1, 1]) },
        uColor2: { value: new Float32Array([1, 1, 1]) },
        uColor3: { value: new Float32Array([1, 1, 1]) }
      } });
      mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    } catch {
      container.dataset.scannerFallback = "true";
      canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return () => {
        if (portal) container.remove();
        hostRef.current = null;
      };
    }
    contexts.set(container, { program });
    const render = () => renderer.render({ scene: mesh });
    const setSize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)));
      program.uniforms.iResolution.value[0] = gl.drawingBufferWidth;
      program.uniforms.iResolution.value[1] = gl.drawingBufferHeight;
      render();
    };
    const ro = new ResizeObserver(setSize);
    ro.observe(container);
    setSize();
    let currentMouse = [0.5, 0.5];
    let targetMouse = [0.5, 0.5];
    let mouseActive = 0;
    let targetMouseActive = 0;
    const onPointerMove = (event) => {
      targetMouse = [event.clientX / Math.max(1, window.innerWidth), 1 - event.clientY / Math.max(1, window.innerHeight)];
      targetMouseActive = 1;
    };
    const onPointerLeave = () => {
      targetMouseActive = 0;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);
    let raf = 0;
    let isVisible = true;
    let pageVisible = !document.hidden;
    let reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const start = performance.now();
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const loop = (now) => {
      program.uniforms.iTime.value = (now - start) * 1e-3;
      if (!mouseEnabledRef.current) targetMouseActive = 0;
      currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
      currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
      program.uniforms.uMouse.value[0] = currentMouse[0];
      program.uniforms.uMouse.value[1] = currentMouse[1];
      mouseActive += 0.05 * (targetMouseActive - mouseActive);
      program.uniforms.uMouseActive.value = mouseActive;
      render();
      raf = requestAnimationFrame(loop);
    };
    const sync = () => {
      if (isVisible && pageVisible && !reduceMotion && !raf) raf = requestAnimationFrame(loop);
      else if (!isVisible || !pageVisible || reduceMotion) {
        stop();
        render();
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      sync();
    }, { threshold: 0 });
    io.observe(container);
    const onVisibility = () => {
      pageVisible = !document.hidden;
      sync();
    };
    const onMotion = (event) => {
      reduceMotion = event.matches;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    motionQuery.addEventListener?.("change", onMotion);
    sync();
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery.removeEventListener?.("change", onMotion);
      contexts.delete(container);
      canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (portal) container.remove();
      hostRef.current = null;
    };
  }, []);
  React5.useEffect(() => {
    const ctx = contexts.get(hostRef.current ?? containerRef.current);
    if (!ctx) return;
    const u = ctx.program.uniforms;
    Object.assign(u.uSpeed, { value: speed });
    Object.assign(u.uSweepSpeed, { value: sweepSpeed });
    Object.assign(u.uSweepWidth, { value: sweepWidth });
    Object.assign(u.uSweepFalloff, { value: sweepFalloff });
    Object.assign(u.uScale, { value: scale5 });
    Object.assign(u.uFrequency, { value: frequency });
    Object.assign(u.uRipple, { value: ripple });
    Object.assign(u.uBandDensity, { value: bandDensity });
    Object.assign(u.uLineSharpness, { value: lineSharpness });
    Object.assign(u.uGlow, { value: glow });
    Object.assign(u.uColorSpread, { value: colorSpread });
    Object.assign(u.uBrightness, { value: brightness });
    Object.assign(u.uContrast, { value: contrast });
    Object.assign(u.uSoftness, { value: softness });
    Object.assign(u.uVignette, { value: vignette });
    Object.assign(u.uOpacity, { value: opacity });
    Object.assign(u.uScanline, { value: scanline ? 1 : 0 });
    Object.assign(u.uGrain, { value: grain ? 1 : 0 });
    Object.assign(u.uGrainIntensity, { value: grainIntensity });
    Object.assign(u.uDirection, { value: directionToFloat(scanDirection) });
    Object.assign(u.uMouseEnabled, { value: mouseInteraction ? 1 : 0 });
    Object.assign(u.uMouseRadius, { value: mouseRadius });
    Object.assign(u.uMouseStrength, { value: mouseStrength });
    mouseEnabledRef.current = mouseInteraction;
    [[u.uColor1, color1], [u.uColor2, color2], [u.uColor3, color3]].forEach(([uniform, color]) => {
      const rgb = hexToRgb(color);
      uniform.value[0] = rgb[0];
      uniform.value[1] = rgb[1];
      uniform.value[2] = rgb[2];
    });
  }, [color1, color2, color3, speed, sweepSpeed, sweepWidth, sweepFalloff, scale5, frequency, ripple, bandDensity, lineSharpness, glow, scanDirection, colorSpread, brightness, contrast, softness, vignette, scanline, grain, grainIntensity, opacity, mouseInteraction, mouseRadius, mouseStrength]);
  return portal ? React5.createElement("span", { ref: containerRef, className: "clustr-scanner-anchor", "aria-hidden": true }) : React5.createElement("div", { ref: containerRef, className: `clustr-scanner ${className}`.trim(), "aria-hidden": true });
}

// src/client/experience.js
var CLUSTR_HERO_PLACEHOLDER = "\u8F93\u5165\u4EA4\u6613\u6807\u7684\u3001\u5E02\u573A\u89C2\u5BDF\u3001\u98CE\u9669\u9884\u7B97\uFF0C\u6216\u76F4\u63A5\u63CF\u8FF0\u4F60\u7684\u4EA4\u6613\u610F\u56FE";
var GLOBAL_CSS = `
  html,body{background:#05040a!important}
  body{position:relative;color:#f4f1f7;color-scheme:dark}
  #root{position:relative;z-index:1;background:transparent!important}
  [data-slot="root"]{
    --dsw-alias-bg-base:rgba(6,5,12,.42);
    --dsw-alias-bg-layer-1:rgba(11,9,20,.82);
    --dsw-alias-bg-layer-2:rgba(16,13,28,.88);
    --dsw-alias-bg-layer-3:rgba(21,17,36,.94);
    --dsw-alias-bg-module-platform:rgba(255,255,255,.045);
    --dsw-alias-bg-multi-select:rgba(255,255,255,.065);
    --dsw-alias-bg-overlay:rgba(18,15,31,.98);
    --dsw-alias-bg-skeleton:rgba(255,255,255,.055);
    --dsw-alias-border-l1:rgba(255,255,255,.07);
    --dsw-alias-border-l2:rgba(255,255,255,.12);
    --dsw-alias-border-l2-darkmode-thin:rgba(255,255,255,.12);
    --dsw-alias-border-l3:rgba(255,255,255,.17);
    --dsw-alias-border-l4:rgba(255,255,255,.22);
    --dsw-alias-label-primary:#f4f1f7;
    --dsw-alias-label-primary-dimmed:#e2dde8;
    --dsw-alias-label-primary-bluish:#ded7ff;
    --dsw-alias-label-secondary:#b9b1c4;
    --dsw-alias-label-tertiary:#8f879a;
    --dsw-alias-label-caption:#746d7f;
    --dsw-alias-label-dimmed:#5e5868;
    --dsw-alias-brand-primary:#f4f1f7;
    --dsw-alias-brand-text:#f4f1f7;
    --dsw-alias-brand-primary-invert:#090710;
    --dsw-alias-button-primary-fill:#f4f1f7;
    --dsw-alias-button-primary-hover:#ded7e5;
    --dsw-alias-button-primary-dimmed:#4c4655;
    --dsw-alias-button-elevated-fill:rgba(19,16,31,.94);
    --dsw-alias-button-floating-fill:rgba(19,16,31,.94);
    --dsw-alias-button-floating-hover:rgba(255,255,255,.09);
    --dsw-alias-button-contrast-fill:#a69fff;
    --dsw-alias-button-info-fill:#9f96ff;
    --dsw-alias-button-info-hover:#b9b2ff;
    --dsw-alias-interactive-bg-hover:rgba(222,215,255,.07);
    --dsw-alias-interactive-bg-hover-accent:rgba(166,159,255,.15);
    --dsw-alias-interactive-bg-active:rgba(166,159,255,.18);
    --dsw-alias-interactive-bg-hover-solid:rgba(255,255,255,.08);
    --dsw-alias-scrollbar-bg-l1:rgba(255,255,255,.12);
    --dsw-alias-scrollbar-bg-l2:rgba(255,255,255,.12);
    --dsw-alias-scrollbar-hover-l1:rgba(255,255,255,.22);
    --dsw-specific-sidebar-fill:rgba(8,7,14,.72);
    --dsw-specific-sidebar-nav-item-active:rgba(166,159,255,.14);
    --dsw-specific-sidebar-nav-item-active-accent:rgba(166,159,255,.2);
    --dsw-specific-sidebar-nav-item-hover:rgba(255,255,255,.065);
    --dsw-specific-selector:rgba(255,255,255,.06);
    --dsw-specific-input-major:rgba(12,10,22,.9);
    --dsw-specific-menu:rgba(13,11,23,.98);
    --dsw-specific-tip:rgba(19,16,31,.98);
    --dsw-specific-bubble:rgba(166,159,255,.13);
    --dsw-specific-bubble-highlight:rgba(166,159,255,.19);
    --dsw-alias-markdown-code-block:rgba(11,9,20,.9);
    --dsw-alias-markdown-code-block-banner:rgba(19,16,31,.94);
    --dsw-alias-markdown-inline-code:rgba(166,159,255,.13);
    --dsw-alias-markdown-tag:rgba(255,255,255,.07);
    --dsw-shadow-lv1:0 1px 0 rgba(255,255,255,.04),0 10px 30px rgba(0,0,0,.16);
    --dsw-shadow-lv2:0 1px 0 rgba(255,255,255,.05),0 18px 48px rgba(0,0,0,.24);
    --dsw-shadow-lv3:0 1px 0 rgba(255,255,255,.06),0 28px 80px rgba(0,0,0,.42);
    position:relative;
    color:#f4f1f7;
    background:linear-gradient(180deg,rgba(3,3,8,.22),rgba(5,4,10,.55))!important;
    isolation:isolate;
  }
  [data-slot="root"] *{scrollbar-color:rgba(255,255,255,.16) transparent}
  [data-slot="root"] button,[data-slot="root"] input,[data-slot="root"] textarea,[data-slot="root"] select{font-family:inherit}
  [data-slot="sidebar"]{background:rgba(7,6,12,.72)!important;border-right:1px solid rgba(255,255,255,.08);backdrop-filter:blur(28px) saturate(118%)}
  button[aria-label="\u65B0\u5EFA\u4F1A\u8BDD"][class*="_brand"]{color:#d8d3e2!important;filter:drop-shadow(0 4px 14px rgba(166,159,255,.08))}
  button[aria-label="\u65B0\u5EFA\u4F1A\u8BDD"][class*="_brand"]>svg{display:block!important}
  button[aria-label="\u65B0\u5EFA\u4F1A\u8BDD"][class*="_brand"]>svg>rect{fill:#7469ad!important}
  button[aria-label="\u65B0\u5EFA\u4F1A\u8BDD"][class*="_brand"]>svg>g:nth-of-type(2) path{fill:#f8f6ff!important}
  button[aria-label="\u6253\u5F00\u4FA7\u8FB9\u680F"]>svg[class*="_railFish"]{opacity:1!important;color:#d8d3e2!important;filter:drop-shadow(0 4px 12px rgba(166,159,255,.12))}
  [data-slot="conversation.session.header"]{background:linear-gradient(180deg,rgba(8,7,14,.8),rgba(8,7,14,.58))!important;border-bottom:1px solid rgba(255,255,255,.075);backdrop-filter:blur(24px) saturate(120%)}
  [data-slot="conversation"]{background:transparent!important}
  [data-slot="conversation.composer"]{background:transparent!important}
  [data-composer-seat]{background:linear-gradient(180deg,transparent 0%,rgba(5,4,10,.34) 28%,rgba(5,4,10,.72) 70%,rgba(5,4,10,.88) 100%)!important}
  [data-slot="conversation.composer.bar"]>div{background:transparent!important;border-color:transparent!important;box-shadow:none!important;backdrop-filter:none!important}
  [data-composer-card="true"]{background:rgba(12,10,22,.9)!important;border-color:rgba(255,255,255,.12)!important;box-shadow:inset 0 1px rgba(255,255,255,.055),0 22px 64px rgba(0,0,0,.28)!important;backdrop-filter:blur(24px) saturate(128%)}
  [data-slot="conversation.session.header"] button,[data-slot="sidebar"] button{transition:background-color .18s ease,border-color .18s ease,color .18s ease,transform .18s ease}
  [data-slot="sidebar"] [role="treeitem"][aria-selected="true"]{box-shadow:inset 2px 0 #a69fff;background:rgba(166,159,255,.13)!important}
  [data-slot="conversation.session.header"] [role="tab"][aria-selected="true"]{color:#f4f1f7!important;border-color:#a69fff!important;box-shadow:inset 0 -2px #a69fff}
  [data-slot="conversation.session.header"] [role="tab"][aria-selected="true"]:after{background:#a69fff!important}
  [data-slot="conversation.session.header"] [role="tab"]:focus-visible{outline:2px solid rgba(166,159,255,.72)!important;outline-offset:2px}
  [data-phase="hero"]{--dsh-chat-content-width:min(1180px,calc(100vw - 128px))}
  [data-phase="hero"] [data-clustr-native-hero]{display:none!important}
  [data-phase="hero"] [data-composer-seat]{padding-top:16px}
  .clustr-hero-entry{box-sizing:border-box;width:100%;display:flex;flex-direction:column;align-items:center;gap:12px;margin:24px 0 2px;padding:0 16px;color:#f4f1f7;font-family:General Sans,Geist Sans,Inter,sans-serif}
  .clustr-hero-heading{display:flex;align-items:center;justify-content:center;gap:22px;text-align:left;animation:clustr-layer-arrive 420ms 20ms cubic-bezier(.23,1,.32,1) both}
  .clustr-hero-heading>div{min-width:0}
  .clustr-hero-heading h1{margin:0;color:#f7f5fa;font-size:clamp(30px,2.8vw,42px);font-weight:680;letter-spacing:-.038em;line-height:1.04}
  .clustr-hero-tagline{display:flex;align-items:baseline;gap:9px;margin:8px 0 0;line-height:1.45}
  .clustr-hero-tagline strong{color:#eeeaf3;font-size:clamp(15px,1.15vw,17px);font-weight:650;letter-spacing:-.012em}
  .clustr-hero-tagline span{color:#9f97aa;font-size:clamp(12px,.95vw,14px);font-weight:430;letter-spacing:.005em}
  .clustr-hero-mark{width:clamp(72px,6vw,84px);height:clamp(72px,6vw,84px);flex:0 0 auto;object-fit:contain;filter:drop-shadow(0 14px 34px rgba(166,159,255,.3))}
  .clustr-hero-context{position:absolute;left:50%;bottom:-8px;transform:translate(-50%,100%);display:flex;align-items:center;justify-content:center;gap:9px;min-height:34px;color:#aaa2b5;border:1px solid rgba(255,255,255,.1);border-radius:8px;background:rgba(9,8,15,.72);padding:0 13px;font-size:12px;line-height:1;white-space:nowrap;backdrop-filter:blur(16px);box-shadow:0 12px 30px rgba(0,0,0,.16);animation:clustr-context-arrive 380ms 150ms cubic-bezier(.23,1,.32,1) both}
  .clustr-hero-context svg{width:14px;height:14px}.clustr-context-dot{width:7px;height:7px;border-radius:50%;background:#81798b;box-shadow:0 0 0 4px rgba(129,121,139,.08)}.clustr-context-dot.ready{background:#63c98a;box-shadow:0 0 0 4px rgba(99,201,138,.08)}.clustr-context-dot.degraded{background:#d7b958;box-shadow:0 0 0 4px rgba(215,185,88,.08)}
  .clustr-context-separator{width:1px;height:14px;background:rgba(255,255,255,.12);margin:0 3px}.clustr-context-protected{color:#d7bd65}.clustr-context-danger{color:#ff8585}.clustr-context-ready{color:#81d6a5}.clustr-context-pending{color:#9f97a9}
  .clustr-launcher{appearance:none;display:inline-flex;align-items:center;background:rgba(166,159,255,.12);border:1px solid rgba(196,190,255,.28);border-radius:999px;cursor:pointer;font-size:12px;color:#f4f1f7;padding:5px 11px;box-shadow:inset 0 1px rgba(255,255,255,.06)}
  .clustr-launcher:hover{background:rgba(166,159,255,.19);border-color:rgba(211,207,255,.42)}
  .clustr-global-host,.clustr-scanner-anchor{position:absolute;width:0;height:0;pointer-events:none;overflow:hidden}
  .clustr-scanner{position:fixed;inset:0;width:100vw;height:100vh;overflow:hidden;pointer-events:none;z-index:0;background:#05040a;animation:clustr-scanner-arrive 560ms cubic-bezier(.23,1,.32,1) both}
  .clustr-scanner canvas{-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 5%,#000 91%,transparent 100%);mask-image:linear-gradient(to bottom,transparent 0,#000 5%,#000 91%,transparent 100%)}
  .clustr-scanner:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 68% 20%,rgba(166,159,255,.08),transparent 36%),linear-gradient(90deg,rgba(5,4,10,.68) 0%,rgba(5,4,10,.2) 36%,rgba(5,4,10,.48) 100%);z-index:1}
  .clustr-scanner:after{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.014) 1px,transparent 1px);background-size:56px 56px;mask-image:linear-gradient(to bottom,rgba(0,0,0,.52),transparent 74%);z-index:2}
  .clustr-scanner[data-scanner-fallback="true"]{background:radial-gradient(circle at 68% 22%,rgba(166,159,255,.2),transparent 34%),radial-gradient(circle at 38% 76%,rgba(224,222,234,.08),transparent 28%),#05040a}
  [data-clustr-hero] [data-composer-card="true"]{animation:clustr-composer-arrive 440ms 105ms cubic-bezier(.23,1,.32,1) both}
  @keyframes clustr-layer-arrive{0%{opacity:0;filter:blur(4px);transform:translateY(13px) scale(.988)}100%{opacity:1;filter:blur(0);transform:none}}
  @keyframes clustr-context-arrive{0%{opacity:0;filter:blur(3px);transform:translate(-50%,calc(100% + 10px)) scale(.97)}100%{opacity:1;filter:blur(0);transform:translate(-50%,100%) scale(1)}}
  @keyframes clustr-context-mobile-arrive{0%{opacity:0;filter:blur(3px);transform:translateY(10px) scale(.97)}100%{opacity:1;filter:blur(0);transform:none}}
  @keyframes clustr-composer-arrive{0%{opacity:.18;filter:blur(5px);transform:translateY(12px) scale(.992)}100%{opacity:1;filter:blur(0);transform:none}}
  @keyframes clustr-scanner-arrive{0%{opacity:0;filter:blur(7px);transform:scale(1.012)}100%{opacity:1;filter:blur(0);transform:scale(1)}}
  @media(max-width:800px){[data-phase="hero"]{--dsh-chat-content-width:min(calc(100vw - 124px),calc(100% - 24px))}[data-clustr-hero-stack]{width:calc(100vw - 124px)!important;max-width:calc(100vw - 124px)!important;left:32px}[data-clustr-hero-workspace-row]{box-sizing:border-box;width:100%;flex-direction:column;align-items:center!important;justify-content:center!important;flex-wrap:nowrap;padding-left:0!important}.clustr-hero-entry{box-sizing:border-box;width:100%;gap:12px;margin-top:8px;padding:0 4px}.clustr-hero-heading{width:100%;flex-direction:column;gap:7px;text-align:center}.clustr-hero-mark{width:56px;height:56px}.clustr-hero-heading h1{width:100%;max-width:100%;font-size:clamp(22px,5.8vw,28px);line-height:1.08;text-align:center;white-space:normal;overflow-wrap:anywhere;text-wrap:balance}.clustr-hero-tagline{max-width:300px;display:block;margin:0 auto;line-height:1.5;white-space:normal;text-wrap:balance}.clustr-hero-tagline strong,.clustr-hero-tagline span{display:block}.clustr-hero-tagline strong{font-size:13px}.clustr-hero-tagline span{margin-top:2px;font-size:11px}.clustr-hero-context{position:static;transform:none;box-sizing:border-box;max-width:100%;flex-wrap:wrap;height:auto;min-height:34px;padding:8px 12px;white-space:normal;animation-name:clustr-context-mobile-arrive}}
  @media(prefers-reduced-motion:reduce){[data-slot="root"] *{scroll-behavior:auto!important;animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}}
`;
function restoreNativeHero() {
  const hero = document.querySelector('[data-phase="hero"]');
  if (!hero) return;
  delete hero.dataset.clustrHero;
  hero.querySelectorAll("[data-clustr-native-hero],[data-clustr-hero-title-native],[data-clustr-hero-workspace-row],[data-clustr-hero-stack]").forEach((element) => {
    delete element.dataset.clustrNativeHero;
    delete element.dataset.clustrHeroTitleNative;
    delete element.dataset.clustrHeroWorkspaceRow;
    delete element.dataset.clustrHeroStack;
  });
  const textarea = hero.querySelector("textarea[data-clustr-original-placeholder]");
  if (textarea) {
    const original = textarea.dataset.clustrOriginalPlaceholder ?? "";
    if (original) textarea.setAttribute("placeholder", original);
    else textarea.removeAttribute("placeholder");
    delete textarea.dataset.clustrOriginalPlaceholder;
  }
}
function useClustrHeroChrome(active) {
  React6.useEffect(() => {
    if (!active) {
      restoreNativeHero();
      return void 0;
    }
    const synchronize = () => {
      const hero = document.querySelector('[data-phase="hero"]');
      if (!hero) return;
      hero.dataset.clustrHero = "true";
      const exactTexts = /* @__PURE__ */ new Set(["\u63A2\u7D22\u672A\u81F3\u4E4B\u5883", "Into the Unknown"]);
      const title = hero.querySelector("[data-clustr-hero-title-native]") ?? Array.from(hero.querySelectorAll("span")).find((element) => exactTexts.has(element.textContent?.trim()));
      if (title) {
        title.dataset.clustrHeroTitleNative = "true";
        const nativeShell = title.parentElement?.parentElement?.parentElement;
        if (nativeShell) nativeShell.dataset.clustrNativeHero = "true";
      }
      const workspaceButton = hero.querySelector('button[aria-label="\u9009\u62E9\u5DE5\u4F5C\u533A"],button[aria-label="Choose workspace"]');
      if (workspaceButton?.parentElement) workspaceButton.parentElement.dataset.clustrHeroWorkspaceRow = "true";
      const entry = hero.querySelector(".clustr-hero-entry");
      const stack = entry?.parentElement?.parentElement;
      if (stack) stack.dataset.clustrHeroStack = "true";
      const textarea = hero.querySelector("textarea");
      if (textarea && textarea.getAttribute("placeholder") !== CLUSTR_HERO_PLACEHOLDER) {
        if (!textarea.hasAttribute("data-clustr-original-placeholder")) textarea.dataset.clustrOriginalPlaceholder = textarea.getAttribute("placeholder") ?? "";
        textarea.setAttribute("placeholder", CLUSTR_HERO_PLACEHOLDER);
      }
    };
    synchronize();
    const observer = new MutationObserver(synchronize);
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-phase", "placeholder"] });
    return () => observer.disconnect();
  }, [active]);
}
function ClustrGlobalExperience({ active }) {
  useClustrHeroChrome(active);
  if (!active) return null;
  return React6.createElement(
    React6.Fragment,
    null,
    React6.createElement("style", null, GLOBAL_CSS),
    React6.createElement(
      "div",
      { className: "clustr-global-host", "aria-hidden": true },
      React6.createElement(Scanner, {
        color1: "#e0deea",
        color2: "#a69fff",
        color3: "#ffffff",
        speed: 0.15,
        sweepSpeed: 0.25,
        sweepWidth: 1.6,
        sweepFalloff: 6,
        scale: 1.5,
        frequency: 2,
        ripple: 0.7,
        bandDensity: 11,
        lineSharpness: 5.5,
        glow: 0.2,
        scanDirection: "vertical",
        colorSpread: 0.69,
        brightness: 1,
        contrast: 1.2,
        softness: 1.55,
        vignette: 0.45,
        scanline: true,
        grain: true,
        grainIntensity: 0.05,
        opacity: 0.4,
        mouseInteraction: true,
        mouseRadius: 0.5,
        mouseStrength: 0.5,
        portal: true
      })
    )
  );
}

// src/client/hero.js
var React8 = __toESM(require("react"), 1);

// src/client/mode.js
var React7 = __toESM(require("react"), 1);
var CLUSTR_PRESET = "crypto-trader";
var CLUSTR_PRESET_LABEL = "Clustr Trading Console";
var lastAnnouncedMode = null;
var transitionTimer = null;
function announceModeTransition(clustrSelected) {
  if (lastAnnouncedMode === null) {
    lastAnnouncedMode = clustrSelected;
    return;
  }
  if (lastAnnouncedMode === clustrSelected) return;
  lastAnnouncedMode = clustrSelected;
  const value = clustrSelected ? "clustr" : "standard";
  document.documentElement.dataset.clustrModeTransition = value;
  if (transitionTimer) clearTimeout(transitionTimer);
  transitionTimer = setTimeout(() => {
    if (document.documentElement.dataset.clustrModeTransition === value) delete document.documentElement.dataset.clustrModeTransition;
  }, 620);
}
function readHeroPreset() {
  const hero = document.querySelector('[data-phase="hero"]');
  if (!hero) return null;
  const presetButton = Array.from(hero.querySelectorAll("button")).find((button) => button.textContent?.trim() === CLUSTR_PRESET_LABEL);
  return Boolean(presetButton);
}
function useClustrMode({ sessionId, useSessions }) {
  const sessionPreset = useSessions((state) => {
    const currentId = sessionId ?? state.current;
    return currentId == null ? null : state.byId[currentId]?.agentPreset ?? null;
  });
  const [heroPresetSelected, setHeroPresetSelected] = React7.useState(null);
  React7.useEffect(() => {
    const synchronize = () => {
      const selected = readHeroPreset();
      if (selected !== null) announceModeTransition(selected);
      setHeroPresetSelected(selected);
    };
    synchronize();
    const observer = new MutationObserver(synchronize);
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["data-phase", "aria-expanded"] });
    return () => observer.disconnect();
  }, []);
  return heroPresetSelected ?? sessionPreset === CLUSTR_PRESET;
}

// src/client/hero.js
function statusLabel(status) {
  if (!status) return { text: "\u6B63\u5728\u786E\u8BA4\u5B89\u5168\u72B6\u6001", tone: "pending", Icon: RiLock2Line };
  if (status.killSwitch?.active) return { text: "\u7D27\u6025\u505C\u6B62\u5DF2\u542F\u7528", tone: "danger", Icon: RiAlertLine };
  if (status.readOnly !== false) return { text: "\u53EA\u8BFB\u4FDD\u62A4", tone: "protected", Icon: RiLock2Line };
  return { text: "\u5BA1\u6279\u540E\u53EF\u6267\u884C", tone: "ready", Icon: RiShieldCheckLine };
}
function ClustrHeroEntry({ sessionId, useSession, useSessions }) {
  const hero = useSession((state) => state.composerPhase === "blank");
  const clustrSession = useClustrMode({ sessionId, useSessions });
  const [status, setStatus] = React8.useState(null);
  const [marketContext, setMarketContext] = React8.useState({ exchange: "OKX", symbol: "BTC/USDT", marketType: "\u73B0\u8D27", timeframe: "15m", label: "OKX BTC/USDT\uFF08\u73B0\u8D27\uFF0C15m\uFF09" });
  React8.useEffect(() => {
    if (!hero || !clustrSession) return void 0;
    let live = true;
    const contextUrl = `/api/clustr/context?sessionId=${encodeURIComponent(String(sessionId ?? ""))}`;
    Promise.all([
      fetch("/api/crypto/status").then((response) => response.ok ? response.json() : null),
      fetch(contextUrl).then((response) => response.ok ? response.json() : null)
    ]).then(([nextStatus, nextContext]) => {
      if (!live) return;
      setStatus(nextStatus);
      const value = nextContext?.context;
      if (value) {
        const exchange = { okx: "OKX", binance: "Binance", bybit: "Bybit", hyperliquid: "Hyperliquid" }[value.exchange] ?? value.exchange;
        const marketType = { spot: "\u73B0\u8D27", swap: "\u6C38\u7EED", linear: "U \u672C\u4F4D", inverse: "\u5E01\u672C\u4F4D", perpetual: "\u6C38\u7EED", "usd-m-futures": "U \u672C\u4F4D\u6C38\u7EED" }[value.marketType] ?? value.marketType;
        const symbol = value.displaySymbol || value.symbol;
        setMarketContext({ exchange, symbol, marketType, timeframe: value.timeframe, label: `${exchange} ${symbol}\uFF08${marketType}\uFF0C${value.timeframe}\uFF09` });
      }
    }).catch(() => {
      if (live) setStatus(null);
    });
    return () => {
      live = false;
    };
  }, [hero, clustrSession, sessionId]);
  if (!hero || !clustrSession) return null;
  const safety = statusLabel(status);
  const readable = status?.accountPoll?.state === "ready";
  return React8.createElement(
    "section",
    { className: "clustr-hero-entry", "aria-labelledby": "clustr-hero-title" },
    React8.createElement(
      "div",
      { className: "clustr-hero-heading" },
      React8.createElement("img", { src: clustr_mark_default, alt: "", className: "clustr-hero-mark" }),
      React8.createElement(
        "div",
        null,
        React8.createElement("h1", { id: "clustr-hero-title" }, "Clustr Trading Console"),
        React8.createElement(
          "p",
          { className: "clustr-hero-tagline" },
          React8.createElement("strong", null, "AI \u4EA4\u6613\u5458\u7684\u5168\u80FD\u7EC8\u7AEF\u3002"),
          React8.createElement("span", null, "\u7EDF\u4E00\u5E02\u573A\u3001\u8D26\u6237\u3001\u51B3\u7B56\u4E0E\u98CE\u63A7\uFF0C\u8BA9\u590D\u6742\u4EA4\u6613\u6E05\u6670\u53EF\u63A7\u3002")
        )
      )
    ),
    React8.createElement(
      "div",
      { className: "clustr-hero-context", "aria-label": "\u5F53\u524D\u4EA4\u6613\u4E0A\u4E0B\u6587" },
      React8.createElement("span", { className: `clustr-context-dot ${readable ? "ready" : "degraded"}`, "aria-hidden": true }),
      React8.createElement("span", null, `${marketContext.exchange} \xB7 ${marketContext.symbol} \xB7 ${marketContext.timeframe}`),
      React8.createElement("span", { className: "clustr-context-separator", "aria-hidden": true }),
      React8.createElement(safety.Icon, { "aria-hidden": true }),
      React8.createElement("span", { className: `clustr-context-${safety.tone}` }, safety.text)
    )
  );
}

// src/client/session-badges.js
var React9 = __toESM(require("react"), 1);

// src/client/session-row-resolver.js
function displayTitle(summary) {
  return String(summary?.title ?? "").trim();
}
function resolveSessionIdsForRow({ title, workspaceTitle, selected }, list, workspaces, archivedSessionIds = []) {
  const archived = new Set(archivedSessionIds);
  let pool = Array.isArray(list?.ids) ? list.ids : [];
  if (workspaceTitle) {
    const workspace = (Array.isArray(workspaces) ? workspaces : []).find((item) => String(item?.title ?? "").trim() === workspaceTitle);
    if (workspace) pool = Array.isArray(workspace.sessionIds) ? workspace.sessionIds : [];
  }
  const matches = pool.filter((sessionId) => !archived.has(sessionId) && displayTitle(list?.byId?.[sessionId]) === title);
  if (selected && list?.current && matches.includes(list.current)) return [list.current];
  return matches;
}

// src/client/session-badges.js
function rowTitle(row) {
  return Array.from(row.children).find((child) => child.tagName === "SPAN" && !child.hasAttribute("data-clustr-session-mark") && String(child.textContent ?? "").trim())?.textContent?.trim() ?? "";
}
function rowWorkspaceTitle(row) {
  const group = row.parentElement;
  const project = group?.querySelector(':scope > [role="treeitem"][aria-expanded]');
  if (!project) return "";
  return String(project.textContent ?? "").trim();
}
function installMark(row) {
  if (row.querySelector(":scope > [data-clustr-session-mark]")) return;
  const mark = document.createElement("span");
  mark.className = "clustr-session-mark";
  mark.dataset.clustrSessionMark = "true";
  mark.title = "Clustr Trading Console \u4F1A\u8BDD";
  mark.setAttribute("aria-hidden", "true");
  const image = document.createElement("img");
  image.src = clustr_mark_default;
  image.alt = "";
  image.draggable = false;
  mark.appendChild(image);
  row.insertBefore(mark, row.firstChild);
  row.dataset.clustrSession = "true";
}
function removeMark(row) {
  row.querySelector(":scope > [data-clustr-session-mark]")?.remove();
  delete row.dataset.clustrSession;
}
function ClustrSessionBadges({ useSessions, useWorkspaces, ctx }) {
  const list = useSessions ? useSessions((state) => state) : { ids: [], byId: {}, current: null };
  const workspaceState = useWorkspaces ? useWorkspaces((state) => state) : { items: [], archivedSessionIds: [] };
  const idsKey = (Array.isArray(list?.ids) ? list.ids : []).join(",");
  const [clustrIds, setClustrIds] = React9.useState(() => /* @__PURE__ */ new Set());
  const [revision, setRevision] = React9.useState(0);
  React9.useEffect(() => {
    const dispose = ctx?.remote?.$on?.("agent-preset/selected", (sessionId) => {
      if (list?.byId?.[sessionId]) setRevision((value) => value + 1);
    });
    return () => {
      if (typeof dispose === "function") dispose();
    };
  }, [ctx, list?.byId]);
  React9.useEffect(() => {
    let alive = true;
    const ids = idsKey ? idsKey.split(",").filter(Boolean) : [];
    if (ids.length === 0) {
      setClustrIds(/* @__PURE__ */ new Set());
      return () => {
        alive = false;
      };
    }
    fetch(`/api/crypto/session-modes?ids=${encodeURIComponent(ids.join(","))}`, { headers: { accept: "application/json" } }).then(async (response) => {
      if (!response.ok) throw new Error("mode lookup failed");
      return response.json();
    }).then((result) => {
      if (!alive) return;
      setClustrIds(new Set((Array.isArray(result?.sessions) ? result.sessions : []).filter((item) => item?.state === "ready" && item?.presetEligible === true).map((item) => item.sessionId)));
    }).catch(() => {
      if (alive) setClustrIds(/* @__PURE__ */ new Set());
    });
    return () => {
      alive = false;
    };
  }, [idsKey, revision]);
  const clustrKey = [...clustrIds].sort().join(",");
  const workspaceKey = JSON.stringify((Array.isArray(workspaceState?.items) ? workspaceState.items : []).map((workspace) => [workspace.workspaceId, workspace.title, workspace.sessionIds]));
  const archivedKey = (Array.isArray(workspaceState?.archivedSessionIds) ? workspaceState.archivedSessionIds : []).join(",");
  React9.useEffect(() => {
    let frame = 0;
    const decorate = () => {
      frame = 0;
      const rows = document.querySelectorAll('[role="treeitem"][aria-selected]');
      for (const row of rows) {
        const title = rowTitle(row);
        const candidates = resolveSessionIdsForRow({
          title,
          workspaceTitle: rowWorkspaceTitle(row),
          selected: row.getAttribute("aria-selected") === "true"
        }, list, workspaceState?.items, workspaceState?.archivedSessionIds);
        const shouldMark = candidates.length > 0 && candidates.every((sessionId) => clustrIds.has(sessionId));
        if (shouldMark) installMark(row);
        else removeMark(row);
      }
    };
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(decorate);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-selected", "aria-expanded"] });
    decorate();
    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      document.querySelectorAll("[data-clustr-session-mark]").forEach((node) => node.remove());
      document.querySelectorAll("[data-clustr-session]").forEach((node) => delete node.dataset.clustrSession);
    };
  }, [list, workspaceState?.items, workspaceState?.archivedSessionIds, clustrKey, workspaceKey, archivedKey]);
  return null;
}

// src/client/index.js
var inject = ["slots", "sessions", "remote"];
var MODE_TRANSITION_CSS = `
  .clustr-mode-veil{position:fixed;inset:0;z-index:1000;pointer-events:none;opacity:0;overflow:hidden;background:radial-gradient(circle at 64% 48%,rgba(166,159,255,.2),transparent 34%),rgba(5,4,10,.18);backdrop-filter:blur(0);will-change:opacity,backdrop-filter}
  .clustr-mode-veil:before{content:"";position:absolute;left:0;right:0;top:0;height:2px;opacity:0;background:linear-gradient(90deg,transparent 8%,rgba(218,214,255,.3) 28%,#f5f3ff 50%,rgba(166,159,255,.34) 72%,transparent 92%);box-shadow:0 0 18px rgba(199,193,255,.55),0 0 70px rgba(166,159,255,.2)}
  html[data-clustr-mode-transition="clustr"] .clustr-mode-veil{animation:clustr-veil-in 560ms cubic-bezier(.23,1,.32,1) both}
  html[data-clustr-mode-transition="clustr"] .clustr-mode-veil:before{animation:clustr-scan-down 520ms cubic-bezier(.23,1,.32,1) both}
  html[data-clustr-mode-transition="standard"] .clustr-mode-veil{animation:clustr-veil-out 460ms cubic-bezier(.23,1,.32,1) both}
  html[data-clustr-mode-transition="standard"] .clustr-mode-veil:before{animation:clustr-scan-up 420ms cubic-bezier(.23,1,.32,1) both}
  html[data-clustr-mode-transition="standard"] [data-phase="hero"]{animation:clustr-native-return 380ms cubic-bezier(.23,1,.32,1) both}
  @keyframes clustr-veil-in{0%{opacity:0;backdrop-filter:blur(0)}28%{opacity:.58;backdrop-filter:blur(3px)}100%{opacity:0;backdrop-filter:blur(0)}}
  @keyframes clustr-veil-out{0%{opacity:0;backdrop-filter:blur(0)}24%{opacity:.34;backdrop-filter:blur(2px)}100%{opacity:0;backdrop-filter:blur(0)}}
  @keyframes clustr-scan-down{0%{opacity:0;transform:translateY(-4vh)}18%{opacity:.9}72%{opacity:.55}100%{opacity:0;transform:translateY(104vh)}}
  @keyframes clustr-scan-up{0%{opacity:0;transform:translateY(104vh)}18%{opacity:.7}72%{opacity:.4}100%{opacity:0;transform:translateY(-4vh)}}
  @keyframes clustr-native-return{0%{opacity:.32;filter:blur(3px);transform:translateY(8px) scale(.992)}100%{opacity:1;filter:blur(0);transform:none}}
  .clustr-session-mark{box-sizing:border-box;width:16px;height:20px;flex:none;display:inline-flex;align-items:center;justify-content:center;margin-right:6px;opacity:.88;mix-blend-mode:difference;animation:clustr-session-mark-in 180ms cubic-bezier(.23,1,.32,1) both}
  .clustr-session-mark img{display:block;width:15px;height:15px;object-fit:contain;pointer-events:none;user-select:none}
  [data-clustr-session="true"][aria-selected="true"] .clustr-session-mark{opacity:1}
  @keyframes clustr-session-mark-in{0%{opacity:0;transform:scale(.72)}100%{transform:scale(1)}}
  @media(prefers-reduced-motion:reduce){.clustr-session-mark{animation:none!important}.clustr-mode-veil:before{display:none}html[data-clustr-mode-transition] .clustr-mode-veil{animation:clustr-reduced-fade 160ms ease-out both!important;backdrop-filter:none!important}html[data-clustr-mode-transition="standard"] [data-phase="hero"]{animation:clustr-reduced-return 160ms ease-out both!important}@keyframes clustr-reduced-fade{0%{opacity:.14}100%{opacity:0}}@keyframes clustr-reduced-return{0%{opacity:.7}100%{opacity:1}}}
`;
async function getSession() {
  const res = await fetch("/api/crypto/session");
  if (!res.ok) return null;
  return res.json();
}
function ClustrSidebarAction({ useSessions, useWorkspaces, sessions, ctx }) {
  const [notice, setNotice] = React10.useState(null);
  const activeSessionId = useSessions ? useSessions((state) => state.current) : null;
  const clustrActive = useClustrMode({ sessionId: activeSessionId, useSessions });
  const onClick = async () => {
    try {
      const info = await getSession();
      if (!info?.sessionId) {
        setNotice("\u5C1A\u672A\u542F\u7528\u4E13\u5C5E\u4EA4\u6613\u4F1A\u8BDD\uFF1A\u8BF7\u5728 Clustr \u4F1A\u8BDD\u4E2D\u70B9\u51FB\u300C\u542F\u7528\u6B64\u4F1A\u8BDD\u300D");
        return;
      }
      if (!info.eligible) {
        if (info.bindingState === "query_error") setNotice("\u5DF2\u542F\u7528\u4EA4\u6613\u4F1A\u8BDD\u7684\u72B6\u6001\u8BFB\u53D6\u5F02\u5E38\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");
        else if (info.bindingState === "invalid") setNotice("\u5DF2\u542F\u7528\u4EA4\u6613\u4F1A\u8BDD\u5F53\u524D\u4E0D\u5728 Clustr \u6A21\u5F0F\uFF0C\u8BF7\u5728\u5176\u4ED6 Clustr \u4F1A\u8BDD\u4E2D\u660E\u786E\u5207\u6362");
        else setNotice("\u5C1A\u672A\u542F\u7528\u4E13\u5C5E\u4EA4\u6613\u4F1A\u8BDD\uFF1A\u8BF7\u5728 Clustr \u4F1A\u8BDD\u4E2D\u70B9\u51FB\u300C\u542F\u7528\u6B64\u4F1A\u8BDD\u300D");
        return;
      }
      sessions?.open(info.sessionId);
      setNotice(null);
    } catch (e) {
      setNotice("\u4EA4\u6613\u53F0\u4E0D\u53EF\u7528\uFF1A" + String(e?.message ?? e));
    }
  };
  return React10.createElement(
    "div",
    { style: { position: "relative" } },
    React10.createElement(ClustrSessionBadges, { useSessions, useWorkspaces, ctx }),
    React10.createElement("style", null, MODE_TRANSITION_CSS),
    React10.createElement("div", { className: "clustr-mode-veil", "aria-hidden": true }),
    React10.createElement(ClustrGlobalExperience, { active: clustrActive }),
    React10.createElement("button", {
      onClick,
      title: "\u8FDB\u5165 Clustr Trading Console",
      className: "clustr-launcher"
    }, React10.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 } }, React10.createElement("img", { src: clustr_mark_default, alt: "", style: { width: 14, height: 14, objectFit: "contain" } }), "Clustr")),
    notice ? React10.createElement("div", {
      style: { position: "absolute", bottom: 28, right: 0, background: "#161b22", border: "1px solid #30363d", color: "#e6edf3", borderRadius: 6, padding: "6px 10px", fontSize: 11, width: 260, zIndex: 50 }
    }, notice) : null
  );
}
function apply(ctx) {
  const slots = ctx.get("slots");
  const sessions = ctx.get("sessions");
  if (!slots) return;
  slots.inject("sidebar.footer.action", () => slots.register(
    { name: "sidebar.footer.action", id: "crypto-console", order: 50, label: "Clustr" },
    (props) => React10.createElement(ClustrSidebarAction, { ...props, sessions, ctx })
  ));
  slots.inject("conversation.view", () => slots.register(
    { name: "conversation.view", id: "crypto-console", order: 20, label: "Clustr Console" },
    (props) => React10.createElement(ConsoleGate, { sessionId: props.sessionId, inputActions: props.inputActions, ctx })
  ));
  slots.inject("settings.section", () => slots.register(
    { name: "settings.section", id: "crypto", order: 30, label: "Clustr Trading" },
    () => React10.createElement(SettingsPage)
  ));
  slots.inject("conversation.session.header.actions", () => slots.register(
    { name: "conversation.session.header.actions", id: "clustr-status", order: -10 },
    (props) => React10.createElement(ClustrHeaderStatus, { ...props, ctx })
  ));
  slots.inject("conversation.input.dock", () => slots.register(
    { name: "conversation.input.dock", id: "clustr-hero-entry", order: -100 },
    (props) => React10.createElement(ClustrHeroEntry, props)
  ));
}
return module.exports; } });
//# sourceMappingURL=client.js.map
