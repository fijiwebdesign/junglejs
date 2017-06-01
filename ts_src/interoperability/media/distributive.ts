
import * as I from '../interfaces'
import {mediaConstructors,BaseMedium } from './medium'
import {CallOut} from '../contacts/callout'
import {CallIn} from '../contacts/callin'

export class DistributeMedium extends BaseMedium<CallOut, CallIn> {

    typeA;
    typeB;

    constructor(spec:I.MediumSpec){
        super(spec);
        this.typeA = CallOut
        this.typeB  = CallIn
    }

    distribute(sourceToken:string, data:any, crumb){
        for(let sinkToken in this.matrix.to[sourceToken]){
            let allFromA = this.matrix.to[sourceToken];
            let sink:CallIn = allFromA[sinkToken].contactB
            sink.put(data, crumb)
        }
    }

    inductA(token:string, a:CallOut){
        a.emit = this.distribute.bind(this, token)
    }

    inductB(token:string, b:CallIn){
    }

    connect(link: I.LinkSpec<CallOut, CallIn>){
    }

    disconnect(link: I.LinkSpec<CallOut, CallIn>){
        super.disconnect(link)
        link.contactA.emit = undefined;
    }
}

mediaConstructors['distribute'] = DistributeMedium;
