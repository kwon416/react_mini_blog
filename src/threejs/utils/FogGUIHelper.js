/**
 * 이 클래스의 인스턴스를 lil-gui에 넘겨
 * near나 far 속성을 조정할 때 항상
 * near는 never >= far, far는 never <= near가 되도록 합니다
 **/
// 또 lil-gui가 color 속성을 조작할 때 안개와 배경색을 동시에 변경합니다
class FogGUIHelper {
  constructor(fog, backgroundColor) {
    this.fog = fog;
    this.backgroundColor = backgroundColor;
  }
  get near() {
    return this.fog.near;
  }
  set near(v) {
    this.fog.near = v;
    this.fog.far = Math.max(this.fog.far, v);
  }
  get far() {
    return this.fog.far;
  }
  set far(v) {
    this.fog.far = v;
    this.fog.near = Math.min(this.fog.near, v);
  }

  get color() {
    return `#${this.fog.color.getHexString()}`;
  }
  set color(hexString) {
    this.fog.color.set(hexString);
    this.backgroundColor.set(hexString);
  }
}

export default FogGUIHelper;
