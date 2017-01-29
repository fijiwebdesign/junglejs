/// <reference path="../typings/index.d.ts" />
declare namespace Gentyl {
    function G(components: Object, form: any): ResolutionNode;
    function F(func: any, components: any): ResolutionNode;
    function R(reconstructionBundle: any): Reconstruction;
    function T(type: any): Terminal;
}
declare namespace Gentyl {
    namespace Actions {
        class Component {
            private host;
            constructor(host: BaseNode);
            add(keyOrVal: any, val: any): void;
        }
    }
}
declare namespace Gentyl {
    enum ASSOCMODE {
        INHERIT = 0,
        SHARE = 1,
        TRACK = 2,
    }
    interface ContextSpec {
        properties: PropertySpec[];
        declaration: string;
    }
    interface ContextLayer {
        source: GContext;
        mode: ASSOCMODE;
    }
    interface PropertySpec {
        type: CTXPropertyTypes;
        key: any;
        value: any;
        reference?: any;
        original?: any;
    }
    enum CTXPropertyTypes {
        NORMAL = 0,
        BOUND = 1,
        HOOK = 2,
    }
    class GContext {
        private host;
        label: string;
        nominal: boolean;
        declaration: string;
        path: (string | number)[];
        exposed: any;
        internalProperties: any;
        propertyLayerMap: any;
        activePropertyRegister: any;
        closed: boolean;
        originals: any;
        cache: any;
        constructor(host: BaseNode, contextspec: ContextSpec);
        addInternalProperty(spec: PropertySpec): void;
        addHookedProperty(spec: PropertySpec): void;
        addThroughProperty(spec: PropertySpec): void;
        addInputProperty(spec: PropertySpec): void;
        addOutputProperty(spec: any): void;
        prepare(): void;
        extract(): {};
        parseMode(modestr: string): ContextLayer[];
        addExposedProperty(name: string, defaultValue: any): void;
        removeExposedProperty(name: string): void;
        setItem(key: any, data: any): void;
        getItem(key: any): any;
        getItemSource(key: any): GContext;
        addInherentLayer(layerctx: GContext): void;
        addSourceLayer(layer: ContextLayer): void;
    }
}
declare namespace Gentyl {
    class BaseNode {
        crown: any;
        ctx: GContext;
        form: BaseForm;
        io: IO.IOComponent;
        act: Actions.Component;
        parent: BaseNode;
        depth: number;
        deplexer: IO.GatedPort;
        async: boolean;
        engaged: boolean;
        isRoot: boolean;
        root: BaseNode;
        prepared: boolean;
        ancestor: BaseNode;
        isAncestor: boolean;
        constructor(components: any, form?: FormSpec);
        protected constructForm(): BaseForm;
        protected constructIO(iospec: any): IO.IOComponent;
        protected constructContext(contextspec: any): GContext;
        protected constructActions(): Actions.Component;
        protected constructCore(crown: any, form: any): BaseNode;
        inductComponent(component: any): any;
        prepare(prepargs?: any): BaseNode | IO.GatedPort;
        complete(): BaseNode;
        protected prepareChild(prepargs: any, child: any, k: any): BaseNode;
        protected setParent(parentNode: BaseNode, dereferent: string | number): void;
        replicate(): BaseNode;
        getParent(toDepth?: number): BaseNode;
        getRoot(): BaseNode;
        getNominal(label: any): BaseNode;
        terminalScan(recursive?: boolean, collection?: any[], locale?: any): any[];
        checkComplete(recursive?: boolean): boolean;
        bundle(): Bundle;
        enshell(): this;
        resolve(arg: any): any;
    }
}
declare namespace Gentyl {
    interface FormSpec {
        r?: (obj, args?) => any;
        c?: (args?) => any;
        s?: (keys, arg?) => any;
        p?: (arg) => void;
        d?: (arg) => void;
        x?: string;
        links?: string[];
        ports?: string[];
        lf?: (porta, portb) => any;
    }
    interface FormResult {
        iospec?: any;
        contextspec?: ContextSpec;
    }
    class BaseForm {
        host: BaseNode;
        preparator: (arg) => void;
        depreparator: (arg) => void;
        constructor(host: BaseNode);
        parse(formObj: FormSpec): {
            iospec: any;
            contextspec: {
                properties: any;
                declaration: string;
            };
        };
        consolidate(io: IO.IOComponent, ctx: GContext): FormSpec;
    }
    interface IOLinkSpec {
        ports: any;
        linkFunciton: (a, b) => void;
        links: string[];
    }
    class LForm extends BaseForm {
        parse(formObj: FormSpec): {
            iospec: IOLinkSpec;
            contextspec: ContextSpec;
        };
    }
}
declare namespace Gentyl {
    namespace IO {
        const HALT: {};
        function halting(arg: any): {};
        function passing(arg: any): any;
        function defined(arg: any): any;
        function always(arg: any): boolean;
        function nothing(arg: any): any;
        function host(arg: any): any;
        enum Orientation {
            INPUT = 0,
            OUTPUT = 1,
            NEUTRAL = 2,
            MIXED = 3,
        }
        interface Shell {
            sinks: {
                $: Port;
            };
            sources: {
                $: Port;
            };
            base: IOComponent;
            designate: (designator: PortDesignator) => Port[];
            dress: (designator: PortDesignator, coat: OutputCoat) => void;
        }
        interface IOComponent {
            shell: Shell;
            enshell: () => Shell;
            dress: (designator: string, coat: OutputCoat) => void;
            prepare: (parg) => void;
            extract: () => any;
        }
        enum DesignationTypes {
            ALL = 0,
            MATCH = 1,
            REGEX = 2,
            FUNC = 3,
        }
        interface PortDesignator {
            direction: Orientation;
            type: DesignationTypes;
            data: any;
        }
        interface OutputCoat {
            context: Object | ((ResolveOutputPort) => Object);
            callback: (output: any) => any;
        }
        class BaseIO implements IOComponent {
            specialGate: boolean;
            shell: Shell;
            constructor();
            prepare(): void;
            dress(designation: string, coat: OutputCoat): void;
            enshell(): Shell;
            extract(): any;
        }
    }
}
declare namespace Gentyl {
    namespace IO {
        class Port {
            label: any;
            callbackContext: any;
            callback: any;
            shells: Shell[];
            constructor(label: any);
            addShell(shell: any): void;
            designate(designator: PortDesignator): boolean;
            dress(coat: OutputCoat): void;
            prepareCallback(callback: any): void;
            prepareContext(outputContext: any): void;
            handle(input: any): void;
        }
        class GatedPort extends Port {
            host: BaseNode;
            complete: (...args: any[]) => any;
            gate: Util.Gate;
            deposit: any;
            returned: any;
            constructor(label: any, host: BaseNode, complete: (...args: any[]) => any);
            addTributary(tributary: GatedPort): void;
            handle(input: any): void;
            allHome(): boolean;
            reset(label: string, completer: (...args) => any): void;
        }
    }
}
declare namespace Gentyl.Inv {
}
declare namespace Gentyl.Inv {
    function retract(obj: any, arg: any): any;
}
declare namespace Gentyl.Inv {
    function selectNone(): any[];
}
declare namespace Gentyl.Inv {
    function pass(x: any): any;
    function abstain(x: any): void;
}
declare module Gentyl {
}
declare namespace Gentyl {
    namespace IO {
        class LinkIO implements IOComponent {
            shell: Shell;
            specialGate: boolean;
            constructor();
            enshell(): Shell;
            dress(designator: string, coat: OutputCoat): void;
            prepare(parg: any): void;
            extract(): void;
        }
    }
}
declare namespace Gentyl {
    interface FormRef {
        f: string;
        c: string;
        m: string;
    }
    interface FunctionCache {
        storeFunction(func: Function): string;
        recoverFunction(id: string): Function;
    }
    interface Bundle {
        node: any;
        form: FormRef;
        state: any;
    }
    function isBundle(object: any): boolean;
    function deformulate(fromNode: BaseNode): any;
    function reformulate(formRef: FormRef): FormSpec;
    class Reconstruction extends BaseNode {
        constructor(bundle: Bundle);
    }
}
declare namespace Gentyl {
    class ResolutionNode extends BaseNode {
        resolveCache: {
            stage: string;
            resolveArgs: any;
            carried: any;
            selection: any;
            resolvedCrown: any;
            resolvedValue: any;
        };
        io: IO.ResolveIO;
        form: GForm;
        protected constructForm(): GForm;
        protected constructIO(iospec: any): IO.ResolveIO;
        protected constructCore(crown: any, form: any): ResolutionNode;
        private resolveArray(array, resolveArgs, selection);
        private resolveObject(node, resolveArgs, selection);
        private resolveNode(node, resolveArgs, selection);
        proceed(received: any): void;
        resolve(resolveArgs: any): any;
        resolveSelect(): any;
        resolveCrown(): any;
        resolveReturn(): any;
        resolveComplete(): any;
    }
}
declare namespace Gentyl {
    enum LabelTypes {
        PASSIVE = 0,
        TRIG = 1,
        ENTRIG = 2,
        GATE = 3,
        GATER = 4,
        TRIGATE = 5,
        TRIGATER = 6,
        ENTRIGATE = 7,
        ENTRIGATER = 8,
    }
    class GForm extends BaseForm {
        static RFormProps: string[];
        carrier: (arg) => any;
        resolver: (obj, arg) => any;
        selector: (keys, arg) => any;
        constructor(host: ResolutionNode);
        parse(formObj: FormSpec): {
            iospec: any;
            contextspec: ContextSpec;
        };
        consolidate(io: IO.IOComponent, ctx: GContext): FormSpec;
    }
}
declare namespace Gentyl {
    namespace IO {
        interface Hook {
            host: ResolutionNode;
            label: string;
            tractor: Function;
            orientation: Orientation;
            eager: boolean;
            reactiveValue?: boolean;
        }
        class ResolveIO implements IOComponent {
            host: ResolutionNode;
            hooks: Hook[];
            orientation: Orientation;
            isShellBase: boolean;
            base: ResolveIO;
            specialInput: Hook;
            specialOutput: Hook;
            specialGate: boolean;
            inputs: any;
            outputs: any;
            inputHooks: any;
            outputHooks: any;
            shell: HookShell;
            constructor(host: ResolutionNode, iospec: any);
            prepare(): void;
            extract(): {};
            dress(designation: any, coat: OutputCoat): void;
            initialiseHooks(hooks: Hook[], specialIn: Hook, specialOut: Hook): void;
            addHook(hook: Hook): void;
            enshell(): HookShell;
            reorient(): void;
            collect(): {
                hooks: Hook[];
                shells: Shell[];
            };
            dispatchResult(result: any): any;
        }
    }
}
declare namespace Gentyl {
    namespace IO {
        class ResolveInputPort extends Port {
            shells: HookShell[];
            constructor(label: any, ...shells: HookShell[]);
            handleInput(input: any): void;
        }
        class SpecialInputPort extends ResolveInputPort {
            private base;
            constructor(base: ResolveIO);
            handleInput(input: any): void;
        }
        class ResolveOutputPort extends Port {
            constructor(label: string);
            handle(input: any): void;
        }
    }
}
declare namespace Gentyl {
    namespace IO {
        class HookShell implements Shell {
            base: ResolveIO;
            inputHooks: any;
            outputHooks: any;
            sinks: any;
            sources: any;
            constructor(base: ResolveIO, midrantHooks: Hook[], subshells: Shell[]);
            addMidrantHook(hook: Hook): void;
            addShell(shell: Shell): void;
            designate(designator: PortDesignator): (ResolveInputPort | ResolveOutputPort)[];
            dress(designator: PortDesignator, coat: OutputCoat): void;
        }
    }
}
declare namespace Gentyl {
    class Terminal {
        private type;
        constructor(type: any);
        check(obj: any): boolean;
    }
}
declare namespace Gentyl {
    namespace Util {
        function identity(x: any): any;
        function weightedChoice(weights: number[]): number;
        function range(...args: any[]): any[];
        function translator(node: any, translation: any): any;
        function melder(node1: any, node2: any, merge?: (a: any, b: any) => any, concatArrays?: boolean, typeConstrain?: boolean): any;
        function deeplyEquals(node1: any, node2: any, allowIdentical?: boolean): boolean;
        function deeplyEqualsThrow(node1: any, node2: any, derefstack: any, seen: any, allowIdentical?: boolean): boolean;
        function isDeepReplica(node1: any, node2: any): void;
        function isDeepReplicaThrow(node1: any, node2: any, derefstack: any): void;
        function softAssoc(from: any, onto: any): void;
        function parassoc(from: any, onto: any): void;
        function assoc(from: any, onto: any): void;
        function deepCopy<T>(thing: T): T;
        function applyMixins(derivedCtor: any, baseCtors: any[]): void;
        function objectArrayTranspose(objArr: any, key: string): void;
        function isPrimative(thing: any): boolean;
        function isVanillaObject(thing: any): boolean;
        function isVanillaArray(thing: any): boolean;
        function isTree(thing: any, stack?: any[]): any;
        function isVanillaTree(thing: any, stack?: any[]): any;
        function typeCaseSplitR(objectOrAllFunction: any, arrayFunc?: any, primativeFunc?: any): (inThing: any, initial?: any, reductor?: (a: any, b: any, k: any) => void) => any;
        function typeCaseSplitF(objectOrAllFunction: any, arrayFunc?: any, primativeFunc?: any): (inThing: any) => any;
        function typeCaseSplitM(objectOrAllFunction: any, arrayFunc?: any, primativeFunc?: any): (inThing: any) => void;
        function collapseValues(obj: any): any[];
        class Gate {
            callback: any;
            context: any;
            private locks;
            private locki;
            private data;
            constructor(callback?: any, context?: any);
            lock(): (arg) => void;
            reset(): void;
            allUnlocked(): boolean;
        }
    }
}
