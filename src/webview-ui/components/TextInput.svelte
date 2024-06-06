<script lang="ts">
    export let value = "",
        onChange,
        disabled = false;
</script>

<vscode-text-field
    {value}
    {disabled}
    on:keydown={(e) => {
        if (!e.target) return;
        switch (e.key) {
            case "Escape":
                e.target.value = value;
                e.target.blur();
                break;
            case "Enter":
                e.target.blur();
                break;
            default:
                break;
        }
    }}
    on:change={(e) => {
        if (!e.target) return;
        value = e.target.value;
        onChange?.(value, e);
    }}
>
</vscode-text-field>
