
import {Construct} from './construct'
import {deepMeldF} from '../util/ogebra/hierarchical'

/*
    a place where constructs are stored in either static or serial form and recovered from a serial form using a basis
*/
export class Domain {

    registry:any
    subdomain:any
    melder:(a:any, b:any)=>any

    constructor(){
        this.registry = {};
        this.subdomain = {};
        this.melder = deepMeldF();
    }

    branch(key){
        this.subdomain[key] = new Domain()
        return this.subdomain[key];
    }

    register(key, basis:Function|string, patch={}){
        let nature, baseSpec

        if(typeof(basis) === 'string'){
            if(!(basis in this.registry)){
                throw "Unable to register by basis label, basis label not in registry"
            }

            nature = this.registry[basis].nature
            baseSpec = this.registry[basis].patch
        }else{
            nature = basis
            baseSpec = {}
        }

        this.registry[key] = {
            nature:nature,
            patch:this.melder(baseSpec, patch)
        };

        // if(key in this.registry){
        //     throw new Error(`Domain cannot contain duplicates "${key}" is already registered`)
        // }else{
        // }
    }

    locateDomain(dotpath:string):Domain{
        if(dotpath.match(/^(?:[\w\$]+\.)*(?:[\w\$]+)$/)){
            let subdomains = dotpath.split(/\./);

            let ns = this;
            for(let spacederef of subdomains){
                if(spacederef in this.subdomain){
                    ns = this.subdomain[spacederef]
                }else{
                    throw new Error(`Unable to locate Domain of basis`)
                }
            }

            return ns

        }else if (dotpath === ""){
            return this
        }else{
            throw new Error(`invalid dotpath syntax: ${dotpath}`)
        }
    }

    recover(construct):Construct{
        ///TODO: Basis accessors a.b:Basis

        if(!(construct.basis in this.registry)){
            throw new Error(`Unable to reconstruct the basis '${construct.basis}' is not registered to the Domain`)
        }

        let {nature, patch} = this.registry[construct.basis];

        try {
            let spec = this.melder(patch, construct)
            return new nature(spec);
        }catch (e){
            console.error("basis: ",construct.basis," not a constructor in registry")
            throw e
        }
    }
}

export const JungleDomain = new Domain();

//
// export function N(ns:Domain){
//     return new Proxy({}, {
//         get(key){
//
//         }
//     })
// }
