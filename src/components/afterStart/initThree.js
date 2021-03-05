import React, { useRef, useEffect, useState } from 'react'
import style from './style.module.css'
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

import { InputHandler } from '../../utils/inputHandler'
// import FontLoader from 'three/examples/jsm/loaders/'

const InitThree = () => {
    const mount = useRef(null)
    const [isAnimating, setAnimating] = useState(true)
    const controls = useRef(null)

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
