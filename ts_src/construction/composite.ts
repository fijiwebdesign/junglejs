 import {Construct} from './construct'
import {isPrimative, isVanillaObject, isVanillaArray, B, meld} from '../util/all'
import {Domain} from './domain'
import {HostState, AccessoryState, ExposureLevel} from './state'

export class Composite extends Construct{

    static keywords = {basis:null, domain:null, form:null, anon:null}
    subconstructs:any;

    state:HostState
    nucleus:any

    beginTractor:()=>void;
    endTractor:()=>void;

    isComposite = true


    constructor(domain?:Domain){
        super(domain); //cache

        this.subconstructs = [];
        this.nucleus = {}
    }

    init(patch){

        super.init(patch)

        //add Everything
        this.addStrange('domain', this.domain.getExposure())
        this.addStrange('meta', this.getExposure())

        if(this.beginTractor){ this.beginTractor.call(this.local) }
    }

    /*
        essential configuration to occur before constructions
    */
    applyForm(form:any={}){
        super.applyForm(form)

        this.state = new HostState(this.exposure, this.nucleus)
        this.exposed = this.state.exposed
        this.local = this.state.local

        this.beginTractor = form.begin;
        this.endTractor = form.end;
    }

    /*
        undo the setup so that a new form can be applied
    */
    clearForm(){
        this.beginTractor = undefined;
        this.endTractor = undefined;
        super.clearForm()
    }


    /*
        modification of structure by application of a patch,
        when alive and being reformed it will kill it first and then apply a recursive patching
    */
    patch(patch:any){
        //incrementally apply the patch, ignoring keywords.
        //console.log("Composite patch: ", patch)

        for(let k in patch){
            if(!(k in Composite.keywords)){
                let v = patch[k];
                this.patchChild(k, v)
            }
        }

        if(patch.anon !== undefined){
            for(let i = 0; i<patch.anon.length; i++){
                //push all, no colli
                this.add(patch.anon[i])
            }
        }
    }

    reset(patch){
        this.dispose()
        this.init(patch)
    }

    protected patchChild(k, v){

        let existing:Construct = this.subconstructs[k];
        if(existing !== undefined){
            existing.patch(v);
        }else{
            if(v === Symbol.for("DELETE")){
                this.remove(k)
            }else{
                this.add(v , k);
            }
        }
    }

    /**
     * Add any kind of item to the composite, will split into 4 cases
     * Ultimately adding to the subcomposite and/or context objects
     */
    add(val:any , key?:string){

        let k = key === undefined? this.subconstructs.length++:key

        if(this.nucleus instanceof Array){
            this.nucleus.length = this.subconstructs.length
        }

        if(isPrimative(val)){
            this.addPrimative(k, val)
        }else if(isVanillaObject(val)){
            val.basis = val.basis||'object';
            let recovered = this.domain.recover(val);
            this.attachChild(recovered, k);
        }else if(isVanillaArray(val)){
            let patch = {
                basis:'array',
                anon:val
            }
            let recovered = this.domain.recover(patch);
            this.attachChild(recovered, k);
        }else{
            this.addStrange(k, val)
        }

    }

    attachChild(construct:Construct, key:any){
        this.subconstructs[key] = construct;
        construct.attach(this, key)
    }

    detachChild(key){
        let construct = this.subconstructs[key];
        delete this.subconstructs[key]

        construct.detach(this, key)

        this.state.removeSub(key)
    }


    /**
     * Add an item to the construct that is an object of a Class that is not conformant or
     Coercible to a standard jungle Construct object.
     */
    addStrange(k, v){
        this.nucleus[k] = v
    }

    /**
     * Add an item to the composite that is not an object
     */
    addPrimative(k, v){
        this.nucleus[k] = v
    }




    getExposure():any{
        return {
            create:(v, k?)=>{
                this.add(v, k)
            },
            destroy:(k)=>{
                this.remove(k)
            }
        }
    }


    remove(k){
        let removing = <Construct>this.subconstructs[k];

        if(removing !== undefined){
            this.detachChild(k)
            let final = removing.dispose();
            return final
        }else if(k in this.nucleus){
            let removeState = this.nucleus[k];
            delete this.nucleus
        }


    }

    /*
        Called at the end of life of the construct,
        should return it's final form, and also return to being a pattern
        it should retract any changes it enacted on the parent.
    */
    dispose():any{
        if(this.endTractor){ this.endTractor.call(this.state.local) }

        for (let key in this.subconstructs) {
            let construct:Construct = this.subconstructs[key]

            construct.dispose()
            this.detachChild(key)
        }

        this.clearForm()

        super.dispose();
    }

    /*
        output a representation of the construct that may be recovered to a replication
    */
    extract():any {

        if(this.alive){
            let extracted = {}
            for (let key in this.subconstructs) {
                let construct = this.subconstructs[key]
                extracted[key] = construct.extract();
            }

            for (let key in this.nucleus){
                if(!(key in this.subconstructs)){
                    if(isPrimative(this.nucleus[key])){
                        extracted[key] = this.nucleus[key]
                    }
                }
            }

            return extracted

        }else{
            return undefined
        }
    }
}
