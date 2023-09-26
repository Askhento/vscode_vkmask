<script lang="js">
    import { createEventDispatcher, tick } from "svelte";
    import Dropdown from "../components/Dropdown.svelte";
    import { getContext } from "svelte";
    //@ts-expect-error
    const { allTags } = getContext("stores");

    // console.log("tags all ", $allTags);

    export let label = "empty",
        value,
        path;

    let tags = [];
    let tagElems = [];
    let tagOptions = [];

    $: {
        tagOptions = [...$allTags];
        if (value) {
            tags = value.split(";");
        }

        if (tags && tags.length) {
            tagOptions = tagOptions.filter((tag) => tags.indexOf(tag) < 0);
        }
        tagOptions = tagOptions.map((tag) => [
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
        // console.log("tags should rerender!!!! ", tags);

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

<span class="label"><span>{label}</span></span>

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

<style>
    * {
        margin: var(--global-margin);

        padding: 0;
        box-sizing: border-box;
    }

    span.label {
        justify-self: var(--label-justify);
        height: var(--global-block-height);
        display: flex;
        justify-content: center;
    }

    .control-wrapper {
        display: flex;
        flex-direction: column;
        row-gap: 0.5rem;
    }

    vscode-text-field {
        margin: 0;
        position: relative;
        height: var(--global-block-height);
    }

    /* vscode-text-field > section {
        margin: unset;
    }

    vscode-text-field > section > vscode-button {
        margin: unset;
    } */

    .add-tag-btn {
        /* display: inline-block; */
        /* text-align: center; */
        vertical-align: middle;
    }

    .remove-tag-btn {
        position: absolute;
        left: calc(100% + 0.25rem);
        top: calc();
        height: 100%;
        margin: 0;
        padding: 0;
        /* overflow: auto; */
        /* display: inline-block; */
        /* flex-grow: 1; */
    }
</style>
