/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"editor": 0
/******/ 	};
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push(["./src/demo/editor.ts","common"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./mock-data/dag-shapes.ts":
/*!*********************************!*\
  !*** ./mock-data/dag-shapes.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = __webpack_require__(/*! @src/color */ "./src/color.ts");
const w = 160;
const h = 36;
const c = color_1.default['blue'];
const shapes = [
    {
        shape: 'shape-001',
        w, h, color: c,
        name: 'Node-ABC',
        anchors: [
            [0.5, 0, 'input'],
            [0.5, 1, 'output'],
        ],
    },
    {
        shape: 'shape-002',
        w, h, color: color_1.default['green'],
        name: 'Node-XYZ',
        anchors: [
            [0.5, 0, 'input'],
            [0.3, 1, 'output'],
            [0.7, 1, 'output'],
        ],
    },
];
exports.default = shapes;


/***/ }),

/***/ "./src/demo/editor.ts":
/*!****************************!*\
  !*** ./src/demo/editor.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/*
*  dag-editor
*  author: liupeidong@gmail.com
*/
console.log('demo editor');
const dom_1 = __webpack_require__(/*! ../dom */ "./src/dom.ts");
const dag_shapes_1 = __webpack_require__(/*! @data/dag-shapes */ "./mock-data/dag-shapes.ts");
const index_1 = __webpack_require__(/*! ../index */ "./src/index.ts");
const store_1 = __webpack_require__(/*! ./store */ "./src/demo/store.ts");
// example
const editor = new index_1.Editor({
    container: '#container',
    page: '#editor',
    itempanel: '#itempanel',
});
// example data store
const store = new store_1.Store({ editor });
// new node added
editor.on('nodeAdded', (node) => {
    console.log('node added', node);
});
// selected node change
editor.on('selectedNodeChange', (node) => {
    console.log('selected node changed', node);
    const oNodePanel = dom_1.getDom('#node-panel');
    const oCanvasPanel = dom_1.getDom('#canvas-panel');
    if (node) {
        oNodePanel.classList.add('show');
        oCanvasPanel.classList.remove('show');
        store.currentNode = node;
    }
    else {
        oNodePanel.classList.remove('show');
        oCanvasPanel.classList.add('show');
    }
});
// node deleted
editor.on('nodeDeleted', (nodeId) => {
    console.log(`node deleted: node-id: ${nodeId}`);
});
// new edge added
editor.on('edgeAdded', (edge) => {
    console.log('edge added', edge);
});
// edge deleted
editor.on('edgeDeleted', (edge) => {
    console.log('edge deleted', edge);
});
for (let shape of dag_shapes_1.default) {
    editor.registerShape(shape.shape, shape);
}
// check source data
dom_1.getDom('#source-btn').addEventListener('click', () => {
    dom_1.getDom('#code').innerHTML = JSON.stringify(editor.getData());
});


/***/ }),

/***/ "./src/demo/store.ts":
/*!***************************!*\
  !*** ./src/demo/store.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
const dom_1 = __webpack_require__(/*! ../dom */ "./src/dom.ts");
// example to show Editor callback and data binding
class Store {
    constructor({ editor }) {
        this.editor = editor;
        this.oName = dom_1.getDom('#node-name');
        this.oW = dom_1.getDom('#node-width');
        this._bind();
    }
    _bind() {
        this.oName.addEventListener('change', () => {
            this.currentNode.name = this.oName.value.trim();
            this.editor.repaint();
        });
        this.oW.addEventListener('change', () => {
            this.currentNode.w = Number(this.oW.value.trim());
            this.editor.repaint();
        });
    }
    get currentNode() {
        return this.__node;
    }
    set currentNode(node) {
        this.__node = node;
        this.oName.value = node.name;
        this.oW.value = node.w.toString();
    }
}
exports.Store = Store;


/***/ })

/******/ });
//# sourceMappingURL=editor.js.map