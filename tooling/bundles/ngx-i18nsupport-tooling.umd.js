(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core')) :
    typeof define === 'function' && define.amd ? define('@ngx-i18nsupport/tooling', ['exports', '@angular/core'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global['ngx-i18nsupport'] = global['ngx-i18nsupport'] || {}, global['ngx-i18nsupport'].tooling = {}), global.ng.core));
}(this, (function (exports, i0) { 'use strict';

    var ToolingModule = /** @class */ (function () {
        function ToolingModule() {
        }
        return ToolingModule;
    }());
    /** @nocollapse */ ToolingModule.ɵmod = i0.ɵɵdefineNgModule({ type: ToolingModule });
    /** @nocollapse */ ToolingModule.ɵinj = i0.ɵɵdefineInjector({ factory: function ToolingModule_Factory(t) { return new (t || ToolingModule)(); }, imports: [[]] });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(ToolingModule, [{
                type: i0.NgModule,
                args: [{
                        imports: [],
                        declarations: [],
                        exports: []
                    }]
            }], null, null);
    })();

    /*
     * Public API Surface of tooling
     */

    /**
     * Generated bundle index. Do not edit.
     */

    exports.ToolingModule = ToolingModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ngx-i18nsupport-tooling.umd.js.map
