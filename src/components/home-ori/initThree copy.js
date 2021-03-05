import React, { useRef, useEffect, useState } from 'react'
import style from './style.module.css'
import json from 'three/examples/fonts/helvetiker_regular.typeface.json'
import Utils from '../../utils/utils'
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'

const InitThree = () => {
    const mount = useRef(null)
    const [isAnimating, setAnimating] = useState(true)
    const controls = useRef(null)

    useEffect(() => {
        let width = mount.current.clientWidth
        let height = mount.current.clientHeight
        let frameId

        const scene = new Scene()
        const camera = new PerspectiveCamera(75, width / height, 0.1, 1000)
        const renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
        })
        // const geometry = new BoxGeometry(1, 1, 1)
        // const material = new MeshBasicMaterial({ color: 0xff00ff })
        // const cube = new Mesh(geometry, material)

        camera.position.z = 4
        // scene.add(cube)
        renderer.setClearColor('#000000')
        renderer.setSize(width, height)

        const renderScene = () => {
            renderer.render(scene, camera)
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

            // scene.remove(cube)
            // geometry.dispose()
            // material.dispose()
        }
    }, [])

    useEffect(() => {
        if (isAnimating) {
            controls.current.start()
        } else {
            controls.current.stop()
        }
    }, [isAnimating])

    return (
        <div
            className={style.Scene}
            ref={mount}
            onClick={() => setAnimating(!isAnimating)}
        />
    )
}

export { InitThree }
