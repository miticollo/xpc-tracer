import {XpcObject} from "../xpcObject";

export class XpcInt64 extends XpcObject{
    public static readonly xpc_int64_get_value = new NativeFunction(
        Module.getExportByName(null, "xpc_int64_get_value"),
        "int64", ["pointer"]
    )

    public getRawData(): Int64 {
        return XpcInt64.xpc_int64_get_value(this.pointer);
    }

    toString(): string {
        return this.getRawData().toString();
    }
}