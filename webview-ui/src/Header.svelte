<script>
    import AddEffect from "./effects/AddEffect.svelte";
    import AddPlugin from "./AddPlugin.svelte";
    import Settings from "./Settings.svelte";
    import Dropdown from "./components/Dropdown.svelte";
</script>

<div class="header">
    <AddEffect />
    <AddPlugin />
    <Settings />
    <!-- <Dropdown {options} /> -->
</div>

<style>
    div.header {
        display: flex;
        justify-content: start;
    }
</style>
