<script lang="ts">
    import { SelectionType } from "../../../src/types";
    import { getContext } from "svelte";
    //@ts-expect-error
    const { selection } = getContext("stores");

    export let id, value, onClickVisible, onClickDelete, onSelect;

    // ! here need to check if error on specific effect occurs
    let { name, tag, disabled } = value;

    // console.log(value);
    // import { createEventDispatcher } from "svelte";
    // const dispatch = createEventDispatcher();

    // dispatch("test", "test_payload");
    //  class="effect-name" on:click|stopPropagation={onSelect}
    // on:click|stopPropagation={onVisible}
    // console.log("effect INIT", value, id);

    function checkSelected() {
        return $selection.id === id && $selection.type === SelectionType.effect;
    }
</script>

<vscode-option
    class="effect-name"
    selected={checkSelected()}
    on:click={() => {
        if (checkSelected()) {
            $selection = { type: SelectionType.empty };
        } else {
            $selection = { type: SelectionType.effect, id };
        }
        onSelect();
    }}
    ><span class="effect-name-text">{name ?? "unknown-effect"}</span>
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
            on:click|stopPropagation={() => {
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

    vscode-option.effect-name:hover:not(.selected) {
        background-color: var(--vscode-list-hoverBackground);
        border-color: transparent;
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

    vscode-option::part(content) {
        /* justify-content: center; */
        left: var(--global-body-padding-left);
        align-content: center;
        display: flex;
        flex-wrap: wrap;

        height: 100%;
    }

    .effect-name-text {
        display: inline-block;
        padding-left: var(--global-body-padding-left);
    }

    .effect-tag {
        color: var(--vscode-descriptionForeground);

        text-align: center;
        text-justify: center;
        justify-content: center;
        display: inline-block;
    }
    .effect-btn {
        display: inline-block;
    }
</style>
