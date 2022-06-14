import { XpcString } from '../string/xpcString'
import { XpcInt64 } from '../number/XpcInt64'
import { XpcUint64 } from '../number/xpcUint64'
import { XpcDouble } from '../number/xpcDouble'
import { XpcBool } from '../boolean/xpcBool'
import { XpcData } from '../data/xpcData'
import {XpcObject} from "../xpcObject";
import {XpcNull} from "../null/xpcNull";
import {XpcDate} from "../date/xpcDate";
import {XpcFd} from "../fd/xpcFd";
import {XpcDictionary} from "../dictionary/xpcDictionary";
import {XpcUnknown} from "../xpcUnknown";
import {XpcMachSend} from "../mach/xpcMachSend";
import {XpcEndpoint} from "../endpoint/xpcEndpoint";

export class XpcArray extends XpcObject {
    public static readonly xpc_array_apply = new NativeFunction(
        Module.getExportByName(null, "xpc_array_apply"),
        "bool", ["pointer", "pointer"]
    )

    private static iterate(xpcArrayPtr: NativePointer): XpcObject[] {
        let array: XpcObject[] = []
        
        const handler = new ObjC.Block({
            retType: "bool",
            argTypes: ["pointer", "pointer"],
            implementation: function (index: number, value: NativePointer): boolean {
                const valueType = new ObjC.Object(value).$className
                switch (valueType) {
                    case "OS_xpc_string":
                        array.push(new XpcString(value));
                        break;
                    case "OS_xpc_int64":
                        array.push(new XpcInt64(value));
                        break;
                    case "OS_xpc_uint64":
                        array.push(new XpcUint64(value));
                        break;
                    case "OS_xpc_double":
                        array.push(new XpcDouble(value));
                        break;
                    case "OS_xpc_bool":
                        array.push(new XpcBool(value));
                        break;
                    case "OS_xpc_null":
                        array.push(new XpcNull(value));
                        break;
                    case "OS_xpc_date":
                        array.push(new XpcDate(value));
                        break;
                    case "OS_xpc_fd":
                        array.push(new XpcFd(value));
                        break;
                    case "OS_xpc_array":
                        array.push(new XpcArray(value))
                        break
                    case "OS_xpc_dictionary":
                        array.push(new XpcDictionary(value));
                        break;
                    case "OS_xpc_data":
                        array.push(new XpcData(value));
                        break;
                    case "OS_xpc_mach_send":
                        array.push(new XpcMachSend(value));
                        break;
                    case "OS_xpc_endpoint":
                        array.push(new XpcEndpoint(value));
                        break;
                    default:
                        array.push(new XpcUnknown(value));
                        break;
                }
                return true
            }
        })

        XpcArray.xpc_array_apply(xpcArrayPtr, handler)

        return array
    }

    getRawData(): XpcObject[] {
        return XpcArray.iterate(this.pointer);
    }

    public formatArray(depth: number): string {
        let str: string = "[\n"
        const array = this.getRawData()
        const indent: string = "\t"
        array.forEach(function (obj, index) {
            str += `${indent.repeat(depth)}: ${obj.getType()} = `
            if (obj instanceof XpcDictionary) str += obj.formatDictionary(depth + 1)
            else if (obj instanceof  XpcData) str += obj.formatData(depth + 1)
            else if (obj instanceof XpcArray) str += obj.formatArray(depth + 1)
            else str += `${array[index].toString()}`
            if (index < array.length) str += ","
            str += "\n"
        })
        str += `${indent.repeat(depth - 1)}]`
        return str
    }
}