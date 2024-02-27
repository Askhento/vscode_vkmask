<script>
    import * as l10n from "@vscode/l10n";
</script>

<div class="loading-wrapper">
    <vscode-progress-ring />
    <div class="loading-hint">
        {l10n.t("locale.screens.loading.hint")}
    </div>
</div>

<style>
    * {
        margin: var(--global-margin);
    }
    .loading-wrapper {
        width: 100%;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        display: flex;
    }
</style>
