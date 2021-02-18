import {
    CatmullRomCurve3,
    Geometry,
    Points,
    PointsMaterial,
    Vector3,
} from 'three'

const tunnel = () => {
    const points = [
        [68.5, 185.5],
        [1, 262.5],
        [270.9, 281.9],
        [345.5, 212.8],
        [178, 155.7],
        [240.3, 72.3],
        [153.4, 0.6],
        [52.6, 53.3],
        [68.5, 185.5],
    ]

    //Convert the array of points into vertices
    for (var i = 0; i < points.length; i++) {
        var x = points[i][0]
        var y = 0
        var z = points[i][1]
        points[i] = new Vector3(x, y, z)
    }
    //Create a path from the points
    const path = new CatmullRomCurve3(points)

    // Define the precision of the finale tube, the amount of divisions
    const tubeDetail = 500
    // Define the precision of the circles
    const circlesDetail = 10

    // Define the radius of the finale tube
    const radius = 5
    // Get all the circles that will compose the tube
    const frames = path.computeFrenetFrames(tubeDetail, true)

    // Create an empty Geometry where we will put the particles
    const geometry = new Geometry()

    // First loop through all the circles
    for (var i = 0; i < tubeDetail; i++) {
        // Get the normal values for each circle
        const normal = frames.normals[i]
        // Get the binormal values
        const binormal = frames.binormals[i]

        // Calculate the index of the circle (from 0 to 1)
        const index = i / tubeDetail
        // Get the coordinates of the point in the center of the circle
        const p = path.getPointAt(index)

        // Loop for the amount of particles we want along each circle
        for (var j = 0; j < circlesDetail; j++) {
            // Clone the position of the point in the center
            var position = p.clone()

            // Calculate the angle for each particle along the circle (from 0 to Pi*2)
            var angle = (j / circlesDetail) * Math.PI * 2
            // Calculate the sine of the angle
            var sin = Math.sin(angle)
            // Calculate the cosine from the angle
            var cos = -Math.cos(angle)

            // Calculate the normal of each point based on its angle
            var normalPoint = new Vector3(0, 0, 0)
            normalPoint.x = cos * normal.x + sin * binormal.x
            normalPoint.y = cos * normal.y + sin * binormal.y
            normalPoint.z = cos * normal.z + sin * binormal.z
            // Multiple the normal by the radius
            normalPoint.multiplyScalar(radius)

            // We add the normal values for each point
            position.add(normalPoint)
            geometry.vertices.push(position)
        }
    }

    // Material for the points
    const material = new PointsMaterial({
        size: 1, // The size of each point
        sizeAttenuation: true, // If we want the points to change size depending of distance with camera
        color: 0xff0000, // The color of the points
    })

    // Create a points object based on the vertices we calculated and the material
    const tube = new Points(geometry, material)
    //Add tube into the scene
    scene.add(tube)
}
export default tunnel
