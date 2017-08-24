var mainTreeViewController = function($scope, $element, $timeout, columnsService, treeService, mainTreeService, mainTreeElementService, nodeSelectionService, treeColumnService, hotkeyService, contextMenuService, hotkeyFactory, contextMenuFactory) {
    // link view to scope
    let data = $scope.$parent.tab.data;
    data.scope = $scope;

    // helper variables
    let hotkeys = hotkeyFactory.mainTreeHotkeys();
    $scope.allColumns = columnsService.columns;

    // inherited functions
    treeService.buildFunctions($scope, $element);
    mainTreeService.buildFunctions($scope);
    mainTreeElementService.buildFunctions($scope);
    nodeSelectionService.buildFunctions($scope);
    treeColumnService.buildFunctions($scope, '.main-tree-view', true);
    hotkeyService.buildOnKeyDown($scope, 'onTreeKeyDown', hotkeys);

    // scope functions
    $scope.toggleRefactorModal = function(visible, mode) {
        $scope.showRefactorModal = visible;
        $scope.refactorMode = mode;
    };

    $scope.open = function(node) {
        if (node.element_type !== xelib.etMainRecord) return;
        if (data.linkedScope) {
            // get a new handle for the record to be used with the record view
            data.linkedScope.record = xelib.GetElement(node.handle);
        }
    };

    $scope.onNodeDoubleClick = function(e, node) {
        if (e.srcElement && e.srcElement.classList.contains('expand-node')) return;
        if (node.can_expand) $scope.toggleNode(null, node);
        $scope.open(node);
    };

    $scope.showNodeContextMenu = function(e, node) {
        let offset = { top: e.clientY, left: e.clientX},
            items = contextMenuFactory.mainTreeItems,
            menuItems = contextMenuService.buildNodeMenuItems(node, $scope, items);
        $timeout(() => $scope.$emit('openContextMenu', offset, menuItems));
    };

    $scope.handleEnter = function(e) {
        $scope.open($scope.lastSelectedNode());
        e.stopImmediatePropagation();
    };

    $scope.handleDelete = function(e) {
        $scope.selectedNodes.forEach((node) => $scope.deleteElement(node));
        e.stopImmediatePropagation();
    };

    // event handling
    $scope.$on('elementUpdated', (e, element) => {
        let node = $scope.getNodeForElement(element);
        node ? $scope.rebuildNode(node) : $scope.setParentsModified(element);
    });
    $scope.$on('nodeUpdated', (e, node) => $scope.rebuildNode(node));

    // initialization
    $scope.sort = { column: 'FormID', reverse: false };
    $scope.buildColumns();
    $scope.buildTree();
    $timeout($scope.resolveElements, 100);
};