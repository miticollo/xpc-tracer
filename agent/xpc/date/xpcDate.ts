import {XpcObject} from "../xpcObject.js";

export class XpcDate extends XpcObject {
    public static readonly xpc_date_get_value = new NativeFunction(
        Module.getExportByName(null, "xpc_date_get_value"), "int64", ["pointer"]
    )

    getRawData(): Int64 {
        return XpcDate.xpc_date_get_value(this.pointer);
    }

    toString(): string {
        return String(this.getRawData());
    }
}