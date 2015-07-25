//@module
/*
  Copyright 2011-2014 Marvell Semiconductor, Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

exports.pins = {
	wetSensor: { type: "A2D" },
	i2cTemp: {type: "I2C", address: 0x48},
    i2cLumin: {type: "I2C", address: 0x29},
    watering: {type: "Digital", direction: "output"},
    led: {type: "Digital", direction: "output"},
    
};

exports.configure = function () {
    this.wetSensor.init();
    this.i2cTemp.init();
    this.i2cLumin.init();
    this.led.init();
    this.watering.init();
    this.i2cLumin.writeByteDataSMB(0x80,0x03);
}

exports.wetread = function() {
    return (1-this.wetSensor.read())*100;
}

exports.lightread = function() {
    var light_data_ch0 = this.i2cLumin.readWordDataSMB(0xAC);
    var light_data_ch1 = this.i2cLumin.readWordDataSMB(0xAE);
    var div =  light_data_ch1/light_data_ch0;
    var lumi = 0;
    if (div < 0.5){
         lumi = light_data_ch0*0.0304-0.062*light_data_ch0*Math.pow(div,1.4);
    }else if(div<0.61){
         lumi = light_data_ch0*0.0224-0.031*light_data_ch1;
    }else if(div<0.8){
         lumi = light_data_ch0*0.0128-0.0153*light_data_ch1;
    }else if(div<1.3){
         lumi = light_data_ch0*0.00146-0.00112*light_data_ch1;
    }
    return lumi*16;
}

exports.tempread = function () {
    var data = this.i2cTemp.readWordDataSMB(0);
    data = ( data >> 8 ) & 0xff | ( data << 8 ) & 0xff00;
	var value = ((data) >> 5) & 0x3ff ;
	if (value & 0x200) {
	    value -= 1;
	    value = ~value & 0x3FF;
        value = -value;
    }

    value *= 0.125;
    return value;
}

exports.close = function() {
	this.wetSensor.close();
    this.i2cTemp.close();
    this.i2cLumin.close();
    this.watering.close();
}