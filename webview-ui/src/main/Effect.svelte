<script lang="ts">
    import { getContext } from "svelte";

    export let id,
        value,
        // @ts-expect-error
        selected = getContext("selection").selection.id === id,
        onClickVisible,
        onClickDelete,
        onSelect;

    let { name, tag, disabled } = value;

    // console.log(value);
    // import { createEventDispatcher } from "svelte";
    // const dispatch = createEventDispatcher();

    // dispatch("test", "test_payload");
    //  class="effect-name" on:click|stopPropagation={onSelect}
    // on:click|stopPropagation={onVisible}
    // console.log("effect INIT", value, id);
</script>

<vscode-option
    class="effect-name"
    {selected}
    on:click={() => {
        selected = !selected;
        // if (selected)
        onSelect(id, selected);
    }}
    >{name ?? "unknown-effect"}
    <span class="effect-btn-wrapper">
        {#if tag}
            <span class="effect-tag">
                {tag
                    .split(";")
                    .filter((t) => t.length)
                    .join(" or ")}
            </span>
        {/if}
        <vscode-button
            class="effect-btn"
            appearance="icon"
            on:click={() => {
                // console.log("click", id);
                disabled = !disabled;
                onClickVisible(id, disabled);
            }}
        >
            <span class="codicon {disabled ? 'codicon-eye-closed' : 'codicon-eye'}" />
        </vscode-button>
        <vscode-button
            class="effect-btn"
            appearance="icon"
            on:click={() => {
                onClickDelete(id);
            }}
        >
            <span class="codicon codicon-trash" />
        </vscode-button>
    </span>
</vscode-option>

<style>
    * {
        box-sizing: border-box;
    }

    vscode-option.effect-name {
        /* display: inline-block; */
        display: block;
        position: relative;

        width: 100%;
        height: 25px;
    }

    vscode-option.effect-name:hover {
        background-color: var(--vscode-button-hoverBackground);
    }

    .effect-btn-wrapper {
        position: absolute;
        right: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        row-gap: 5px;
        column-gap: 5px;
        justify-content: flex-end;
        /* align-content: center; */
        align-items: center; /* ailgned text !!! */
    }
    .effect-tag {
        color: var(--vscode-textCodeBlock-background);
        text-align: center;
        text-justify: center;
        justify-content: center;
        display: inline-block;
    }
    .effect-btn {
        display: inline-block;
    }
</style>
