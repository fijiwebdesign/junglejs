import {Connect, TunnelIn, TunnelOut} from '../../../aliases/all'
import TestApp from '../../helpers/testApp'

import Jasmine = require('jasmine')

describe('rule connector constructs', function(){

    it('should create link when part of spec', function(){

        let app = new TestApp()

        app.init({
            form:{
                debug:false
            },

            ghost:TunnelIn("hook"),
            haunts:Connect(':ghost->:child','direct'),
            child:TunnelOut("hook")
        });

        app.callResponseTest({
            label:'test scare throughput',
            inputContact:':ghost',
            outputContact:':child',

            inputValues:['boo'],
            outputValues:['boo'],
            returnValues:[undefined],

            respondant:(data, crumb)=>{
                return undefined
            }
        })

        app.remove('haunts');

        app.callResponseTest({
            label:'test no scare',
            inputContact:':ghost',
            outputContact:':child',

            inputValues:['boo'],
            outputValues:[Symbol.for('NOCALL')],
            returnValues:[undefined],

            respondant:(data, crumb)=>{
                return undefined
            }
        })
    })

})
