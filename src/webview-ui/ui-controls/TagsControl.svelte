<script lang="js">
    import * as l10n from "@vscode/l10n";

    import { createEventDispatcher, tick } from "svelte";
    import Dropdown from "../components/Dropdown.svelte";
    import { getContext } from "svelte";
    import InfoBox from "../components/InfoBox.svelte";
    //@ts-expect-error
    const { allTags } = getContext("stores");

    // console.log("tags all ", $allTags);

    export let label, value, path, params;
    let infoVisible = false;
    let tags = [];
    let tagElems = [];
    let tagOptions = [];

    $: {
        tagOptions = [...$allTags];
        if (value != null) {
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
                `+ ${l10n.t("locale.controls.tags.buttonAddNewTag.label")}`,
            ],
            ...tagOptions,
        ];
        // console.log("tags", tagOptions);
    }
    const dispatch = createEventDispatcher();
    $: {
        dispatch("changed", [
            {
                value,
                path,
            },
        ]);
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

<span
    class="label"
    title={l10n.t(label)}
    on:mouseleave={() => {
        infoVisible = false;
    }}
    on:mouseover={() => {
        infoVisible = true;
    }}><span>{l10n.t(label)}</span></span
>

<span
    class="control-wrapper"
    on:mouseleave={() => {
        infoVisible = false;
    }}
    on:mouseover={() => {
        infoVisible = true;
    }}
>
    <!-- <vscode-button
            class="add-tag-btn"
            on:click|stopPropagation={() => {
                addTag();
            }}
        >
            <span class="codicon codicon-add" />
            Add new tag
        </vscode-button> -->
    <Dropdown options={tagOptions} name={l10n.t("locale.controls.tags.buttonAdd.label")} icon="" />
    {#each tags as tag, index}
        <div class="tag-value-wrapper">
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
            </vscode-text-field>
            <div class="remove-btn-wrapper">
                <vscode-button
                    class="remove-tag-btn"
                    appearance="icon"
                    on:click|stopPropagation={() => {
                        removeTag(index);
                    }}
                >
                    <span class="codicon codicon-close" />
                </vscode-button>
            </div>
        </div>
    {/each}
    <InfoBox bind:visible={infoVisible} info={params.info} />
</span>

<style>
    * {
        box-sizing: border-box;
    }
    span.label {
        /* box-sizing: border-box; */
        padding: var(--global-margin);
        padding-left: var(--global-body-padding-left);
        padding-right: var(--global-label-control-gap);
        margin: unset;
        height: var(--global-block-height);

        display: flex;
        justify-content: var(--label-justify);
        align-items: var(--label-align);
    }

    span.label > span {
        /* height: fit-content; */

        margin: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .control-wrapper {
        padding: var(--global-margin);
        padding-right: calc(var(--global-body-padding-right) + var(--global-margin));

        margin: unset;
        position: relative;
        display: flex;
        flex-direction: column;
        row-gap: 0.5rem;
    }

    .tag-value-wrapper {
        position: relative;
        display: flex;
        flex-direction: row;
        /* justify-content: stretch; */
        align-items: center;
        margin: unset;
        width: 100%;
    }

    vscode-text-field {
        margin: 0;
        width: 100%;
        height: var(--global-block-height-borded);
    }

    vscode-text-field::part(root) {
        min-width: 0;
        width: 100%;
        height: var(--global-block-height-borded);
    }

    .remove-btn-wrapper {
        position: absolute;
        left: calc(100% + var(--global-margin));
        top: 0;
        height: var(--global-block-height-borded);
        width: var(--global-block-height-borded);
        /* margin: var(--global-margin); */
        /* margin-right: 0; */
        margin: unset;
        margin-left: calc(var(--global-margin) * 0.5);

        padding: 0;
        display: flex;
        align-items: center;
    }
</style>
