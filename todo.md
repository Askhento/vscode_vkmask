-   fix number slider object Object
-   clean impl comp groups
-   check liquify points indent level
-   xstate
-   fix generate buildins & abs path as a wildcard???
-   test.mask texture animation workflow test
-   vector control noticed bug of mirroring values for offset and rotation patch
    this is due to uiDescription defValue same instance array
    this issue was fixed in arraycontrol default element, seems like need to deepcopy some parameters
-   make scrollbars similar to native
-   split ztypes at least to front and backend to improve readability and faster coompile time
-   set iconcontrol errors in ztypes
-   option control seems to react on alt
-   TypeError: component.path is not iterable for material model3d, seems like applyDeps
    vector transform seems to trigger twice and path is undefined
-   vectorControl not complete applyDeps
-   add data source for project manager just in case :D
-   deal with light source type legacy thing
-   add vector control drag multiple values or change quicklly
-   clone default material to have a base to work from
-   for model3d set values so that is fits to screen
    especially true if anchor is free, then model spawns out of frustum
-   find a way to trigger deps without key block in parameters app
-   asset group scrroll into view
-   find a way to profile bottleneck spots when loading extension
-   tags does not remove key if last oone removed
-   add occluder effect
-   seems like ColorFilter folder is separate from textures, so need default colorfilters
