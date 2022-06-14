import {XpcObject} from "../xpcObject";

export class XpcDouble extends XpcObject {
    public static readonly xpc_double_get_value = new NativeFunction(
        Module.getExportByName(null, "xpc_double_get_value"),
        "double", ["pointer"]
    )

    public getRawData(): number {
        return XpcDouble.xpc_double_get_value(this.pointer)
    }

    toString(): string {
        return this.getRawData().toString();
    }
}