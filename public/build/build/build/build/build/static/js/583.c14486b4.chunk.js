"use strict";(self.webpackChunkfrontend=self.webpackChunkfrontend||[]).push([[583],{3583:function(n,e,o){o.r(e),o.d(e,{default:function(){return F},getLinkUtilityClass:function(){return h},linkClasses:function(){return k}});var r=o(3433),t=o(9439),i=o(4942),a=o(3366),c=o(7462),u=o(2791),s=o(8182),l=o(4419),d=o(4036),p=o(7630),f=o(1046),m=o(3031),v=o(2071),b=o(4567),y=o(5878),Z=o(1217);function h(n){return(0,Z.Z)("MuiLink",n)}var k=(0,y.Z)("MuiLink",["root","underlineNone","underlineHover","underlineAlways","button","focusVisible"]),x=o(8529),w=o(2065),C={primary:"primary.main",textPrimary:"text.primary",secondary:"secondary.main",textSecondary:"text.secondary",error:"error.main"},g=function(n){var e=n.theme,o=n.ownerState,r=function(n){return C[n]||n}(o.color),t=(0,x.DW)(e,"palette.".concat(r),!1)||o.color,i=(0,x.DW)(e,"palette.".concat(r,"Channel"));return"vars"in e&&i?"rgba(".concat(i," / 0.4)"):(0,w.Fq)(t,.4)},S=o(184),D=["className","color","component","onBlur","onFocus","TypographyClasses","underline","variant","sx"],A=(0,p.ZP)(b.Z,{name:"MuiLink",slot:"Root",overridesResolver:function(n,e){var o=n.ownerState;return[e.root,e["underline".concat((0,d.Z)(o.underline))],"button"===o.component&&e.button]}})((function(n){var e=n.theme,o=n.ownerState;return(0,c.Z)({},"none"===o.underline&&{textDecoration:"none"},"hover"===o.underline&&{textDecoration:"none","&:hover":{textDecoration:"underline"}},"always"===o.underline&&(0,c.Z)({textDecoration:"underline"},"inherit"!==o.color&&{textDecorationColor:g({theme:e,ownerState:o})},{"&:hover":{textDecorationColor:"inherit"}}),"button"===o.component&&(0,i.Z)({position:"relative",WebkitTapHighlightColor:"transparent",backgroundColor:"transparent",outline:0,border:0,margin:0,borderRadius:0,padding:0,cursor:"pointer",userSelect:"none",verticalAlign:"middle",MozAppearance:"none",WebkitAppearance:"none","&::-moz-focus-inner":{borderStyle:"none"}},"&.".concat(k.focusVisible),{outline:"auto"}))})),F=u.forwardRef((function(n,e){var o=(0,f.Z)({props:n,name:"MuiLink"}),i=o.className,p=o.color,b=void 0===p?"primary":p,y=o.component,Z=void 0===y?"a":y,k=o.onBlur,x=o.onFocus,w=o.TypographyClasses,g=o.underline,F=void 0===g?"always":g,V=o.variant,L=void 0===V?"inherit":V,M=o.sx,R=(0,a.Z)(o,D),B=(0,m.Z)(),N=B.isFocusVisibleRef,W=B.onBlur,T=B.onFocus,j=B.ref,z=u.useState(!1),H=(0,t.Z)(z,2),P=H[0],q=H[1],O=(0,v.Z)(e,j),U=(0,c.Z)({},o,{color:b,component:Z,focusVisible:P,underline:F,variant:L}),E=function(n){var e=n.classes,o=n.component,r=n.focusVisible,t=n.underline,i={root:["root","underline".concat((0,d.Z)(t)),"button"===o&&"button",r&&"focusVisible"]};return(0,l.Z)(i,h,e)}(U);return(0,S.jsx)(A,(0,c.Z)({color:b,className:(0,s.Z)(E.root,i),classes:w,component:Z,onBlur:function(n){W(n),!1===N.current&&q(!1),k&&k(n)},onFocus:function(n){T(n),!0===N.current&&q(!0),x&&x(n)},ref:O,ownerState:U,variant:L,sx:[].concat((0,r.Z)(Object.keys(C).includes(b)?[]:[{color:b}]),(0,r.Z)(Array.isArray(M)?M:[M]))},R))}))}}]);
//# sourceMappingURL=583.c14486b4.chunk.js.map