import * as THREE from "three";
// 각도(deg)를 호도(rad)로 변환하는 클래스
class DegRadHelper {
  constructor(obj, prop) {
    this.obj = obj;
    this.prop = prop;
  }

  get value() {
    return THREE.Math.radToDeg(this.obj[this.prop]);
  }

  set value(v) {
    this.obj[this.prop] = THREE.Math.degToRad(v);
  }
}

export default DegRadHelper;
