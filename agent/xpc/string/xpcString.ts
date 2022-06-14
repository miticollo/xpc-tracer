import {XpcObject} from "../xpcObject";

export class XpcString extends XpcObject {
    public static readonly xpc_string_get_string_ptr = new NativeFunction(
        Module.getExportByName(null, "xpc_string_get_string_ptr"),
        "pointer", ["pointer"]
    )

    public getRawData(): string {
        const str = XpcString.xpc_string_get_string_ptr(this.pointer).readCString();
        if (str == null)
            throw Error("String at " + this.pointer.toString() + " is null.")
        return str.toString();
    }

    toString(): string {
        return this.getRawData();
    }
}