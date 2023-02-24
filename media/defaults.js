export const effectDefaults = {
    patch: {
        name: "patch",
        anchor: "free",
        texture: {
            color: [1, 1, 1, 1]
        }
    },
    facemodel: {
        name: "facemodel",
        mouth: true,
        eyes: true
    },
    light: {
        name: "light",
        type: "ambient",
        color: [1.0, 1.0, 1.0]
    },
    colorfilter: {
        name: "colorfilter",
        lookup: "ColorFilter/lookup.png",
        intensity: 0.75
    },
    beautify: {
        name: "beautify",
        mix: 0.65
    },
    liquifiedwarp: {
        name: "liquifiedwarp",
        progress: 0.8,
        points: []
    },
    posteffect: {
        name: "posteffect",
        type: "sharpen",
        intensity: 0.5
    },
    model3d: {
        name: "model3d",
        anchor: "forehead",
        model: "Models/DefaultPlane.mdl",
        material: "Materials/DefaultGrey.xml",
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [10, 10, 10]
    }
}