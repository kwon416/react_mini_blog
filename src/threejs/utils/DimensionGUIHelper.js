// 객체와 속성을 받아 GUI가 하나의 값을 조정할 때 하나는 양수, 하나는 음수로 지정
class DimensionGUIHelper {
  constructor(obj, minProp, maxProp) {
    this.obj = obj;
    this.minProp = minProp;
    this.maxProp = maxProp;
  }
  get value() {
    return this.obj[this.minProp];
  }
  set value(v) {
    this.obj[this.minProp] = v;
    this.obj[this.maxProp] = v;
  }
}

export default DimensionGUIHelper;
