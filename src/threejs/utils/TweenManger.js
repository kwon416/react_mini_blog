import TWEEN from "three/addons/libs/tween.module.js";
//
class TweenManager {
  constructor() {
    this.numTweensRunning = 0;
  }

  _handleComplete() {
    --this.numTweensRunning;
    console.assert(this.numTweensRunning >= 0);
  }
  createTween(targetObject) {
    const self = this;
    ++this.numTweensRunning;
    let userCompleteFn = () => {};
    // Tween 인스턴스를 만들고 onCompelete에 콜백 함수를 설치합니다.
    const tween = new TWEEN.Tween(targetObject).onComplete(function (...args) {
      self._handleComplete();
      userCompleteFn.call(this, ...args);
    });
    // Tween 인스턴스의 onComplete 함수를 바꿔 사용자가 콜백 함수를
    // 지정할 수 있도록 합니다.
    tween.onComplete = (fn) => {
      userCompleteFn = fn;
      return tween;
    };
    return tween;
  }
  update() {
    TWEEN.update();
    return this.numTweensRunning > 0;
  }
}

export default TweenManager;
