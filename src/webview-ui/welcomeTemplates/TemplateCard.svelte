<script>
    export let data = {},
        onSelect;
    const { url, descHTML, preview } = data;
</script>

<div class="card">
    <div
        class="preview"
        on:click={() => {
            onSelect(url);
        }}
    >
        <img src={"data:image/jpg;base64," + preview} class="file-preview" />
    </div>
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
        padding: var(--global-margin);
    }

    .card:hover {
        border: 2px solid var(--vscode-list-focusOutline);
    }
    .preview {
        background-color: var(--button-secondary-foreground);
        width: 100%;
        height: 280px;
        cursor: pointer;
        border-radius: var(--global-image-radius);
        overflow: hidden;
    }

    .file-preview {
        width: 100%;
    }
    .desc {
        width: 100%;
    }
</style>
