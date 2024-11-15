"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contract4 = void 0;
exports.storeStateInit = storeStateInit;
exports.loadStateInit = loadStateInit;
exports.storeContext = storeContext;
exports.loadContext = loadContext;
exports.storeSendParameters = storeSendParameters;
exports.loadSendParameters = loadSendParameters;
exports.storeDeploy = storeDeploy;
exports.loadDeploy = loadDeploy;
exports.storeDeployOk = storeDeployOk;
exports.loadDeployOk = loadDeployOk;
exports.storeFactoryDeploy = storeFactoryDeploy;
exports.loadFactoryDeploy = loadFactoryDeploy;
exports.storeWithdraw = storeWithdraw;
exports.loadWithdraw = loadWithdraw;
var core_1 = require("@ton/core");
function storeStateInit(src) {
    return function (builder) {
        var b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}
function loadStateInit(slice) {
    var sc_0 = slice;
    var _code = sc_0.loadRef();
    var _data = sc_0.loadRef();
    return { $$type: 'StateInit', code: _code, data: _data };
}
function loadTupleStateInit(source) {
    var _code = source.readCell();
    var _data = source.readCell();
    return { $$type: 'StateInit', code: _code, data: _data };
}
function storeTupleStateInit(source) {
    var builder = new core_1.TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}
function dictValueParserStateInit() {
    return {
        serialize: function (src, builder) {
            builder.storeRef((0, core_1.beginCell)().store(storeStateInit(src)).endCell());
        },
        parse: function (src) {
            return loadStateInit(src.loadRef().beginParse());
        }
    };
}
function storeContext(src) {
    return function (builder) {
        var b_0 = builder;
        b_0.storeBit(src.bounced);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw);
    };
}
function loadContext(slice) {
    var sc_0 = slice;
    var _bounced = sc_0.loadBit();
    var _sender = sc_0.loadAddress();
    var _value = sc_0.loadIntBig(257);
    var _raw = sc_0.loadRef();
    return { $$type: 'Context', bounced: _bounced, sender: _sender, value: _value, raw: _raw };
}
function loadTupleContext(source) {
    var _bounced = source.readBoolean();
    var _sender = source.readAddress();
    var _value = source.readBigNumber();
    var _raw = source.readCell();
    return { $$type: 'Context', bounced: _bounced, sender: _sender, value: _value, raw: _raw };
}
function storeTupleContext(source) {
    var builder = new core_1.TupleBuilder();
    builder.writeBoolean(source.bounced);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw);
    return builder.build();
}
function dictValueParserContext() {
    return {
        serialize: function (src, builder) {
            builder.storeRef((0, core_1.beginCell)().store(storeContext(src)).endCell());
        },
        parse: function (src) {
            return loadContext(src.loadRef().beginParse());
        }
    };
}
function storeSendParameters(src) {
    return function (builder) {
        var b_0 = builder;
        b_0.storeBit(src.bounce);
        b_0.storeAddress(src.to);
        b_0.storeInt(src.value, 257);
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) {
            b_0.storeBit(true).storeRef(src.body);
        }
        else {
            b_0.storeBit(false);
        }
        if (src.code !== null && src.code !== undefined) {
            b_0.storeBit(true).storeRef(src.code);
        }
        else {
            b_0.storeBit(false);
        }
        if (src.data !== null && src.data !== undefined) {
            b_0.storeBit(true).storeRef(src.data);
        }
        else {
            b_0.storeBit(false);
        }
    };
}
function loadSendParameters(slice) {
    var sc_0 = slice;
    var _bounce = sc_0.loadBit();
    var _to = sc_0.loadAddress();
    var _value = sc_0.loadIntBig(257);
    var _mode = sc_0.loadIntBig(257);
    var _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    var _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    var _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    return { $$type: 'SendParameters', bounce: _bounce, to: _to, value: _value, mode: _mode, body: _body, code: _code, data: _data };
}
function loadTupleSendParameters(source) {
    var _bounce = source.readBoolean();
    var _to = source.readAddress();
    var _value = source.readBigNumber();
    var _mode = source.readBigNumber();
    var _body = source.readCellOpt();
    var _code = source.readCellOpt();
    var _data = source.readCellOpt();
    return { $$type: 'SendParameters', bounce: _bounce, to: _to, value: _value, mode: _mode, body: _body, code: _code, data: _data };
}
function storeTupleSendParameters(source) {
    var builder = new core_1.TupleBuilder();
    builder.writeBoolean(source.bounce);
    builder.writeAddress(source.to);
    builder.writeNumber(source.value);
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}
function dictValueParserSendParameters() {
    return {
        serialize: function (src, builder) {
            builder.storeRef((0, core_1.beginCell)().store(storeSendParameters(src)).endCell());
        },
        parse: function (src) {
            return loadSendParameters(src.loadRef().beginParse());
        }
    };
}
function storeDeploy(src) {
    return function (builder) {
        var b_0 = builder;
        b_0.storeUint(2490013878, 32);
        b_0.storeUint(src.queryId, 64);
    };
}
function loadDeploy(slice) {
    var sc_0 = slice;
    if (sc_0.loadUint(32) !== 2490013878) {
        throw Error('Invalid prefix');
    }
    var _queryId = sc_0.loadUintBig(64);
    return { $$type: 'Deploy', queryId: _queryId };
}
function loadTupleDeploy(source) {
    var _queryId = source.readBigNumber();
    return { $$type: 'Deploy', queryId: _queryId };
}
function storeTupleDeploy(source) {
    var builder = new core_1.TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}
function dictValueParserDeploy() {
    return {
        serialize: function (src, builder) {
            builder.storeRef((0, core_1.beginCell)().store(storeDeploy(src)).endCell());
        },
        parse: function (src) {
            return loadDeploy(src.loadRef().beginParse());
        }
    };
}
function storeDeployOk(src) {
    return function (builder) {
        var b_0 = builder;
        b_0.storeUint(2952335191, 32);
        b_0.storeUint(src.queryId, 64);
    };
}
function loadDeployOk(slice) {
    var sc_0 = slice;
    if (sc_0.loadUint(32) !== 2952335191) {
        throw Error('Invalid prefix');
    }
    var _queryId = sc_0.loadUintBig(64);
    return { $$type: 'DeployOk', queryId: _queryId };
}
function loadTupleDeployOk(source) {
    var _queryId = source.readBigNumber();
    return { $$type: 'DeployOk', queryId: _queryId };
}
function storeTupleDeployOk(source) {
    var builder = new core_1.TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}
function dictValueParserDeployOk() {
    return {
        serialize: function (src, builder) {
            builder.storeRef((0, core_1.beginCell)().store(storeDeployOk(src)).endCell());
        },
        parse: function (src) {
            return loadDeployOk(src.loadRef().beginParse());
        }
    };
}
function storeFactoryDeploy(src) {
    return function (builder) {
        var b_0 = builder;
        b_0.storeUint(1829761339, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.cashback);
    };
}
function loadFactoryDeploy(slice) {
    var sc_0 = slice;
    if (sc_0.loadUint(32) !== 1829761339) {
        throw Error('Invalid prefix');
    }
    var _queryId = sc_0.loadUintBig(64);
    var _cashback = sc_0.loadAddress();
    return { $$type: 'FactoryDeploy', queryId: _queryId, cashback: _cashback };
}
function loadTupleFactoryDeploy(source) {
    var _queryId = source.readBigNumber();
    var _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy', queryId: _queryId, cashback: _cashback };
}
function storeTupleFactoryDeploy(source) {
    var builder = new core_1.TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.cashback);
    return builder.build();
}
function dictValueParserFactoryDeploy() {
    return {
        serialize: function (src, builder) {
            builder.storeRef((0, core_1.beginCell)().store(storeFactoryDeploy(src)).endCell());
        },
        parse: function (src) {
            return loadFactoryDeploy(src.loadRef().beginParse());
        }
    };
}
function storeWithdraw(src) {
    return function (builder) {
        var b_0 = builder;
        b_0.storeUint(195467089, 32);
        b_0.storeCoins(src.amount);
    };
}
function loadWithdraw(slice) {
    var sc_0 = slice;
    if (sc_0.loadUint(32) !== 195467089) {
        throw Error('Invalid prefix');
    }
    var _amount = sc_0.loadCoins();
    return { $$type: 'Withdraw', amount: _amount };
}
function loadTupleWithdraw(source) {
    var _amount = source.readBigNumber();
    return { $$type: 'Withdraw', amount: _amount };
}
function storeTupleWithdraw(source) {
    var builder = new core_1.TupleBuilder();
    builder.writeNumber(source.amount);
    return builder.build();
}
function dictValueParserWithdraw() {
    return {
        serialize: function (src, builder) {
            builder.storeRef((0, core_1.beginCell)().store(storeWithdraw(src)).endCell());
        },
        parse: function (src) {
            return loadWithdraw(src.loadRef().beginParse());
        }
    };
}
function initContract4_init_args(_src) {
    return function (builder) {
        var b_0 = builder;
    };
}
function Contract4_init() {
    return __awaiter(this, void 0, void 0, function () {
        var __code, __system, builder, __data;
        return __generator(this, function (_a) {
            __code = core_1.Cell.fromBase64('te6ccgECGgEABQ0AART/APSkE/S88sgLAQIBYgIDAtTQAdDTAwFxsKMB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiFRQUwNvBPhhAvhi2zxa2zzy4ILI+EMBzH8BygBZWSDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFso/ye1UFwQCAVgODwL27aLt+wGSMH/gcCHXScIflTAg1wsf3iDAACLXScEhsI5OW40FmVtcHR5IG1lc3NhZ2UgcmVjZWl2ZWSCNCpbREVCVUddIEZpbGUgY29udHJhY3RzL2NvbnRyYWN0NC50YWN0OjIwOjmD+FDD+FDB/4CCCEAuml1G64wIgBQYB1DDTHwGCEAuml1G68uCB+gABMYIAjlX4QlJAxwXy9PgnbxD4QW8kE18DoYIImJaAobYIgUukIcIA8vSNCGAHy8fWzBlt4Sc785ZWIzxUQF0Ah9SL9Hk8QYuOiwqsnUR/WIBCECNtbW3bPH8MAnKCEJRqmLa6jqgw0x8BghCUapi2uvLggdM/ATHIAYIQr/kPV1jLH8s/yfhCAXBt2zx/4MAAkTDjDXALBwLU+QEggvDE+NcjEu3971t77HgzvbsWLRURvXipEq7Q8mN69lVyrrqOwTD4QW8kE18D2zyNCpbREVCVUddIEZpbGUgY29udHJhY3RzL2NvbnRyYWN0NC50YWN0OjI0OjmD+FDD+FDCkf9sx4AkIA9yC8GqIeYCsKT4InDXVx5NyXx0DnHsZJIPtK3fGK/GHmJWPuo/I+EFvJBNfA9s8jQqW0RFQlVHXSBGaWxlIGNvbnRyYWN0cy9jb250cmFjdDQudGFjdDoyOTo5g/hQw/hQwpIj4QgF/bds8f9sx4AkKCwDeyCHBAJiALQHLBwGjAd4hgjgyfLJzQRnTt6mqHbmOIHAgcY4UBHqpDKYwJagSoASqBwKkIcAARTDmMDOqAs8BjitvAHCOESN6qQgSb4wBpAN6qQQgwAAU5jMipQOcUwJvgaYwWMsHAqVZ5DAx4snQACgAAAAAaW5jcmVtZW50IHJlZnVuZAE6bW0ibrOZWyBu8tCAbyIBkTLiECRwAwSAQlAj2zwMAcrIcQHKAVAHAcoAcAHKAlAFINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WUAP6AnABymgjbrORf5MkbrPilzMzAXABygDjDSFus5x/AcoAASBu8tCAAcyVMXABygDiyQH7AA0AmH8BygDIcAHKAHABygAkbrOdfwHKAAQgbvLQgFAEzJY0A3ABygDiJG6znX8BygAEIG7y0IBQBMyWNANwAcoA4nABygACfwHKAALJWMwCASAQEQIBIBMUAhG22Btnm2eNhDAXEgC5t3owTgudh6ullc9j0J2HOslQo2zQThO6xqWlbI+WZFp15b++LEcwTgQKuANwDOxymcsHVcjktlhwTgN6k73yqLLeOOp6e8CrOGTQThOy6ctWadluZ0HSzbKM3RSQAAj4J28QAgEgFRYCEbfzO2ebZ42EMBcYABGwr7tRNDSAAGAAdbJu40NWlwZnM6Ly9RbWZZNU1GTEhOTDFOV29DOVRxN25qRFRvcG1CUnQ1SGlUaWJzeGU1ZmpzaVN5ggAYDtRNDUAfhj0gABjiX6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAdI/WWwS4DD4KNcLCoMJuvLgids8GQACIAAG+EJw');
            __system = core_1.Cell.fromBase64('te6cckECHAEABRcAAQHAAQEFocS1AgEU/wD0pBP0vPLICwMCAWIEDwLU0AHQ0wMBcbCjAfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IhUUFMDbwT4YQL4Yts8Wts88uCCyPhDAcx/AcoAWVkg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxbKP8ntVBkFAvbtou37AZIwf+BwIddJwh+VMCDXCx/eIMAAItdJwSGwjk5bjQWZW1wdHkgbWVzc2FnZSByZWNlaXZlZII0KltERUJVR10gRmlsZSBjb250cmFjdHMvY29udHJhY3Q0LnRhY3Q6MjA6OYP4UMP4UMH/gIIIQC6aXUbrjAiAGBwHUMNMfAYIQC6aXUbry4IH6AAExggCOVfhCUkDHBfL0+CdvEPhBbyQTXwOhggiYloChtgiBS6QhwgDy9I0IYAfLx9bMGW3hJzvzllYjPFRAXQCH1Iv0eTxBi46LCqydRH9YgEIQI21tbds8fw0CcoIQlGqYtrqOqDDTHwGCEJRqmLa68uCB0z8BMcgBghCv+Q9XWMsfyz/J+EIBcG3bPH/gwACRMOMNcAwIAtT5ASCC8MT41yMS7f3vW3vseDO9uxYtFRG9eKkSrtDyY3r2VXKuuo7BMPhBbyQTXwPbPI0KltERUJVR10gRmlsZSBjb250cmFjdHMvY29udHJhY3Q0LnRhY3Q6MjQ6OYP4UMP4UMKR/2zHgCgkD3ILwaoh5gKwpPgicNdXHk3JfHQOcexkkg+0rd8Yr8YeYlY+6j8j4QW8kE18D2zyNCpbREVCVUddIEZpbGUgY29udHJhY3RzL2NvbnRyYWN0NC50YWN0OjI5OjmD+FDD+FDCkiPhCAX9t2zx/2zHgCgsMAN7IIcEAmIAtAcsHAaMB3iGCODJ8snNBGdO3qaoduY4gcCBxjhQEeqkMpjAlqBKgBKoHAqQhwABFMOYwM6oCzwGOK28AcI4RI3qpCBJvjAGkA3qpBCDAABTmMyKlA5xTAm+BpjBYywcCpVnkMDHiydAAKAAAAABpbmNyZW1lbnQgcmVmdW5kATptbSJus5lbIG7y0IBvIgGRMuIQJHADBIBCUCPbPA0ByshxAcoBUAcBygBwAcoCUAUg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxZQA/oCcAHKaCNus5F/kyRus+KXMzMBcAHKAOMNIW6znH8BygABIG7y0IABzJUxcAHKAOLJAfsADgCYfwHKAMhwAcoAcAHKACRus51/AcoABCBu8tCAUATMljQDcAHKAOIkbrOdfwHKAAQgbvLQgFAEzJY0A3ABygDicAHKAAJ/AcoAAslYzAIBWBAUAgEgERMCEbbYG2ebZ42EMBkSAAj4J28QALm3ejBOC52Hq6WVz2PQnYc6yVCjbNBOE7rGpaVsj5ZkWnXlv74sRzBOBAq4A3AM7HKZywdVyOS2WHBOA3qTvfKost446np7wKs4ZNBOE7Lpy1Zp2W5nQdLNsozdFJACASAVGAIBIBYXABGwr7tRNDSAAGAAdbJu40NWlwZnM6Ly9RbWZZNU1GTEhOTDFOV29DOVRxN25qRFRvcG1CUnQ1SGlUaWJzeGU1ZmpzaVN5ggAhG38ztnm2eNhDAZGwGA7UTQ1AH4Y9IAAY4l+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAHSP1lsEuAw+CjXCwqDCbry4InbPBoABvhCcAACIIgp8Jw=');
            builder = (0, core_1.beginCell)();
            builder.storeRef(__system);
            builder.storeUint(0, 1);
            initContract4_init_args({ $$type: 'Contract4_init_args' })(builder);
            __data = builder.endCell();
            return [2 /*return*/, { code: __code, data: __data }];
        });
    });
}
var Contract4_errors = {
    2: { message: "Stack underflow" },
    3: { message: "Stack overflow" },
    4: { message: "Integer overflow" },
    5: { message: "Integer out of expected range" },
    6: { message: "Invalid opcode" },
    7: { message: "Type check error" },
    8: { message: "Cell overflow" },
    9: { message: "Cell underflow" },
    10: { message: "Dictionary error" },
    13: { message: "Out of gas error" },
    32: { message: "Method ID not found" },
    34: { message: "Action is invalid or not supported" },
    37: { message: "Not enough TON" },
    38: { message: "Not enough extra-currencies" },
    128: { message: "Null reference exception" },
    129: { message: "Invalid serialization prefix" },
    130: { message: "Invalid incoming message" },
    131: { message: "Constraints error" },
    132: { message: "Access denied" },
    133: { message: "Contract stopped" },
    134: { message: "Invalid argument" },
    135: { message: "Code of a contract was not found" },
    136: { message: "Invalid address" },
    137: { message: "Masterchain support is not enabled for this contract" },
    19364: { message: "insufficient balance" },
    36437: { message: "only the deployer is allowed to withdraw" },
};
var Contract4_types = [
    { "name": "StateInit", "header": null, "fields": [{ "name": "code", "type": { "kind": "simple", "type": "cell", "optional": false } }, { "name": "data", "type": { "kind": "simple", "type": "cell", "optional": false } }] },
    { "name": "Context", "header": null, "fields": [{ "name": "bounced", "type": { "kind": "simple", "type": "bool", "optional": false } }, { "name": "sender", "type": { "kind": "simple", "type": "address", "optional": false } }, { "name": "value", "type": { "kind": "simple", "type": "int", "optional": false, "format": 257 } }, { "name": "raw", "type": { "kind": "simple", "type": "slice", "optional": false } }] },
    { "name": "SendParameters", "header": null, "fields": [{ "name": "bounce", "type": { "kind": "simple", "type": "bool", "optional": false } }, { "name": "to", "type": { "kind": "simple", "type": "address", "optional": false } }, { "name": "value", "type": { "kind": "simple", "type": "int", "optional": false, "format": 257 } }, { "name": "mode", "type": { "kind": "simple", "type": "int", "optional": false, "format": 257 } }, { "name": "body", "type": { "kind": "simple", "type": "cell", "optional": true } }, { "name": "code", "type": { "kind": "simple", "type": "cell", "optional": true } }, { "name": "data", "type": { "kind": "simple", "type": "cell", "optional": true } }] },
    { "name": "Deploy", "header": 2490013878, "fields": [{ "name": "queryId", "type": { "kind": "simple", "type": "uint", "optional": false, "format": 64 } }] },
    { "name": "DeployOk", "header": 2952335191, "fields": [{ "name": "queryId", "type": { "kind": "simple", "type": "uint", "optional": false, "format": 64 } }] },
    { "name": "FactoryDeploy", "header": 1829761339, "fields": [{ "name": "queryId", "type": { "kind": "simple", "type": "uint", "optional": false, "format": 64 } }, { "name": "cashback", "type": { "kind": "simple", "type": "address", "optional": false } }] },
    { "name": "Withdraw", "header": 195467089, "fields": [{ "name": "amount", "type": { "kind": "simple", "type": "uint", "optional": false, "format": "coins" } }] },
];
var Contract4_getters = [
    { "name": "balance", "arguments": [], "returnType": { "kind": "simple", "type": "int", "optional": false, "format": 257 } },
    { "name": "val", "arguments": [], "returnType": { "kind": "simple", "type": "int", "optional": false, "format": 257 } },
];
var Contract4_receivers = [
    { "receiver": "internal", "message": { "kind": "empty" } },
    { "receiver": "internal", "message": { "kind": "text", "text": "increment" } },
    { "receiver": "internal", "message": { "kind": "text", "text": "refund increment" } },
    { "receiver": "internal", "message": { "kind": "typed", "type": "Withdraw" } },
    { "receiver": "internal", "message": { "kind": "typed", "type": "Deploy" } },
];
var Contract4 = /** @class */ (function () {
    function Contract4(address, init) {
        this.abi = {
            types: Contract4_types,
            getters: Contract4_getters,
            receivers: Contract4_receivers,
            errors: Contract4_errors,
        };
        this.address = address;
        this.init = init;
    }
    Contract4.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Contract4_init()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Contract4.fromInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var init, address;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Contract4_init()];
                    case 1:
                        init = _a.sent();
                        address = (0, core_1.contractAddress)(0, init);
                        return [2 /*return*/, new Contract4(address, init)];
                }
            });
        });
    };
    Contract4.fromAddress = function (address) {
        return new Contract4(address);
    };
    Contract4.prototype.send = function (provider, via, args, message) {
        return __awaiter(this, void 0, void 0, function () {
            var body;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        body = null;
                        if (message === null) {
                            body = new core_1.Cell();
                        }
                        if (message === 'increment') {
                            body = (0, core_1.beginCell)().storeUint(0, 32).storeStringTail(message).endCell();
                        }
                        if (message === 'refund increment') {
                            body = (0, core_1.beginCell)().storeUint(0, 32).storeStringTail(message).endCell();
                        }
                        if (message && typeof message === 'object' && !(message instanceof core_1.Slice) && message.$$type === 'Withdraw') {
                            body = (0, core_1.beginCell)().store(storeWithdraw(message)).endCell();
                        }
                        if (message && typeof message === 'object' && !(message instanceof core_1.Slice) && message.$$type === 'Deploy') {
                            body = (0, core_1.beginCell)().store(storeDeploy(message)).endCell();
                        }
                        if (body === null) {
                            throw new Error('Invalid message type');
                        }
                        return [4 /*yield*/, provider.internal(via, __assign(__assign({}, args), { body: body }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Contract4.prototype.getBalance = function (provider) {
        return __awaiter(this, void 0, void 0, function () {
            var builder, source, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        builder = new core_1.TupleBuilder();
                        return [4 /*yield*/, provider.get('balance', builder.build())];
                    case 1:
                        source = (_a.sent()).stack;
                        result = source.readBigNumber();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Contract4.prototype.getVal = function (provider) {
        return __awaiter(this, void 0, void 0, function () {
            var builder, source, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        builder = new core_1.TupleBuilder();
                        return [4 /*yield*/, provider.get('val', builder.build())];
                    case 1:
                        source = (_a.sent()).stack;
                        result = source.readBigNumber();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    return Contract4;
}());
exports.Contract4 = Contract4;
