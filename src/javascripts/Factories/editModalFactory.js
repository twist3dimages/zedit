ngapp.service('editModalFactory', function() {
    this.renameFile = function(node, scope) {
        scope.$emit('openModal', 'edit', {
            title: 'Rename File',
            editType: 'string',
            maxLength: 64,
            initialValue: xelib.Name(node.handle),
            isValid: (value) => { return value.length > 0; },
            callback: (newValue) => {
                xelib.RenameFile(node.handle, newValue);
                scope.$root.$broadcast('nodeUpdated', node);
            }
        });
    };

    this.changeFileAuthor = function(node, scope) {
        scope.$emit('openModal', 'edit', {
            title: 'Change File Author',
            editType: 'string',
            maxLength: 255,
            initialValue: xelib.GetFileAuthor(node.handle),
            isValid: () => { return true },
            callback: (newValue) => {
                xelib.SetFileAuthor(node.handle, newValue);
                scope.$root.$broadcast('nodeUpdated', node);
            }
        });
    };

    this.changeFileDescription = function(node, scope) {
        scope.$emit('openModal', 'edit', {
            title: 'Change File Description',
            editType: 'text',
            maxLength: 255,
            initialValue: xelib.GetFileDescription(node.handle),
            isValid: () => { return true },
            callback: (newValue) => {
                xelib.SetFileDescription(node.handle, newValue);
                scope.$root.$broadcast('nodeUpdated', node);
            }
        });
    };

    this.addFile = function(scope, callback) {
        scope.$emit('openModal', 'edit', {
            title: 'Add File',
            editType: 'string',
            maxLength: 64,
            initialValue: 'New File.esp',
            isValid: (value) => { return !xelib.HasElement(0, value) },
            callback: callback || ((fileName) => {
                xelib.Release(xelib.AddFile(fileName));
                scope.$root.$broadcast('reloadGUI');
            })
        });
    };
});
