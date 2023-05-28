import {XpcObject} from "../xpcObject.js";

export class XpcBool extends XpcObject {
    public static readonly xpc_bool_get_value = new NativeFunction(
        Module.getExportByName(null, "xpc_bool_get_value"), "bool", ["pointer"]
    )

    public getRawData(): boolean {
        return XpcBool.xpc_bool_get_value(this.pointer) == 1;
    }

    toString(): string {
        return String(this.getRawData())
    }
}