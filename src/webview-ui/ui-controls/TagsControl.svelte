<script lang="ts">
    import * as l10n from "@vscode/l10n";

    import { createEventDispatcher, tick } from "svelte";
    import Dropdown from "../components/Dropdown.svelte";
    import { getContext } from "svelte";
    import InfoBox from "../components/InfoBox.svelte";
    import TextInput from "../components/TextInput.svelte";
    import { type DataStores } from "../types";

    const { allTags } = getContext("stores") as DataStores;

    // console.log("tags all ", $allTags);

    export let label, value, path, params;
    let infoVisible = false;
    let tags = [];
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
        // console.log("tags", tagOptions, $allTags, tags);
    }
    const dispatch = createEventDispatcher();

    function onChanged() {
        dispatch("changed", [
            {
                value,
                path,
            },
        ]);
    }

    function joinTags() {
        value = tags.join(";");
        onChanged();
    }

    function checkTagExist(tag) {
        return $allTags.has(tag) || tags.findIndex((v) => v === tag) !== -1;
    }

    async function addTag(newTag = "") {
        tags.unshift(newTag);
        tags = tags;

        joinTags();
    }

    function removeTag(index) {
        // console.log("removeing tag", index);
        tags.splice(index, 1);
        // console.log("new tags", tags);
        tags = tags;
        if (tags.length === 0) {
            tags = [];
            value = null;
            onChanged();
            return;
        }

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
    {#key tagOptions}
        <Dropdown
            options={tagOptions}
            disabled={tagOptions.length === 0}
            title={tagOptions.length === 0
                ? l10n.t("locale.controls.tags.dropdown.disabledHint")
                : null}
            name={l10n.t("locale.controls.tags.buttonAdd.label")}
            icon=""
        />
    {/key}
    <TextInput
        onChange={(newTag) => {
            // add or nothing
            if (!newTag || checkTagExist(newTag)) return;
            addTag(newTag);
        }}
    />
    {#each tags as tag, tagIndex}
        <div class="tag-value-wrapper">
            <TextInput
                value={tag}
                onChange={(newTag, e) => {
                    // console.log(
                    //     newTag,
                    //     $allTags.has(newTag),
                    //     tags.findIndex((v) => v === newTag),
                    //     checkTagExist(newTag)
                    // );
                    if (checkTagExist(newTag)) {
                        e.target.value = tag;
                        console.log("hewer");
                        return;
                    }
                    $allTags.delete(tag);
                    $allTags.add(newTag);

                    tags[tagIndex] = newTag;
                    joinTags();
                    tags = tags;
                }}
            ></TextInput>

            <div class="remove-btn-wrapper">
                <vscode-button
                    class="remove-tag-btn"
                    appearance="icon"
                    on:click|stopPropagation={() => {
                        removeTag(tagIndex);
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
        padding-right: calc(var(--global-body-padding-right));

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

    .remove-btn-wrapper {
        position: absolute;
        left: calc(100% + 0.5 * var(--global-margin));
        top: 0;
        height: var(--global-block-height-borded);
        width: var(--global-block-height-borded);
        /* margin: var(--global-margin); */
        /* margin-right: 0; */
        margin: unset;
        /* margin-left: calc(var(--global-margin) * 0.5); */

        padding: 0;
        display: flex;
        align-items: center;
    }
</style>
