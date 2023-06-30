<script>
  /*

    todo : need to add file picker
    todo : texture preview

    todo : find bug when use slider and sending update effects from maskConfig


  */
  import { fromZodError } from "zod-validation-error";

  import { logger } from "./logger";
  const print = logger("Inspector.svelte");
  import { createEventDispatcher } from "svelte";
  import { effects, selection } from "./stores.js";
  import { get } from "svelte/store";
  import { vscode } from "./utils/vscode";

  import ObjectControl from "./ui-controls/ObjectControl.svelte";
  import { uiControls, EffectParserForUI } from "./ui-controls/Controls.js";
  import { onMount, tick } from "svelte";

  export let mountLock = true;
  let uiElements; //= EffectParserForUI.parse($effects);
  //   $: uiElements = EffectParserForUI.parse($effects);
  let selectedId;

  print("INIT");
  // mountLock = true;

  $: print("ui elements", uiElements);
  onMount(async () => {
    // print("mounted");
    await tick();
    mountLock = false;
    // print("mount tick");
  });

  $: if ($selection) selectedId = $selection.id;
  else selectedId = undefined;

  $: print("selection changes : ", $selection);
  $: {
    print("parsing ui elements  changes : ", $effects);
    if ($selection && $selection.type !== "unknownEffect") {
      const parseResult = EffectParserForUI.safeParse($effects[$selection.id]); // this seems to help !!!
      if (parseResult.success) {
        uiElements = parseResult.data;
      } else {
        // const prettyError = fromZodError(parseResult.error, { maxIssuesInMessage: 1 });

        onError(parseResult.error);
        // return {
        //     success: false,
        //     message: .message
        // }
      }
    }
  }

  const dispatch = createEventDispatcher();

  async function onChanged(event) {
    console.log("onChange: ", event);
    const { path, value, structural } = event.detail;

    applyValueByPath($effects[selectedId], path, value);

    // send to the app, store does not trigger for some reason
    dispatch("changed");
    //??? rerender inspector ???
    // will need to rerender only if changed inspector structure
    // !!!!!!!!!!!!!!!!!!!!!!!!
    if (!structural) return;
    rerenderInspector();
  }

  async function onError(error) {
    const { name, _errors, ...formated } = error.format();
    print("formated error", formated);

    // let errorPath = ;

    let { path, message } = reduceError(formated, `/effects/${$selection.id}`);

    print("path, message", path, message);
    await tick();
    print("sending error");
    dispatch("errorMessage", {
      message,
      path,
    });
  }

  /**
   * Digs inside Zod error to extract valuable information
   * !!! should be a helper function
   * @param error
   * @param path
   */
  function reduceError(error, path) {
    const { _errors, ...newError } = { ...error };
    if (Object.keys(newError).length === 0) {
      return { path, message: _errors[0] };
    }
    const key = Object.keys(newError)[0];
    return reduceError(newError[key], `${path}/${key}`);
  }

  async function rerenderInspector() {
    // !!! a hack
    const oldSelection = $selection;
    $selection = undefined;
    await tick();
    $selection = oldSelection;
  }

  function applyValueByPath(obj, path, value) {
    // parts = path.split(".");
    // console.log(obj, path, value);
    if (path.length === 0) {
      obj = value;
      return;
    }

    if (path.length === 1) {
      obj[path[0]] = value;
    } else {
      applyValueByPath(obj[path[0]], path.slice(1), value);
    }
  }
</script>

<div class="inspector-wrapper">
  {#if selectedId !== undefined}
    <div class="inspector-name">Inspector Panel</div>
    {#if $selection.type === "effect"}
      <!-- <div>{print("controls from inspector")}</div>
      <div>
        {print($selection)}
      </div> -->
      <ObjectControl
        expanded={true}
        value={$effects[selectedId]}
        label={$effects[selectedId].name}
        path={[]}
        uiElements={uiElements.value}
        on:changed={onChanged}
      />
    {:else if $selection.type === "unknownEffect"}
      <div>unknownEffect</div>
    {/if}
  {:else}
    <div>some error</div>
  {/if}
</div>
