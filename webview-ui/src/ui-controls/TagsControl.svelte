<script lang="ts">
  export let label = "empty",
    value = "";

  $: tags = value?.split(";");
  //   $: console.log(value);
  function joinTags(e = null) {
    value = tags.join(";");

    // console.log("joined! " + value);
  }

  function addTag() {
    tags.push("");
    tags = tags;
    joinTags();
  }
  function removeTag(index) {
    tags.splice(index, 1);
    tags = tags;
    joinTags();
  }
</script>

<div class="text-control-wrapper">
  {#if label && tags}
    <span class="label">{label}</span>
    <span class="control-wrapper">
      {#each tags as tag, index}
        <vscode-text-field
          size="10"
          value={tags[index]}
          on:change={(e) => {
            tags[index] = e.target.value;
            joinTags();
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
      <vscode-button
        class="tag-btn"
        appearance="icon"
        on:click|stopPropagation={addTag}
      >
        <span class="codicon codicon-add" />
      </vscode-button>
    </span>
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

  /* input.value {
    color: var(--input-foreground);
    background: var(--input-background);
    border-radius: calc(var(--corner-radius) * 1px);
    border: calc(var(--border-width) * 1px) solid var(--dropdown-border);
    font-style: inherit;
    font-variant: inherit;
    font-weight: inherit;
    font-stretch: inherit;
    font-family: inherit;
    font-size: var(--type-ramp-base-font-size);
    line-height: var(--type-ramp-base-line-height);
    padding: calc(var(--design-unit) * 2px + 1px);
    width: 100%;
    flex-grow: 1;
    max-width: 50px;
    resize: none;
  }

  span.label {
    flex-grow: 1;
  } */
</style>
