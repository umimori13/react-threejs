import { EventDispatcher, MOUSE, Raycaster, Scene, Vector2 } from 'three'
import Utils from './utils'

export class InputHandler extends EventDispatcher {
    constructor(camera, scene, domElement) {
        super()

        // this.renderer = renderer
        this.scene = scene
        this.camera = camera
        this.domElement = domElement

        this.mouse = new Vector2()

        this.interactiveScenes = []
        this.hoveredElements = []
        this.inputListeners = []
        this.interactiveObjects = new Set()
        this.logMessages = false
        this.blacklist = new Set()

        this.selection = []

        this.domElement.addEventListener(
            'contextmenu',
            (event) => {
                event.preventDefault()
            },
            false,
        )
        this.lastTime = Date.now()
        this.domElement.addEventListener(
            'mousedown',
            this.onMouseDown.bind(this),
            true,
        )
        this.domElement.addEventListener(
            'mouseup',
            this.onMouseUp.bind(this),
            true,
        )
        this.domElement.addEventListener(
            'mousemove',
            this.onMouseMove.bind(this),
            true,
        )
        this.domElement.addEventListener(
            'mousewheel',
            this.onMouseWheel.bind(this),
            true,
        )
    }

    onMouseDown(e) {
        if (this.logMessages)
            console.log(this.constructor.name + ': onMouseDown')

        e.preventDefault()

        let consumed = false
        let consume = () => {
            return (consumed = true)
        }
        if (this.hoveredElements.length === 0) {
            for (let inputListener of this.getSortedListeners()) {
                inputListener.dispatchEvent({
                    type: 'mousedown',
                    // viewer: this.viewer,
                    event: e,
                    mouse: this.mouse,
                })
            }
        } else {
            for (let hovered of this.hoveredElements) {
                let object = hovered.object
                object.dispatchEvent({
                    type: 'mousedown',
                    // viewer: this.viewer,
                    consume: consume,
                })

                if (consumed) {
                    break
                }
            }
        }

        if (!this.drag) {
            let target = this.hoveredElements.find(
                (el) =>
                    el.object._listeners &&
                    el.object._listeners['drag'] &&
                    el.object._listeners['drag'].length > 0,
            )

            if (target) {
                this.startDragging(target.object, { location: target.point })
            } else {
                this.startDragging(null)
            }
        }

        // if (this.scene) {
        //     this.viewStart = this.scene.view.clone()
        // }
    }

    onMouseUp(e) {
        if (this.logMessages) console.log(this.constructor.name + ': onMouseUp')

        e.preventDefault()

        let noMovement = this.getNormalizedDrag().length() === 0

        let consumed = false
        let consume = () => {
            return (consumed = true)
        }
        if (this.hoveredElements.length === 0) {
            for (let inputListener of this.getSortedListeners()) {
                inputListener.dispatchEvent({
                    type: 'mouseup',
                    // viewer: this.viewer,
                    event: e,
                    mouse: this.mouse,
                    noMovement: noMovement,
                    consume: consume,
                })

                if (consumed) {
                    break
                }
            }
        } else {
            let hovered = this.hoveredElements
                .map((e) => e.object)
                .find((e) => e._listeners && e._listeners['mouseup'])
            if (hovered) {
                hovered.dispatchEvent({
                    type: 'mouseup',
                    // viewer: this.viewer,
                    noMovement: noMovement,
                    consume: consume,
                })
            }
        }

        if (this.drag) {
            if (this.drag.object) {
                if (this.logMessages)
                    console.log(
                        `${this.constructor.name}: drop ${this.drag.object.name}`,
                    )
                this.drag.object.dispatchEvent({
                    type: 'drop',
                    drag: this.drag,
                    viewer: this.viewer,
                })
            } else {
                for (let inputListener of this.getSortedListeners()) {
                    inputListener.dispatchEvent({
                        type: 'drop',
                        drag: this.drag,
                        viewer: this.viewer,
                    })
                }
            }

            // check for a click
            let clicked =
                this.hoveredElements
                    .map((h) => h.object)
                    .find((v) => v === this.drag.object) !== undefined
            if (clicked) {
                if (this.logMessages)
                    console.log(
                        `${this.constructor.name}: click ${this.drag.object.name}`,
                    )
                this.drag.object.dispatchEvent({
                    type: 'click',
                    viewer: this.viewer,
                    consume: consume,
                })
            }

            this.drag = null
        }

        if (!consumed) {
            if (e.button === MOUSE.LEFT) {
                if (noMovement) {
                    let selectable = this.hoveredElements.find(
                        (el) =>
                            el.object._listeners &&
                            el.object._listeners['select'],
                    )
                    // console.log('select :>> ', this.hoveredElements)

                    if (selectable) {
                        console.log('selectable :>> ', selectable)
                        selectable = selectable.object

                        if (this.isSelected(selectable)) {
                            this.selection
                                .filter((e) => e !== selectable)
                                .forEach((e) => this.toggleSelection(e))
                        } else {
                            this.deselectAll()
                            this.toggleSelection(selectable)
                        }
                    } else {
                        this.deselectAll()
                    }
                }
            } else if (e.button === MOUSE.RIGHT && noMovement) {
                this.deselectAll()
            }
        }
    }

    onMouseMove(e) {
        e.preventDefault()
        // e.stopImmediatePropagation()
        // e.nativeEvent.stopPropagation()

        if (Date.now() - this.lastMove < 31) {
            // 32 frames a second
            return
        } else {
            this.lastMove = Date.now()
        }

        let rect = this.domElement.getBoundingClientRect()
        let x = e.clientX - rect.left
        let y = e.clientY - rect.top
        this.mouse.set(x, y)

        let hoveredElements = this.getHoveredElements()
        if (hoveredElements.length > 0) {
            let names = hoveredElements.map((h) => h.object.name).join(', ')
            if (this.logMessages)
                console.log(
                    `${this.constructor.name}: onMouseMove; hovered: '${names}'`,
                )
        }

        if (this.drag) {
            this.drag.mouse = e.buttons

            this.drag.lastDrag.x = x - this.drag.end.x
            this.drag.lastDrag.y = y - this.drag.end.y

            this.drag.end.set(x, y)

            if (this.drag.object) {
                if (this.logMessages)
                    console.log(
                        this.constructor.name +
                            ': drag: ' +
                            this.drag.object.name,
                    )
                this.drag.object.dispatchEvent({
                    type: 'drag',
                    drag: this.drag,
                    viewer: this.viewer,
                })
            } else {
                if (this.logMessages)
                    console.log(this.constructor.name + ': drag: ')

                let dragConsumed = false
                for (let inputListener of this.getSortedListeners()) {
                    // console.log('object :>> ', inputListener)
                    inputListener.dispatchEvent({
                        type: 'drag',
                        event: e,
                        drag: this.drag,
                        viewer: this.viewer,
                        consume: () => {
                            dragConsumed = true
                        },
                    })

                    if (dragConsumed) {
                        break
                    }
                }
            }
        } else {
            let curr = hoveredElements.map((a) => a.object).find((a) => true)
            let prev = this.hoveredElements
                .map((a) => a.object)
                .find((a) => true)

            if (curr !== prev) {
                if (curr) {
                    if (this.logMessages)
                        console.log(
                            `${this.constructor.name}: mouseover: ${curr.name}`,
                        )
                    curr.dispatchEvent({
                        type: 'mouseover',
                        object: curr,
                    })
                }
                if (prev) {
                    if (this.logMessages)
                        console.log(
                            `${this.constructor.name}: mouseleave: ${prev.name}`,
                        )
                    prev.dispatchEvent({
                        type: 'mouseleave',
                        object: prev,
                    })
                }
            }

            if (hoveredElements.length > 0) {
                let object = hoveredElements
                    .map((e) => e.object)
                    .find((e) => e._listeners && e._listeners['mousemove'])

                if (object) {
                    object.dispatchEvent({
                        type: 'mousemove',
                        object: object,
                        point: hoveredElements,
                    })
                }
            }
            for (let inputListener of this.getSortedListeners()) {
                // console.log('object :>> ', inputListener)
                inputListener.dispatchEvent({
                    type: 'mousemove',
                    event: e,
                    drag: this.drag,
                    mouse: this.mouse,
                })
            }
        }

        // for (let inputListener of this.getSortedListeners()) {
        // 	inputListener.dispatchEvent({
        // 		type: 'mousemove',
        // 		object: null
        // 	});
        // }

        this.hoveredElements = hoveredElements
    }

    onMouseWheel(e) {
        if (!this.enabled) return

        if (this.logMessages)
            console.log(this.constructor.name + ': onMouseWheel')

        e.preventDefault()

        let delta = 0
        if (e.wheelDelta !== undefined) {
            // WebKit / Opera / Explorer 9
            delta = e.wheelDelta
        } else if (e.detail !== undefined) {
            // Firefox
            delta = -e.detail
        }

        let ndelta = Math.sign(delta)

        // this.wheelDelta += Math.sign(delta);

        if (this.hoveredElement) {
            this.hoveredElement.object.dispatchEvent({
                type: 'mousewheel',
                delta: ndelta,
                object: this.hoveredElement.object,
            })
        } else {
            for (let inputListener of this.getSortedListeners()) {
                inputListener.dispatchEvent({
                    type: 'mousewheel',
                    delta: ndelta,
                    object: null,
                })
            }
        }
    }

    startDragging(object, args = null) {
        let name = object ? object.name : 'no name'
        if (this.logMessages)
            console.log(`${this.constructor.name}: startDragging: '${name}'`)

        this.drag = {
            start: this.mouse.clone(),
            end: this.mouse.clone(),
            lastDrag: new Vector2(0, 0),
            // startView: this.scene.view.clone(),
            object: object,
        }

        if (args) {
            for (let key of Object.keys(args)) {
                this.drag[key] = args[key]
            }
        }
    }

    addInputListener(listener) {
        this.inputListeners.push(listener)
    }

    removeInputListener(listener) {
        this.inputListeners = this.inputListeners.filter((e) => e !== listener)
    }

    getHoveredElement() {
        let hoveredElements = this.getHoveredElements()
        if (hoveredElements.length > 0) {
            return hoveredElements[0]
        } else {
            return null
        }
    }

    getHoveredElements() {
        let scenes = this.interactiveScenes.concat(this.scene)

        let interactableListeners = [
            'mouseup',
            'mousemove',
            'mouseover',
            'mouseleave',
            'drag',
            'drop',
            'click',
            'select',
            'deselect',
        ]
        let interactables = []
        for (let scene of scenes) {
            scene.traverseVisible((node) => {
                if (
                    node._listeners &&
                    node.visible &&
                    !this.blacklist.has(node)
                ) {
                    let hasInteractableListener =
                        interactableListeners.filter((e) => {
                            return node._listeners[e] !== undefined
                        }).length > 0

                    if (hasInteractableListener) {
                        interactables.push(node)
                    }
                }
            })
        }

        // console.log('interactables :>> ', interactables)
        let camera = this.camera
        let ray = Utils.mouseToRay(
            this.mouse,
            camera,
            this.domElement.clientWidth,
            this.domElement.clientHeight,
        )

        let raycaster = new Raycaster()
        raycaster.ray.set(ray.origin, ray.direction)
        raycaster.params.Line.threshold = 0.2

        let intersections = raycaster.intersectObjects(
            interactables.filter((o) => o.visible),
            false,
        )
        // console.log('intersections :>> ', intersections)

        return intersections

        // if(intersections.length > 0){
        //	return intersections[0];
        // }else{
        //	return null;
        // }
    }

    registerInteractiveObject(object) {
        this.interactiveObjects.add(object)
    }

    removeInteractiveObject(object) {
        this.interactiveObjects.delete(object)
    }

    registerInteractiveScene(scene) {
        let index = this.interactiveScenes.indexOf(scene)
        if (index === -1) {
            this.interactiveScenes.push(scene)
        }
    }

    unregisterInteractiveScene(scene) {
        let index = this.interactiveScenes.indexOf(scene)
        if (index > -1) {
            this.interactiveScenes.splice(index, 1)
        }
    }

    getSortedListeners() {
        return this.inputListeners.sort((a, b) => {
            let ia = a.importance !== undefined ? a.importance : 0
            let ib = b.importance !== undefined ? b.importance : 0

            return ib - ia
        })
    }

    getNormalizedDrag() {
        if (!this.drag) {
            return new Vector2(0, 0)
        }

        let diff = new Vector2().subVectors(this.drag.end, this.drag.start)

        diff.x = diff.x / this.domElement.clientWidth
        diff.y = diff.y / this.domElement.clientHeight

        return diff
    }

    getNormalizedLastDrag() {
        if (!this.drag) {
            return new Vector2(0, 0)
        }

        let lastDrag = this.drag.lastDrag.clone()

        lastDrag.x = lastDrag.x / this.domElement.clientWidth
        lastDrag.y = lastDrag.y / this.domElement.clientHeight

        return lastDrag
    }

    setScene(scene) {
        this.deselectAll()

        this.scene = scene
    }

    isSelected(object) {
        let index = this.selection.indexOf(object)

        return index !== -1
    }

    toggleSelection(object) {
        let oldSelection = this.selection

        let index = this.selection.indexOf(object)

        if (index === -1) {
            this.selection.push(object)
            object.dispatchEvent({
                type: 'select',
            })
        } else {
            this.selection.splice(index, 1)
            object.dispatchEvent({
                type: 'deselect',
            })
        }

        this.dispatchEvent({
            type: 'selection_changed',
            oldSelection: oldSelection,
            selection: this.selection,
        })
    }

    deselect(object) {
        let oldSelection = this.selection

        let index = this.selection.indexOf(object)

        if (index >= 0) {
            this.selection.splice(index, 1)
            object.dispatchEvent({
                type: 'deselect',
            })

            this.dispatchEvent({
                type: 'selection_changed',
                oldSelection: oldSelection,
                selection: this.selection,
            })
        }
    }

    deselectAll() {
        for (let object of this.selection) {
            object.dispatchEvent({
                type: 'deselect',
            })
        }

        let oldSelection = this.selection

        if (this.selection.length > 0) {
            this.selection = []
            this.dispatchEvent({
                type: 'selection_changed',
                oldSelection: oldSelection,
                selection: this.selection,
            })
        }
    }

    dispose() {
        this.domElement.removeEventListener(
            'mousedown',
            this.onMouseDown.bind(this),
            false,
        )
        this.domElement.removeEventListener(
            'mouseup',
            this.onMouseUp.bind(this),
            false,
        )
        this.domElement.removeEventListener(
            'mousemove',
            this.onMouseMove.bind(this),
            false,
        )
        this.domElement.removeEventListener(
            'mousewheel',
            this.onMouseWheel.bind(this),
            false,
        )
    }
}
