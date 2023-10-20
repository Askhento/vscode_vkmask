<script lang="ts">
    import * as l10n from "@vscode/l10n";

    import { createEventDispatcher } from "svelte";

    export let label, value, path;

    console.log("composite values ", value);

    const dispatch = createEventDispatcher();

    function sendValue() {
        console.log("should send value");
        // dispatch("changed", {
        //     value,
        //     path,
        // });
    }
</script>

<div>label</div>
<div>label</div>
