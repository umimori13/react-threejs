import React, { useRef, useEffect, useState } from 'react'
import style from './style.module.css'
import json from 'three/examples/fonts/helvetiker_regular.typeface.json'
import chineseJson from '../../assets/chenweixun-yingxing_Regular.json'
import Utils from '../../utils/utils'
import {
    AdditiveBlending,
    Clock,
    Color,
    Float32BufferAttribute,
    FontLoader,
    Line,
    MeshBasicMaterial,
    PerspectiveCamera,
    Scene,
    ShaderMaterial,
    TextBufferGeometry,
    WebGLRenderer,
} from 'three'

import { OrbitControls } from '../../utils/OrbitControls'
// import { OrbitControls } from './OrbitControls'
import lineFS from './shaders/line.fs'
import lineVS from './shaders/line.vs'
import Particle from './particle'
import jpg from '../../assets/zangoose.jpg'
import { InputHandler } from '../../utils/inputHandler'
// import FontLoader from 'three/examples/jsm/loaders/'

const InitThree = () => {
    const mount = useRef(null)
    const [isAnimating, setAnimating] = useState(true)
    const controls = useRef(null)

    const lineVisible = true

    useEffect(() => {
        let width = mount.current.clientWidth
        let height = mount.current.clientHeight
        let frameId

        const scene = new Scene()
        const camera = new PerspectiveCamera(75, width / height, 1, 10000)
        const renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
        })
        camera.position.z = 200

        const uniforms = {
            amplitude: { value: 5.0 },
            opacity: { value: 0.1 },
            color: { value: new Color(0xffffff) },
        }

        const loader = new FontLoader()
        // 欢迎 lines
        {
            // loader.load(json, (font) => {
            const font = loader.parse(chineseJson)
            const geometry = new TextBufferGeometry('欢迎来到', {
                font: font,

                size: 15,
                height: 1,
                curveSegments: 10,

                bevelThickness: 1,
                bevelSize: 1.5,
                bevelEnabled: true,
                bevelSegments: 10,
            })
            geometry.center()
            const count = geometry.attributes.position.count

            const customColor = new Float32BufferAttribute(count * 3, 3)
            geometry.setAttribute('customColor', customColor)

            const color = new Color(0xffffff)

            for (let i = 0, l = customColor.count; i < l; i++) {
                color.setHSL(i / l, 0.5, 0.5)
                color.toArray(customColor.array, i * customColor.itemSize)
            }
            const shaderMaterial = new ShaderMaterial({
                uniforms: uniforms,
                vertexShader: '#define USEBIG;\n' + lineVS,
                fragmentShader: lineFS,
                blending: AdditiveBlending,
                depthTest: false,
                transparent: true,
            })

            const line = new Line(geometry, shaderMaterial)
            lineVisible ? scene.add(line) : null
            line.position.set(0, 120, 0)
            line.scale.set(1.7, 1.7, 1)
        }

        let displaceLine
        {
            // welcome Lines
            const font = loader.parse(json)
            const geometry = new TextBufferGeometry('welcome', {
                font: font,

                size: 15,
                height: 1,
                curveSegments: 10,

                bevelThickness: 5,
                bevelSize: 1,
                bevelEnabled: true,
                bevelSegments: 10,
            })
            geometry.center()
            const count = geometry.attributes.position.count

            const customColor = new Float32BufferAttribute(count * 3, 3)
            geometry.setAttribute('customColor', customColor)

            const displacement = new Float32BufferAttribute(count * 3, 3)
            geometry.setAttribute('displacement', displacement)

            const color = new Color(0xffffff)

            for (let i = 0, l = customColor.count; i < l; i++) {
                color.setHSL(i / l, 0.5, 0.5)
                color.toArray(customColor.array, i * customColor.itemSize)
            }
            const shaderMaterial = new ShaderMaterial({
                uniforms: uniforms,
                vertexShader: '#define USERANDOM;\n' + lineVS,
                fragmentShader: lineFS,
                blending: AdditiveBlending,
                depthTest: false,
                transparent: true,
            })

            const line = new Line(geometry, shaderMaterial)
            lineVisible ? scene.add(line) : null
            line.position.set(0, 90, 0)
            line.scale.set(1.7, 1.7, 1)
            displaceLine = line
        }

        let rollLine
        {
            // 欢迎 lines
            // loader.load(json, (font) => {
            const font = loader.parse(chineseJson)
            const geometry = new TextBufferGeometry('莫里的小窝', {
                font: font,

                size: 15,
                height: 1,
                curveSegments: 10,

                bevelThickness: 1,
                bevelSize: 1.5,
                bevelEnabled: true,
                bevelSegments: 10,
            })
            geometry.center()
            const count = geometry.attributes.position.count

            const customColor = new Float32BufferAttribute(count * 3, 3)
            geometry.setAttribute('customColor', customColor)

            const displacement = new Float32BufferAttribute(count * 3, 3)
            geometry.setAttribute('displacement', displacement)
            const color = new Color(0xffffff)

            for (let i = 0, l = customColor.count; i < l; i++) {
                color.setHSL(i / l, 0.5, 0.5)
                color.toArray(customColor.array, i * customColor.itemSize)
            }
            const shaderMaterial = new ShaderMaterial({
                uniforms: uniforms,
                vertexShader: lineVS,
                fragmentShader: lineFS,
                blending: AdditiveBlending,
                depthTest: false,
                transparent: true,
            })

            const line = new Line(geometry, shaderMaterial)
            lineVisible ? scene.add(line) : null
            line.position.set(0, 60, 0)
            line.scale.set(1.7, 1.7, 1)
            rollLine = line
        }

        // })
        // const geometry = new BoxGeometry(1, 1, 1)
        // const material = new MeshBasicMaterial({ color: 0xff00ff })
        // const cube = new Mesh(geometry, material)

        const particle = new Particle(jpg)
        scene.add(particle)
        particle.scale.set(0.4, 0.4, 0.4)
        particle.position.set(-25, -30, 0)

        // scene.add(cube)
        renderer.setClearColor('#000000')
        renderer.setSize(width, height)

        const inputHandler = new InputHandler(
            camera,
            scene,
            renderer.domElement,
        )

        const orbitControls = new OrbitControls(camera, renderer.domElement)
        inputHandler.addInputListener(orbitControls)
        let count = 0,
            lastTime = 0,
            curTime = 0
        const clock = new Clock()
        const renderScene = () => {
            const time = Date.now() * 0.001

            // line.rotation.y = 0.25 * time
            const delta = clock.getDelta()
            particle.update(delta)

            uniforms.amplitude.value = Math.sin(0.5 * time) * 0.2
            uniforms.color.value.offsetHSL(0.0005, 0, 0)

            {
                const attributes = displaceLine.geometry.attributes
                const array = attributes.displacement.array

                for (let i = 0, l = array.length; i < l; i += 3) {
                    array[i] += Math.sin(0.5 * time) * (0.5 - Math.random())
                    array[i + 1] += Math.sin(0.5 * time) * (0.5 - Math.random())
                    // array[i + 2] += Math.sin(0.5 * time) * (0.5 - Math.random()) * 5
                }

                attributes.displacement.needsUpdate = true
            }

            {
                const attributes = rollLine.geometry.attributes
                const array = attributes.displacement.array

                if (count >= array.length) {
                    if (lastTime === curTime) {
                        lastTime = Date.now()
                        curTime = Date.now() + 0.0001
                    } else {
                        if (curTime - lastTime >= 5000) {
                            lastTime = curTime
                            count = 0
                            for (let i = 0, l = array.length; i < l; i += 3) {
                                array[i] = 0
                                array[i + 1] = 0
                                array[i + 2] = 0
                            }
                        } else {
                            curTime = Date.now()
                        }
                    }
                } else {
                    count +=
                        count + 3000 >= array.length
                            ? array.length - count
                            : 3000
                    for (let i = 0, l = count; i < l; i += 3) {
                        array[i] = 1
                        array[i + 1] = 1
                        array[i + 2] = 1
                    }
                }
                attributes.displacement.needsUpdate = true
            }

            renderer.render(scene, camera)
            orbitControls.update()
        }

        const handleResize = () => {
            width = mount.current.clientWidth
            height = mount.current.clientHeight
            renderer.setSize(width, height)
            camera.aspect = width / height
            camera.updateProjectionMatrix()
            renderScene()
        }

        const animate = () => {
            // cube.rotation.x += 0.01
            // cube.rotation.y += 0.01

            renderScene()
            frameId = window.requestAnimationFrame(animate)
        }

        const start = () => {
            if (!frameId) {
                frameId = requestAnimationFrame(animate)
            }
        }

        const stop = () => {
            cancelAnimationFrame(frameId)
            frameId = null
        }

        mount.current.appendChild(renderer.domElement)
        window.addEventListener('resize', handleResize)
        start()

        controls.current = { start, stop }

        return () => {
            stop()
            window.removeEventListener('resize', handleResize)
            mount.current.removeChild(renderer.domElement)

            Utils.disposeAll(scene)
            orbitControls.dispose()
            inputHandler.dispose()
            // scene.remove(cube)
            // geometry.dispose()
            // material.dispose()
        }
    }, [])

    // useEffect(() => {
    //     if (isAnimating) {
    //         controls.current.start()
    //     } else {
    //         controls.current.stop()
    //     }
    // }, [isAnimating])

    return (
        <div
            className={style.Scene}
            ref={mount}
            onClick={() => setAnimating(!isAnimating)}
        />
    )
}

export { InitThree }
