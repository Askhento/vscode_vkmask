<script>
    export let data = {};
    const { url, descHTML } = data;
</script>

<div class="card">
    <div class="preview"></div>
    <div class="desc">{@html descHTML}</div>
</div>

<style>
    * {
        box-sizing: content-box;
    }
    .card {
        min-width: 10rem;
        width: 10rem;
        display: flex;
        flex-direction: column;
        margin: var(--global-margin);
        border: 2px solid transparent;

        border-radius: var(--global-image-radius);
    }

    .card:hover {
        border: 2px solid var(--vscode-list-focusOutline);
    }
    .preview {
        background-color: var(--button-secondary-foreground);
        border-radius: var(--global-image-radius);
        width: 100%;
        height: 200px;
        cursor: pointer;
    }
    .desc {
        width: 100%;
    }
</style>
