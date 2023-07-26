<script lang="js">
    import { createEventDispatcher } from "svelte";

    export let label = "empty",
        value,
        path;
    let tagElems = [];
    $: tags = value?.split(";");
    //   $: console.log("tags", value);
    const dispatch = createEventDispatcher();
    $: {
        dispatch("changed", {
            value,
            path,
        });
    }

    function joinTags() {
        // .filter((tag) => tag.length)
        value = tags.join(";");

        console.log("joined! " + value);
    }

    function addTag() {
        tagElems = [];
        // if()
        tags.push("");
        tags = tags;
        joinTags();
    }
    function removeTag(index) {
        tagElems = [];
        // console.log("removeing tag", index);
        tags.splice(index, 1);
        // console.log("new tags", tags);
        tags = tags;
        joinTags();
    }
</script>

<div class="text-control-wrapper">
    {#if label}
        <span class="label">{label}</span>
        {#if tags}
            <span class="control-wrapper">
                {#each tags as tag, index}
                    <vscode-text-field
                        size="10"
                        value={tags[index]}
                        bind:this={tagElems[index]}
                        on:keydown={(e) => {
                            switch (e.key) {
                                case "Backspace":
                                    if (e.target) {
                                        const newValue = e.target.value;

                                        if (newValue === "" && index > 0) {
                                            removeTag(index);
                                        }
                                    }
                                    break;
                                case "Escape":
                                    e.target.value = tag;
                                    e.target.blur();
                                    break;
                                default:
                                    break;
                            }
                        }}
                        on:change={(e) => {
                            if (e.target) {
                                tags[index] = e.target.value;
                                // console.log("changed tag", tags[index]);
                                joinTags();
                            }
                        }}
                    >
                        <section slot="end">
                            <vscode-button
                                class="tag-btn"
                                appearance="icon"
                                on:click|stopPropagation={() => {
                                    removeTag(index);
                                }}
                            >
                                <span class="codicon codicon-remove" />
                            </vscode-button>
                        </section>
                    </vscode-text-field>
                {/each}
                <vscode-button class="tag-btn" appearance="icon" on:click|stopPropagation={addTag}>
                    <span class="codicon codicon-add" />
                </vscode-button>
            </span>
        {:else}
            <span>ADDD a key !!!</span>
        {/if}
    {/if}
</div>

<style>
    * {
        box-sizing: border-box;
    }
    .text-control-wrapper {
        margin: 5px;
        display: flex;
    }

    span.label {
        flex: 1;
    }

    .control-wrapper {
        display: flex;
        flex: 1;
        justify-content: end;
        gap: 5px;
    }
    vscode-text-field {
        margin: unset;
    }

    vscode-text-field > section {
        margin: unset;
    }

    vscode-text-field > section > vscode-button {
        margin: unset;
    }

    .tag-btn {
        /* overflow: auto; */
        display: inline-block;
        /* flex-grow: 1; */
    }
</style>
