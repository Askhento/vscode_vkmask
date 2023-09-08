<script lang="js">
    import { createEventDispatcher, tick } from "svelte";
    import Dropdown from "../components/Dropdown.svelte";
    import { getContext } from "svelte";
    //@ts-expect-error
    const { allTags } = getContext("stores");

    console.log("tags all ", $allTags);

    export let label = "empty",
        value,
        path;

    let tags = [];
    let tagElems = [];
    let tagOptions = [];

    $: {
        tags = value?.split(";");

        tagOptions = [...$allTags]
            .filter((tag) => tags.indexOf(tag) < 0)
            .map((tag) => [
                () => {
                    addTag(tag);
                },
                tag,
            ]);
        tagOptions = [
            [
                () => {
                    addTag();
                },
                "+ Add new tag",
            ],
            ...tagOptions,
        ];
        // console.log("tags", tagOptions);
    }
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

        // console.log("joined! " + value);
    }

    async function addTag(newTag = "") {
        tagElems = [];
        // if()
        tags.push(newTag);
        tags = tags;
        console.log("tags should rerender!!!! ", tags);

        // //#impr focus on new
        // await tick();
        // tagElems.at(-1).focus();
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

<span class="label">{label}</span>

{#if tags}
    <span class="control-wrapper">
        <!-- <vscode-button
            class="add-tag-btn"
            on:click|stopPropagation={() => {
                addTag();
            }}
        >
            <span class="codicon codicon-add" />
            Add new tag
        </vscode-button> -->
        <Dropdown options={tagOptions} name={"Add tag"} icon="add" />
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
                        case "Enter":
                            e.target.blur();
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
                <vscode-button
                    class="remove-tag-btn"
                    appearance="icon"
                    on:click|stopPropagation={() => {
                        removeTag(index);
                    }}
                >
                    <span class="codicon codicon-close" />
                </vscode-button>
            </vscode-text-field>
        {/each}
    </span>
{/if}

<style>
    * {
        /* margin: var(--global-margin); */
        margin: calc(var(--global-margin) * 1px);

        box-sizing: border-box;
    }

    span.label {
        justify-self: var(--label-justify);
    }

    .control-wrapper {
        display: flex;
        flex-direction: column;
        row-gap: 0.25rem;
    }
    vscode-text-field {
        margin: unset;
        position: relative;
        height: var(--global-block-height);
    }

    vscode-text-field > section {
        margin: unset;
    }

    vscode-text-field > section > vscode-button {
        margin: unset;
    }

    .add-tag-btn {
        /* display: inline-block; */
        /* text-align: center; */
        vertical-align: middle;
    }

    .remove-tag-btn {
        position: absolute;
        left: calc(100% + 0.25rem);
        top: 0;
        height: 100%;
        /* overflow: auto; */
        /* display: inline-block; */
        /* flex-grow: 1; */
    }
</style>
