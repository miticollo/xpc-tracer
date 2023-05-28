import { XpcString } from "./xpc/string/xpcString.js"
import { XpcInt64 } from "./xpc/number/XpcInt64.js"
import { XpcUint64 } from "./xpc/number/xpcUint64.js"
import { XpcDouble } from "./xpc/number/xpcDouble.js"
import { XpcBool } from "./xpc/boolean/xpcBool.js"
import { XpcDictionary } from "./xpc/dictionary/xpcDictionary.js"
import { XpcData } from "./xpc/data/xpcData.js"
import {XpcNull} from "./xpc/null/xpcNull.js";
import {XpcDate} from "./xpc/date/xpcDate.js";
import {XpcFd} from "./xpc/fd/xpcFd.js";
import {XpcArray} from "./xpc/array/xpcArray.js";
import {XpcUnknown} from "./xpc/xpcUnknown.js";
import {XpcMachSend} from "./xpc/mach/xpcMachSend.js";
import {XpcEndpoint} from "./xpc/endpoint/xpcEndpoint.js";

const xpc_connection_get_name = new NativeFunction(
    Module.getExportByName(null, "xpc_connection_get_name"), "pointer", ["pointer"]
)

const xpc_pipe_routine = new NativeFunction(
    Module.getExportByName(null, "xpc_pipe_routine"), "int", ["pointer", "pointer", "pointer"]
)

const xpc_pipe_create_from_port = new NativeFunction(
    Module.getExportByName(null, "xpc_pipe_create_from_port"), "pointer", ["int", "int"]
);

function hook(functionName: string): void {
    let address: NativePointer = Module.getExportByName(null, functionName);
    Interceptor.attach(address, {
        onEnter(args): void {
            let functionWithActualParams: string = `${ functionName }(\n`;
            functionWithActualParams += `\tconnection = {\n`;
            let serviceName: NativePointer = xpc_connection_get_name(args[0]);
            if (!args[0].isNull()) {
                functionWithActualParams += `\t\t${ serviceName.readCString() } = `;

                let dict: NativePointer = XpcDictionary.xpc_dictionary_create(NULL, NULL, 0);
                let bootstrap_port: number = Module.getExportByName(null, "bootstrap_port").readUInt();
                XpcDictionary.xpc_dictionary_set_uint64(dict, Memory.allocUtf8String("subsystem"), 3);
                XpcDictionary.xpc_dictionary_set_uint64(dict, Memory.allocUtf8String("handle"), 0);
                // XpcDictionary.xpc_dictionary_set_uint64(dict, Memory.allocUtf8String("routine"), 0x324); // ROUTINE_LOOKUP
                XpcDictionary.xpc_dictionary_set_uint64(dict, Memory.allocUtf8String("routine"), 0x32f); // ROUTINE_LIST
                XpcDictionary.xpc_dictionary_set_string(dict, Memory.allocUtf8String("name"), serviceName);
                XpcDictionary.xpc_dictionary_set_uint64(dict, Memory.allocUtf8String("type"), 7);
                XpcDictionary.xpc_dictionary_set_mach_send(dict, Memory.allocUtf8String("domain-port"), bootstrap_port);
                XpcDictionary.xpc_dictionary_set_bool(dict, Memory.allocUtf8String("legacy"), 1);
                let outDir: NativePointer = Memory.alloc(Process.pointerSize);
                xpc_pipe_routine(xpc_pipe_create_from_port(bootstrap_port, 4), dict, outDir);
                functionWithActualParams += `${new XpcDictionary(outDir.readPointer()).formatDictionary(3)}`;

                functionWithActualParams += "\n";
                functionWithActualParams += `\t},\n`;
                let message = new ObjC.Object(args[1]);
                functionWithActualParams += `\tmessage: ${ message.$className } = `;
                switch (message.$className) {
                    case "OS_xpc_string":
                        functionWithActualParams += new XpcString(args[1]).toString();
                        break;
                    case "OS_xpc_int64":
                        functionWithActualParams += new XpcInt64(args[1]).toString();
                        break;
                    case "OS_xpc_uint64":
                        functionWithActualParams += new XpcUint64(args[1]).toString();
                        break
                    case "OS_xpc_double":
                        functionWithActualParams += new XpcDouble(args[1]).toString();
                        break;
                    case "OS_xpc_bool":
                        functionWithActualParams += new XpcBool(args[1]).toString();
                        break;
                    case "OS_xpc_null":
                        functionWithActualParams += new XpcNull(args[1]).toString();
                        break;
                    case "OS_xpc_date":
                        functionWithActualParams += new XpcDate(args[1]).toString();
                        break;
                    case "OS_xpc_fd":
                        functionWithActualParams += new XpcFd(args[1]).toString();
                        break;
                    case "OS_xpc_array":
                        functionWithActualParams += new XpcArray(args[1]).formatArray(2);
                        break;
                    case "OS_xpc_dictionary":
                        functionWithActualParams += new XpcDictionary(args[1]).formatDictionary(2);
                        break;
                    case "OS_xpc_data":
                        functionWithActualParams += new XpcData(args[1]).formatData(2);
                        break;
                    case "OS_xpc_mach_send":
                        functionWithActualParams += new XpcMachSend(args[1]).toString();
                        break;
                    case "OS_xpc_endpoint":
                        functionWithActualParams += new XpcEndpoint(args[1]).toString();
                        break;
                    default:
                        functionWithActualParams += new XpcUnknown(args[1]).toString();
                        break;
                }
                functionWithActualParams += "\n);"
                console.log(functionWithActualParams)
            }
        }
    })
}

hook("xpc_connection_send_message")
hook("xpc_connection_send_message_with_reply")
hook("xpc_connection_send_message_with_reply_sync")