"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Editor = void 0;
/*
 *	dag-editor core
 *	@liupd
 *	email: liupeidong1027@gmail.com
 */
const dom_1 = require("./dom");
const utils_1 = require("./utils");
const canvas_1 = require("./canvas");
const event_1 = require("./event");
const command_1 = require("./command");
const contextmenu_1 = require("./contextmenu");
// Editor core
class Editor {
    constructor({ container, 
    // toolbar,
    itempanel, page, }) {
        // private selectedAnchor: [Editor.INode, number]
        this.anchorStartPos = { x: 0, y: 0 };
        /*
         *	public
         */
        this.callback = {
            selectedNodeChange: null,
            nodeAdded: null,
            nodeDeleted: null,
            edgeAdded: null,
            edgeDeleted: null,
        };
        /*
         *	events
         */
        this.isMouseDown = false;
        this.eventList = [
            ['oItemPanel', 'mousedown', '_beginAddNode'],
            ['oItemPanel', 'mouseup', '_mouseUp'],
            ['oPage', 'mousedown', '_mouseDownOnPage'],
            ['oPage', 'mousemove', '_mouseMove'],
            ['oPage', 'mouseleave', '_mouseLeavePage'],
            ['oPage', 'mouseup', '_mouseUpPage'],
            ['oContainer', 'contextmenu', '_preventDefaultMenu'],
        ];
        /*
         *	add-node
         *	- mousedown_on_itempanel: begin-add-node
         *		-> mouseup_itempanel: end
         *	- mousemove_on_page
         *		-> mouseup_page: add-node
         *		-> mouseleave_page: end
         *	move-node
         *	- mousedown_on_page
         *		- check_is_in_node: false -> end
         *	- mousemove_on_page
         *	- mouseup_page: end
         */
        // mouse event start pos (x, y)
        this.mouseEventStartPos = {
            x: 0,
            y: 0,
        };
        this.commands = {
            'del:node': '_delNodeCommand',
            'del:edge': '_delEdgeCommand',
            'clear': '_clear',
        };
        console.log('dag-editor created');
        // dom container
        this.oContainer = dom_1.getDom(container);
        this.oItemPanel = dom_1.getDom(itempanel);
        this.oPage = dom_1.getDom(page);
        // init property
        this.shapes = {};
        this.nodes = [];
        this.edges = [];
        this._initCanvas();
        this._bindEvents();
        this._initCommand();
    }
    // init canvas
    _initCanvas() {
        const rect = this.oPage.getBoundingClientRect();
        // const { width, height, left, top } = rect
        const ratio = window.devicePixelRatio || 1;
        // page config
        this.pageConfig = Object.assign(Object.assign({}, rect), { ratio });
        // create canvas dom
        const oc = dom_1.createDom('canvas', 'editor-canvas');
        oc.width = rect.width * ratio;
        oc.height = rect.height * ratio;
        const odc = oc.cloneNode();
        odc.style.pointerEvents = 'none';
        odc.style.backgroundColor = 'transparent';
        // define canvas object
        // main canvas paint all nodes & edges that exist in this.nodes & this.edges
        this.mainCvs = new canvas_1.Canvas(oc, { ratio, hasStore: true });
        // dynamic canvas paint nodes & edges which is being added or moved
        this.dynamicCvs = new canvas_1.Canvas(odc, { ratio });
        // append to page container
        this.oPage.appendChild(oc);
        this.oPage.appendChild(odc);
    }
    registerShape(name, shape) {
        this.shapes[name] = shape;
    }
    get selectedNode() {
        return this.__selectedNode;
    }
    set selectedNode(node) {
        if (node === this.__selectedNode) {
            console.log('no change');
            return;
        }
        this.__selectedNode = node;
        // selected node change trigger render on main canvas
        this._renderTask('selected node change');
        // callback
        this.callback.selectedNodeChange && this.callback.selectedNodeChange(node);
    }
    get hoverNode() {
        return this.__hoverNode;
    }
    set hoverNode(node) {
        if (node === this.__hoverNode) {
            return;
        }
        // hover node change trigger render on main canvas
        this.__hoverNode = node;
        this._renderTask('hover node change');
    }
    _addNode(node) {
        this.nodes.push(Object.assign(Object.assign({}, node), { id: utils_1.randomID() }));
        let cur = this.nodes[this.nodes.length - 1];
        this.callback.nodeAdded && this.callback.nodeAdded(cur);
        this.selectedNode = cur;
    }
    _updateNode(node) {
        let i = this.nodes.findIndex(n => n.id === node.id);
        if (i < 0) {
            return;
        }
        let cur = this.nodes.splice(i, 1)[0];
        cur = Object.assign({}, node);
        this.nodes.push(cur);
        this.selectedNode = cur;
    }
    _delNode(nid) {
        let i = this.nodes.findIndex(n => n.id === nid);
        if (i > -1) {
            this.nodes.splice(i, 1);
            let edges = this._getRelatedEdge(nid);
            if (edges.length) {
                edges.forEach(e => { this._delEdge(e.id); });
            }
            this.selectedNode = null;
            this.callback.nodeDeleted && this.callback.nodeDeleted(nid);
        }
    }
    get selectedEdge() {
        return this.__selectedEdge;
    }
    set selectedEdge(edge) {
        if (edge === this.__selectedEdge) {
            return;
        }
        this.__selectedEdge = edge;
        this._renderTask('selected edge change');
    }
    _addEdge([source, sourceAnchorIndex], [target, targetAnchorIndex]) {
        let edge = {
            source: source.id,
            sourceAnchorIndex,
            target: target.id,
            targetAnchorIndex,
        };
        let exist = this.edges.find(e => utils_1.compareEdge(edge, e));
        if (!exist) {
            this.edges.push(Object.assign(Object.assign({}, edge), { id: utils_1.randomID() }));
            this.callback.edgeAdded && this.callback.edgeAdded(edge);
        }
    }
    _delEdge(eid) {
        let i = this.edges.findIndex(e => e.id === eid);
        if (i > -1) {
            let [edge] = this.edges.splice(i, 1);
            this.callback.edgeDeleted && this.callback.edgeDeleted(edge);
        }
    }
    // clear
    _clear() {
        this.nodes = [];
        this.edges = [];
        this._renderTask('clear');
    }
    _renderTask(msg) {
        this.renderTask && cancelAnimationFrame(this.renderTask);
        this.renderTask = window.requestAnimationFrame(() => { this._render(msg); });
    }
    _render(msg) {
        msg && console.log(`===render by: ${msg}===`);
        this.mainCvs.clear();
        this.nodes.forEach(node => {
            let status = this.selectedNode === node ? 'selected' : (this.hoverNode === node ? 'hover' : null);
            this.mainCvs.paintNode(node, status);
        });
        this.edges.forEach(({ source, sourceAnchorIndex, target, targetAnchorIndex, id }) => {
            const start = this.nodes.find(n => n.id === source);
            const end = this.nodes.find(n => n.id === target);
            this.mainCvs.paintEdge(utils_1.getAnchorPos(start, start.anchors[sourceAnchorIndex]), utils_1.getAnchorPos(end, end.anchors[targetAnchorIndex]), { id, selected: this.selectedEdge && this.selectedEdge.id === id });
        });
    }
    on(ev, cb) {
        if (this.callback.hasOwnProperty(ev)) {
            this.callback[ev] = cb;
        }
    }
    update(type) {
    }
    repaint() {
        this._renderTask('repaint');
    }
    getData() {
        return {
            nodes: this.nodes,
            edges: this.edges,
        };
    }
    _bindEvents() {
        const event = new event_1.Event({
            rect: this.pageConfig,
        });
        for (let ev of this.eventList) {
            event.add(this[ev[0]], ev[1], this[ev[2]].bind(this));
        }
    }
    // mousedown on itempanel
    _beginAddNode(e) {
        const o = e.target;
        const shape = dom_1.getAttr(o, 'data-shape');
        if (!shape) {
            return;
        }
        this.isMouseDown = true;
        this.mouseDownType = 'add-node';
        this.selectedShape = this.shapes[shape];
    }
    // mousedown on page
    _mouseDownOnPage(e) {
        this.isMouseDown = true;
        const { offsetX: x, offsetY: y } = e;
        this.mouseEventStartPos = { x, y };
        if (this.hoverNode) {
            this.selectedNode = this.hoverNode;
            this.selectedEdge = null;
            // this.selectedNode = this.selectedNode
            if (this.hoverAnchor) {
                // u can't drag an edge from input anchor
                this.mouseDownType = this.selectedNode.anchors[this.hoverAnchor[1]][2] === 'output' ? 'add-edge' : null;
                this.anchorStartPos = utils_1.getAnchorPos(this.hoverAnchor[0], this.hoverAnchor[0].anchors[this.hoverAnchor[1]]);
            }
            else {
                this.mouseDownType = 'move-node';
            }
        }
        else {
            this.selectedNode = null;
            this.selectedEdge = this._getSelectedEdge({ x, y });
            // TODO start drag canvas
            this.mouseDownType = 'drag-canvas';
        }
        // trigger contextmenu
        this._triggerMenu(e.button === 2, e);
    }
    // mousemove
    _mouseMove(e) {
        this.dynamicCvs.clear();
        const { offsetX: x, offsetY: y } = e;
        const dx = x - this.mouseEventStartPos.x;
        const dy = y - this.mouseEventStartPos.y;
        if (this.isMouseDown) { // move
            switch (this.mouseDownType) {
                case 'add-node':
                    this.dynamicCvs.paintNode(Object.assign(Object.assign({}, this.selectedShape), { x, y }));
                    break;
                case 'move-node':
                    this.dynamicCvs.paintNode(Object.assign(Object.assign({}, this.selectedNode), { x: this.selectedNode.x + dx, y: this.selectedNode.y + dy }));
                    break;
                case 'add-edge':
                    this.nodes.forEach(node => {
                        if (node.id !== this.selectedNode.id && node.anchors) {
                            this.dynamicCvs.paintActiveAnchors(node);
                        }
                    });
                    this.dynamicCvs.paintEdge(this.anchorStartPos, { x, y });
                    break;
                // TODO
                case 'drag-canvas':
                    this.mainCvs.clear();
                    this.mainCvs.transform(dx, dy);
                    this.dynamicCvs.transform(dx, dy);
                    this._render();
                    this.mainCvs.restore();
                    this.dynamicCvs.restore();
                    break;
            }
        }
        else { // hover
            const hoverNode = this._getSelectedNode({ x, y });
            if (this.hoverNode) {
                let hoverAnchor = utils_1.checkInNodeAnchor({ x, y }, this.hoverNode);
                this.hoverAnchor = hoverAnchor;
                if (!hoverAnchor) {
                    this.hoverNode = hoverNode;
                }
            }
            else {
                this.hoverAnchor = null;
                this.hoverNode = hoverNode;
            }
        }
    }
    // mouseleave
    _mouseLeavePage() {
        this._mouseUp();
    }
    // mouseup
    _mouseUpPage(e) {
        if (!this.isMouseDown) {
            return;
        }
        const { offsetX: x, offsetY: y } = e;
        const dx = x - this.mouseEventStartPos.x;
        const dy = y - this.mouseEventStartPos.y;
        switch (this.mouseDownType) {
            case 'add-node':
                this._addNode(Object.assign(Object.assign({}, this.selectedShape), { x, y }));
                break;
            case 'move-node':
                if (dx < 5 && dy < 5) {
                    break;
                }
                console.log('move');
                this._updateNode(Object.assign(Object.assign({}, this.selectedNode), { x: this.selectedNode.x + dx, y: this.selectedNode.y + dy }));
                break;
            case 'add-edge':
                this.nodes.forEach(node => {
                    if (node.id !== this.selectedNode.id && node.anchors) {
                        node.anchors.forEach((anchor, i) => {
                            if (anchor[2] === 'input') {
                                let pos = utils_1.getAnchorPos(node, anchor);
                                if (utils_1.checkInCircle({ x, y }, pos, 12)) {
                                    this._addEdge(this.hoverAnchor, [node, i]);
                                }
                            }
                        });
                    }
                });
                break;
            case 'drag-canvas':
                // this.mainCvs.reset()
                this.mainCvs.translate(dx, dy);
                this.dynamicCvs.translate(dx, dy);
                break;
        }
        this._mouseUp();
    }
    _mouseUp() {
        this.isMouseDown = false;
        this.mouseDownType = null;
        this.dynamicCvs.clear();
    }
    _initCommand() {
        const command = new command_1.Command({ app: this });
        const { commands } = this;
        for (let cmd in commands) {
            command.register(cmd, this[commands[cmd]]);
        }
        this.command = command;
        this.contextmenu = new contextmenu_1.ContextMenu({
            app: this,
            command,
            container: this.oContainer
        });
    }
    _triggerMenu(show, e) {
        if (show) {
            let options = {
                type: null,
            };
            if (this.selectedNode) {
                options.type = 'node';
            }
            else if (this.selectedEdge) {
                options.type = 'edge';
            }
            this.contextmenu.attach(e, options);
        }
        else {
            this.contextmenu.detach();
        }
    }
    _preventDefaultMenu(e) {
        e.preventDefault();
    }
    _delNodeCommand() {
        this._delNode(this.selectedNode.id);
    }
    _delEdgeCommand() {
        this._delEdge(this.selectedEdge.id);
        this.selectedEdge = null;
    }
    /*
     * methods
     */
    _getSelectedNode({ x, y }) {
        const { nodes } = this;
        for (let i = nodes.length; i > 0; i--) {
            let node = nodes[i - 1];
            if (this.mainCvs.checkInNode(node.id, { x, y })) {
                return node;
            }
        }
        return null;
    }
    _getSelectedEdge({ x, y }) {
        const { edges } = this;
        for (let edge of edges) {
            if (this.mainCvs.checkOnEdge(edge.id, { x, y })) {
                return edge;
            }
        }
        return null;
    }
    _getRelatedEdge(nid) {
        let tmps = [];
        this.edges.forEach(e => {
            if (e.source === nid || e.target === nid) {
                tmps.push(e);
            }
        });
        return tmps;
    }
}
exports.Editor = Editor;