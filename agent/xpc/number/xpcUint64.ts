import {XpcObject} from "../xpcObject";

export class XpcUint64 extends XpcObject {
    public static readonly xpc_uint64_get_value = new NativeFunction(
        Module.getExportByName(null, "xpc_uint64_get_value"),
        "uint64", ["pointer"]
    )

    public getRawData(): UInt64 {
        return XpcUint64.xpc_uint64_get_value(this.pointer)
    }

    toString(): string {
        return this.getRawData().toString();
    }
}