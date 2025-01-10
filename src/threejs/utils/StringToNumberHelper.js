// 문자열을 숫자형으로 변환하는 헬퍼 클래스
class StringToNumberHelper {
  constructor(obj, prop) {
    this.obj = obj;
    this.prop = prop;
  }

  get value() {
    return this.obj[this.prop];
  }

  set value(v) {
    this.obj[this.prop] = parseFloat(v);
  }
}

export default StringToNumberHelper;
