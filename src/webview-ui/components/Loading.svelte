<script>
    import * as l10n from "@vscode/l10n";
    export let scale = 1;
</script>

<div class="loading-wrapper">
    <vscode-progress-ring style="transform: scale({scale});" />
</div>
<div class="overlay"></div>

<style>
    * {
        margin: var(--global-margin);
    }
    .overlay {
        opacity: 0.5;
        background-color: black;
        position: fixed;
        width: 100vw;
        height: 100vh;
        top: 0;
        left: 0;
        overflow: visible;
        z-index: var(--z-level-waiting);
    }

    .loading-wrapper {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: calc(var(--z-level-waiting) + 1);
    }

    vscode-progress-ring {
        margin: unset;
        height: 100%;
        aspect-ratio: 1/1;
    }
    /* vscode-progress-ring::part(progress) {
        transform: scale(2);
    } */
</style>
