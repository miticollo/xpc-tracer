import { XpcString } from "../string/xpcString.js";
import { XpcInt64 } from "../number/XpcInt64.js";
import { XpcUint64 } from "../number/xpcUint64.js";
import { XpcDouble } from "../number/xpcDouble.js";
import { XpcBool } from "../boolean/xpcBool.js";
import { XpcData } from "../data/xpcData.js";
import {XpcObject} from "../xpcObject.js";
import {XpcNull} from "../null/xpcNull.js";
import {XpcDate} from "../date/xpcDate.js";
import {XpcFd} from "../fd/xpcFd.js";
import {XpcArray} from "../array/xpcArray.js";
import {XpcUnknown} from "../xpcUnknown.js";
import {XpcMachSend} from "../mach/xpcMachSend.js";
import {XpcEndpoint} from "../endpoint/xpcEndpoint.js";

export class XpcDictionary extends XpcObject {
    public static readonly xpc_dictionary_apply = new NativeFunction(
        Module.getExportByName(null, "xpc_dictionary_apply"), "bool", ["pointer", "pointer"]
    )

    public static readonly xpc_dictionary_create = new NativeFunction(
        Module.getExportByName(null, "xpc_dictionary_create"), "pointer", ["pointer", "pointer", "int32"]
    )

    public static readonly xpc_dictionary_set_uint64 = new NativeFunction(
        Module.getExportByName(null, "xpc_dictionary_set_uint64"), "void", ["pointer", "pointer", "uint64"]
    )

    public static readonly xpc_dictionary_set_string = new NativeFunction(
        Module.getExportByName(null, "xpc_dictionary_set_string"), "void", ["pointer", "pointer", "pointer"]
    )

    public static readonly xpc_dictionary_set_fd = new NativeFunction(
        Module.getExportByName(null, "xpc_dictionary_set_fd"), "void", ["pointer", "pointer", "int"]
    )

    public static readonly xpc_dictionary_get_int64 = new NativeFunction(
        Module.getExportByName(null, "xpc_dictionary_get_int64"), "int64", ["pointer"]
    )

    public static readonly xpc_dictionary_set_mach_send = new NativeFunction(
        Module.getExportByName(null, "xpc_dictionary_set_mach_send"), "void", ["pointer", "pointer", "int"]
    )

    public static readonly xpc_dictionary_set_bool = new NativeFunction(
        Module.getExportByName(null, "xpc_dictionary_set_bool"), "void", ["pointer", "pointer", "bool"]
    )

    private static iterate(xpcDictPtr: NativePointer): { [key: string]: XpcObject; } {
        let map: { [key: string]: XpcObject; } = {};

        const handler = new ObjC.Block({
            retType: "bool",
            argTypes: ["pointer", "pointer"],
            implementation: function (key: NativePointer, value: NativePointer): boolean {
                const valueType: string = new ObjC.Object(value).$className;
                if (key.readCString() == null)
                    throw Error("String at " + key.toString() + "is null");
                // @ts-ignore
                const keyStr: string = key.readCString().toString();
                switch (valueType) {
                    case "OS_xpc_string":
                        map[keyStr] = new XpcString(value);
                        break;
                    case "OS_xpc_int64":
                        map[keyStr] = new XpcInt64(value);
                        break;
                    case "OS_xpc_uint64":
                        map[keyStr] = new XpcUint64(value);
                        break;
                    case "OS_xpc_double":
                        map[keyStr] = new XpcDouble(value);
                        break;
                    case "OS_xpc_bool":
                        map[keyStr] = new XpcBool(value);
                        break;
                    case "OS_xpc_null":
                        map[keyStr] = new XpcNull(value);
                        break;
                    case "OS_xpc_date":
                        map[keyStr] = new XpcDate(value);
                        break;
                    case "OS_xpc_fd":
                        map[keyStr] = new XpcFd(value);
                        break;
                    case "OS_xpc_array":
                        map[keyStr] = new XpcArray(value);
                        break;
                    case "OS_xpc_dictionary":
                        map[keyStr] = new XpcDictionary(value);
                        break;
                    case "OS_xpc_data":
                        map[keyStr] = new XpcData(value);
                        break;
                    case "OS_xpc_mach_send":
                        map[keyStr] = new XpcMachSend(value);
                        break;
                    case "OS_xpc_endpoint":
                        map[keyStr] = new XpcEndpoint(value);
                        break;
                    default:
                        map[keyStr] = new XpcUnknown(value);
                        break;
                }
                return true
            }
        })

        XpcDictionary.xpc_dictionary_apply(xpcDictPtr, handler);

        return map;
    }

    public getRawData(): { [key: string]: XpcObject; } {
        return XpcDictionary.iterate(this.pointer);
    }

    public formatDictionary(depth: number): string {
        let str: string = "{\n";
        const map: { [key: string]: XpcObject; } = this.getRawData();
        const indent: string = "\t";
        const length: number = Object.keys(map).length;
        let i: number = 1;
        for (let key in map) {
            let obj: XpcObject = map[key];
            str += `${indent.repeat(depth)}${key}: ${obj.getType()} = `;
            if (key === 'error') str += `${this.printError(map[key] as XpcInt64)}`;
            else {
                if (obj instanceof XpcDictionary) str += obj.formatDictionary(depth + 1);
                else if (obj instanceof XpcData) str += obj.formatData(depth + 1);
                else if (obj instanceof XpcArray) str += obj.formatArray(depth + 1);
                else str += `${map[key].toString()}`;
                if (i++ < length) str += ",";
            }
            str += "\n";
        }
        str += `${indent.repeat(depth - 1)}}`;
        return str;
    }
}
