/*
 *  mind-map
 */

import { createDom, getDom } from '@lib/dom'
import { getLeavesCount, figureNodeLevel } from '@lib/tree'
import MockData from '@data/mind-map-data'
import COLOR from '@lib/color'
import Toolbar from './toolbar'

class Mind {
    constructor({ container = '#mind-map-container', data = {}, options = {} }) {
        if (!getDom(container)) {
            throw Error('null canvas container found')
        }
        this.oCon = getDom(container)
        this.options = {
            ...this.options,
            ...options,
        }

        this._init()
        this._setData(data)
        this._render()
        this._bindEvent()
    }
    /*
     *  initial info
     */
    options = {
        style: {
            fill: COLOR.blue,
            line: COLOR.line,
            font: COLOR.font,
        },
        legends: null,
    }
    _init() {
        const rect = this.oCon.getBoundingClientRect()
        const { width, height, left, top } = rect
        const ratio = window.devicePixelRatio || 1
        // dom config
        this.config = {
            width,
            height,
            ratio,
            left,
            top,
        }
        console.info(`当前屏幕像素密度为${ratio}`)
        // set node painting info
        this._initNodeInfo()
        // add legends to container
        // this._initLegends()
        // add toolbar
        this._initToolbar()

        const oCanvas = createDom('canvas')
        oCanvas.width = width * ratio
        oCanvas.height = height * ratio
        // canvas & ctx
        this.oCanvas = oCanvas
        this.ctx = oCanvas.getContext('2d')
        this.ctx.font = `${this.nodeInfo.fontSize}px Helvetica Neue,Helvetica,PingFang SC,Microsoft YaHei,sans-serif`
        this.ctx.textBaseline = 'middle'
        this.ctx.textAlign = 'center'
        this.ctx.fillStyle = this.options.style.fill
        this.ctx.strokeStyle = this.options.style.line
        // translate the origin to make the root node a better place
        this._initTranslate()

        // append canvas dom to container
        this.oCon.appendChild(this.oCanvas)
    }
    nodeInfo = {
        height: 32,
        minWidth: 80,
        horizontalGap: 100,
        verticalHeight: 40,
        fontSize: 12,
    }
    _initNodeInfo() {
        const { ratio: r } = this.config
        const { nodeInfo } = this
        for (let k in nodeInfo) {
            nodeInfo[k] = nodeInfo[k] * r
        }
        nodeInfo.fontSize = r > 1 ? 22 : 12
    }
    // canvas ctx translate info, it's the origin pos relative to canvas(0, 0)
    _initTranslate() {
        this._translate(50 * this.config.ratio, this.oCanvas.height / 2)
    }
    translate = {
        x: 0,
        y: 0,
    }
    /*
     *  arguments(x, y) is diffX & diffY
     *  ctx.translate() is accumulative
     */
    _translate(x, y) {
        this.ctx.translate(x, y)
        this.translate.x += x
        this.translate.y += y
    }
    // repaint
    _reset() {
        this._clear()
        this.scale = 10
        this._translate(-this.translate.x, -this.translate.y)
        this._initTranslate()
        this._render()
    }
    _repaint(x = 0, y = 0) {
        this._clear()
        this.ctx.save()
        const sc = this.scale / 10
        this.ctx.transform(sc, 0, 0, sc, x, y)
        this._render()
        this.ctx.restore()
    }

    /*
     *  data: {
     *      ...node,
     *      children: [ node ],
     *
     *      // calculated property for canvas painting
     *      count: number,      // width of tree, which current node as root
     *      level: number,      // height of current node
     *      x: number,      // origin x-position
     *      y: number,      // origin y-position
     *      end: number,    // end x-position
     *  }
     */
    _setData(data) {
        this.data = data
        // scan the tree
        figureNodeLevel(this.data)
    }
    _render() {
        const { data } = this
        let queue = []
        queue.push(data)

        const { horizontalGap: gap, verticalHeight: vh } = this.nodeInfo

        while (queue.length) {
            let cur = queue.shift()
            // paint root first
            if (cur.level === 0) {
                this._paintNode(data, { ox: 0, oy: 0 })
            }
            // paint children node & line
            const { children } = cur
            if (!children || !children.length) {
                continue
            }
            // line from root to child, first part
            this._paintLine({ x: cur.end, y: cur.y }, { x: cur.end + gap/2, y: cur.y })

            let n = children.length

            children.forEach((child, i) => {
                let oy = child.count * vh / 2
                if (i > 0) {
                    let prevHeight = children[i - 1]['count'] * vh / 2 + children[i - 1]['y']
                    oy += prevHeight
                } else {
                    oy += cur.y - cur.count * vh / 2
                }
                // paint root's child node
                this._paintNode(child, { ox: cur.end + gap, oy })

                if (i === 0 || i === n - 1) {
                    // polygon-line from root to child, second part
                    this._paintLine({ x: cur.end + gap/2, y: cur.y }, { x: cur.end + gap/2, y: child.y })
                }
                // line from root to child, third part
                this._paintLine({ x: cur.end + gap/2, y: child.y }, { x: child.x, y: child.y })
                // add child nodes to the queue
                queue.push(child)
            })
        }
    }
    /*
     *  node: {
     *      x, y, end
     *  }
     *  rect(x, y - node.height/2, node.width, node.height)
     *
     */
    _paintNode(node, { ox, oy }) {
        const { ctx, options } = this
        const { height: h, minWidth: w } = this.nodeInfo

        let t = ctx.measureText(node.text)
        let tw = Math.max(t.width + 20, w)

        if (options.legends && options.legends[node.type]) {
            let color = options.legends[node.type]['color']
            ctx.save()
            ctx.fillStyle = color
            ctx.fillRect(ox, oy - h/2, tw, h)
            ctx.restore()
        } else {
            ctx.fillRect(ox, oy - h/2, tw, h)
        }

        ctx.save()
        ctx.fillStyle = options.style.font
        ctx.fillText(node.text, ox + tw / 2, oy)
        ctx.restore()

        node.x = ox
        node.y = oy
        node.end = ox + tw
    }
    _paintLine(start, end) {
        const { ctx } = this
        const { x: sx, y: sy } = start
        const { x: ex, y: ey } = end

        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(ex, ey)
        ctx.stroke()
        ctx.closePath()
    }

    _clear() {
        const { x, y } = this.translate
        this.ctx.clearRect(-x, -y, this.oCanvas.width, this.oCanvas.height)
    }

    /*
     *  event
     */
    _bindEvent() {
        this.oCanvas.addEventListener('mousedown', this._mouseDown.bind(this))
        this.oCanvas.addEventListener('mouseup', this._mouseUp.bind(this))
        // this.oCanvas.addEventListener('mousemove', this._mouseMove.bind(this))
        this.oCanvas.addEventListener('mousemove', e => {
            requestAnimationFrame(this._mouseMove.bind(this, e))
        })
    }
    mouseEvent = {
        isDown: false,
        // mouse event start point (sx, sy)
        sx: 0,
        sy: 0,
    }
    _mouseDown(e) {
        const { offsetX: x, offsetY: y } = e
        const { ratio: r } = this.config
        const sc = this.scale / 10
        this.mouseEvent.isDown = true
        this.mouseEvent.sx = x*r*sc
        this.mouseEvent.sy = y*r*sc
    }
    _mouseMove(e) {
        const { isDown, sx, sy } = this.mouseEvent
        const sc = this.scale / 10
        if (!isDown) {
            return
        }
        const { offsetX: x, offsetY: y } = e
        const { ratio: r } = this.config
        let diffX = x*r*sc - sx
        let diffY = y*r*sc - sy

        this._repaint(diffX, diffY)
    }
    _mouseUp(e) {
        const { offsetX: x, offsetY: y } = e
        const { sx, sy } = this.mouseEvent
        const { ratio: r } = this.config
        const sc = this.scale / 10

        this.mouseEvent.isDown = false

        let diffX = x*r*sc - sx
        let diffY = y*r*sc - sy

        this._translate(diffX, diffY)
    }

    // canvas ctx scale info
    scale = 10
    _zoomIn() {
        this.scale < 15 && (this.scale ++)
        this._repaint()
    }
    _zoomOut() {
        this.scale > 5 && (this.scale --)
        this._repaint()
    }

    // toolbar: zoom-in, zoom-out
    _initToolbar() {
        this.toolbar = new Toolbar({ selector: '#toolbar' })
        this.toolbar.registerCommands({
            'zoom-in': this._zoomIn.bind(this),
            'zoom-out': this._zoomOut.bind(this),
            'reset': this._reset.bind(this),
        })
    }
}


new Mind({
    data: MockData,
    options: {
        // legends: {
        //     // type: { name, color }
        //     'default': { name: '业务场景', color: COLOR.blue },
        //     'tech': { name: '技术', color: COLOR.green },
        //     'todo': { name: 'TODO', color: COLOR.red }
        // },
        line: 'polygon',
    },
})