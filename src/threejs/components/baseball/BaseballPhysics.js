import * as THREE from "three";

class BaseballPhysics {
  constructor() {
    this.GRAVITY = -9.81; // m/s^2
    this.AIR_DENSITY = 1.225; // kg/m^3
    this.BALL_MASS = 0.145; // kg
    this.BALL_RADIUS = 0.037; // m
    this.DRAG_COEFFICIENT = 0.3;
    this.MAGNUS_COEFFICIENT = 0.5;
  }

  getPitchSettings(pitchData) {
    if (!pitchData) return null;

    const { Release, Movement } = pitchData.data.Pitch;

    // Tilt 값을 각도로 변환 (예: "10:30" -> 315도)
    const tiltToAngle = (tilt) => {
      const [hour, minute] = tilt.split(":").map(Number);
      return (hour % 12) * 30 + minute * 0.5 - 90;
    };

    // SpinAxis와 Tilt를 사용해 회전축 벡터 계산
    const tiltAngle = tiltToAngle(Movement.Tilt);
    const tiltRad = (tiltAngle * Math.PI) / 180;

    // Y와 Z축을 바꿔서 회전축 벡터 생성
    return {
      initialVelocity: Release.Speed,
      spinRate: Release.SpinRate,
      spinAxis: new THREE.Vector3(
        Math.cos(tiltRad),
        0, // Z축이 Y축으로
        Math.sin(tiltRad) // Y축이 Z축으로
      ).normalize(),
    };
  }

  calculatePosition(initialPos, initialVel, spinRate, spinAxis, time) {
    // 중력을 Z축에서 Y축으로 변경
    const gravity = new THREE.Vector3(0, this.GRAVITY * time * time * 0.5, 0);

    // 초기 속도에 의한 변위
    const velocity = new THREE.Vector3().copy(initialVel).multiplyScalar(time);

    // 드래그 효과 계산
    const drag = this.calculateDragEffect(initialVel, time);

    // 마그누스 효과 계산 (회전축도 Y/Z가 바뀐 상태)
    const magnus = this.calculateMagnusEffect(
      initialVel,
      spinRate,
      spinAxis,
      time
    );

    // 최종 위치 계산
    return new THREE.Vector3()
      .copy(initialPos)
      .add(velocity)
      .add(gravity)
      .add(drag)
      .add(magnus);
  }

  calculateDragEffect(velocity, time) {
    const velocityMagnitude = velocity.length();
    const drag =
      -0.5 *
      this.AIR_DENSITY *
      velocityMagnitude *
      this.DRAG_COEFFICIENT *
      Math.PI *
      this.BALL_RADIUS *
      this.BALL_RADIUS *
      time *
      time;

    return new THREE.Vector3().copy(velocity).normalize().multiplyScalar(drag);
  }

  calculateMagnusEffect(velocity, spinRate, spinAxis, time) {
    const omega = (spinRate * 2 * Math.PI) / 60; // rpm to rad/s
    const magnusConstant =
      this.MAGNUS_COEFFICIENT *
      this.AIR_DENSITY *
      Math.PI *
      Math.pow(this.BALL_RADIUS, 3);

    const magnusForce = new THREE.Vector3()
      .crossVectors(spinAxis.normalize(), velocity)
      .multiplyScalar(omega * magnusConstant * time * time * 0.5);

    return magnusForce;
  }

  mphToMs(mph) {
    return mph * 0.44704;
  }
}

export default BaseballPhysics;
