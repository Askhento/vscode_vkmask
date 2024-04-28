<script lang="ts">
    import * as l10n from "@vscode/l10n";

    import { createEventDispatcher } from "svelte";
    import NumberSliderControl from "./NumberSliderControl.svelte";
    import VectorControl from "./VectorControl.svelte";

    export let value, path;

    path = path.slice(0, -1); // meh :(

    let { u_transform, v_transform } = value;

    // console.log("UV", value, path);

    let mat = [
        u_transform.value ?? u_transform.uiDescription.defValue,
        v_transform.value ?? v_transform.uiDescription.defValue,
    ];

    // use column major
    let transformMat = [
        [mat[0][0], mat[0][1]],
        [mat[1][0], mat[1][1]],
    ];

    let translation = [mat[0][2], mat[1][2]];

    // console.log("mat", mat);
    let scale = getScale(transformMat),
        rotation = getRotation(transformMat);

    const identity = [
        [1, 0],
        [0, 1],
    ];
    // console.log("composite values ", rotation);

    // console.log("det", det(mat));
    // console.log("inveres", inverse(mat));
    // console.log("pivot", matMult(translation, inverse(matSub(identity, transformMat))));

    // let pivot = getPivot(translation, transformMat)[0];
    let pivot = [0.5, 0.5];

    // console.log(matMult(identity, identity));

    // console.log("mult", matMult(transformMat, ));

    const dispatch = createEventDispatcher();

    function getPivot(tr, m) {
        const inv = inverse(matSub(identity, m));
        if (inv === null) return [[0, 0]];
        return matMult(tr, inv);
    }

    function getScale(m) {
        return [
            prettyNumber(Math.sqrt(m[0][0] * m[0][0] + m[0][1] * m[0][1])),
            prettyNumber(Math.sqrt(m[1][0] * m[1][0] + m[1][1] * m[1][1])),
        ];
    }

    function getRotation(m) {
        return radToDeg(Math.atan2(m[1][0], m[0][0]));
    }

    function radToDeg(r) {
        return Math.floor((180 * r) / Math.PI);
    }
    function degToRad(d) {
        return (d / 180) * Math.PI;
    }

    function prettyNumber(num) {
        return parseFloat(num.toFixed(3));
    }

    function det(m) {
        return m[0][0] * m[1][1] - m[0][1] * m[1][0];
    }

    function inverse(m) {
        const d = det(m);
        if (d === 0) {
            console.log("zero determinant ", m);
            return null;
        }

        return [
            [m[1][1] / d, -m[0][1] / d],
            [-m[1][0] / d, m[0][0] / d],
        ];
    }

    // function matMult(a, b) {
    //     return [
    //         [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
    //         [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]],
    //     ];
    // }

    function matSub(a, b) {
        const aShape = [a.length, a[0].length];
        const bShape = [b.length, b[0].length];

        if (aShape[0] !== bShape[0] || aShape[1] !== bShape[1]) {
            console.log("shapes does not match  : ", aShape, bShape);
            return null;
        }

        const res = [];
        for (let i = 0; i < aShape[0]; i++) {
            // row
            res.push([]);
            for (let j = 0; j < bShape[1]; j++) {
                res[i].push(a[i][j] - b[i][j]);
            }
        }
        return res;
    }

    function matMult(a, b) {
        const aShape = [a.length, a[0].length];
        const bShape = [b.length, b[0].length];

        if (aShape[1] !== bShape[0]) {
            console.log("shapes does not match  : ", aShape, bShape);
            return null;
        }

        const res = [];

        for (let i = 0; i < aShape[0]; i++) {
            // row
            res.push([]);
            for (let j = 0; j < bShape[1]; j++) {
                // column
                let sum = 0;
                for (let k = 0; k < aShape[1]; k++) {
                    sum += a[i][k] * b[k][j];
                }
                res[i].push(sum);
            }
        }

        return res;
    }

    function setRotation() {
        // console.log(rotation);
        const radRot = degToRad(rotation);
        const cos = prettyNumber(Math.cos(radRot));
        const sin = prettyNumber(Math.sin(radRot));

        mat[0][0] = cos; // * scale[0];
        mat[0][1] = -sin; // * scale[0]; // evil hack
        mat[1][0] = sin; // * scale[1];
        mat[1][1] = cos; // * scale[1];

        // translation = matMult([[0.5, 0.5]], matSub(identity, transformMat));
        mat[0][2] = prettyNumber(0.5 * (1 - mat[0][0] - mat[0][1]));
        mat[1][2] = prettyNumber(0.5 * (1 - mat[1][0] - mat[1][1]));

        // mat[0][0] *= scale[0];
        // mat[0][1] *= scale[0];
        // mat[1][0] *= scale[1];
        // mat[1][1] *= scale[1];

        // console.log("set rot", mat);
    }

    //

    function rotationChanged(e) {
        // console.log("rotaion ", e.detail.value);

        setRotation();
        sendValue();

        // console.log("new rotation", newRotation);
    }

    function scaleChanged(e) {
        // console.log("offset ", e.detail);
        setRotation();
        // sendValue();
    }

    function sendValue() {
        const msg = [
            {
                value: mat[0],
                path: [...path, "u_transform"],
            },
            {
                value: mat[1],
                path: [...path, "v_transform"],
            },
        ];
        // console.log("should send value");
        dispatch("changed", msg);
    }
</script>

<NumberSliderControl
    bind:value={rotation}
    label={"locale.controls.uvTransform.rotation"}
    {path}
    params={{
        min: -180,
        max: 180,
        steps: 360,
        valueLabel: "°",
        // valueTemplate: (val) => Math.floor((val * 180.0) / Math.PI),
    }}
    on:changed={rotationChanged}
/>

<VectorControl
    bind:value={scale}
    {path}
    label={"locale.controls.uvTransform.scale"}
    params={{ valueLabels: ["X", "Y"] }}
    on:changed={scaleChanged}
/>
<VectorControl
    bind:value={pivot}
    {path}
    label={"locale.controls.uvTransform.pivot"}
    params={{ valueLabels: ["X", "Y"] }}
    on:changed={() => {}}
/>

<!-- <div>{label}</div>
<div class="control-wrapper">
    <input type="text" />
</div> -->

<style>
    /* .control-wrapper {
        display: flex;
        flex-direction: row;
        justify-content: start;
        flex-wrap: wrap;
        margin: 0;
        min-width: var(--global-min-width);
    } */
</style>
