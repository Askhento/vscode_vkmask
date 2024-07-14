<script>
    import * as l10n from "@vscode/l10n";

    import { createEventDispatcher } from "svelte";
    import InfoBox from "../components/InfoBox.svelte";

    export let label, path, params, value;
    let infoVisible = false;

    function toggle(e) {
        // console.log();
        value = !value; //e.target.checked;
        onChanged();
    }

    const dispatch = createEventDispatcher();
    export function onChanged() {
        dispatch("changed", [
            {
                value,
                path,
            },
        ]);
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
    <vscode-checkbox role="checkbox" checked={value} on:click={toggle} tabindex="1" />
    <InfoBox bind:visible={infoVisible} info={params.info} />
</span>

<!-- <label class="switch">
    <input type="checkbox" bind:checked={value} />
    <span class="slider round" />
  </label> -->

<style>
    * {
        margin: unset;
        padding: 0;
        box-sizing: border-box;
    }

    vscode-checkbox {
        height: var(--global-block-height);
        margin-left: var(--global-margin);
    }

    /* div.label {
        justify-self: var(--label-justify);
    } */

    span.control-wrapper {
        padding-right: var(--global-body-padding-right);
        padding-bottom: var(--global-margin);
        padding-top: var(--global-margin);
        height: var(--global-block-height);
        margin: unset;
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    span.label {
        padding: var(--global-margin);
        padding-left: var(--global-body-padding-left);
        padding-right: var(--global-label-control-gap);
        margin: unset;

        height: var(--global-block-height);
        display: flex;
        justify-content: var(--label-justify);
        align-items: var(--label-align);
        align-content: center;
        align-items: center;
    }

    span.label > span {
        height: fit-content;

        margin: unset;
        height: fit-content;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
</style>
