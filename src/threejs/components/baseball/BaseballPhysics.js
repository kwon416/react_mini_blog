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

  getPitchSettings(type) {
    const settings = {
      fastball: {
        initialVelocity: 95, // mph
        spinRate: 2500, // rpm
        spinAxis: new THREE.Vector3(0, 1, 0), // 백스핀
      },
      curveball: {
        initialVelocity: 80,
        spinRate: 2800,
        spinAxis: new THREE.Vector3(0, -1, 0), // 12-6 커브
      },
      slider: {
        initialVelocity: 85,
        spinRate: 2400,
        spinAxis: new THREE.Vector3(0.7, -0.7, 0), // 사선 회전
      },
      changeup: {
        initialVelocity: 85,
        spinRate: 1800,
        spinAxis: new THREE.Vector3(0, 1, 0.2), // 약한 백스핀
      },
    };
    return settings[type];
  }

  calculatePosition(initialPos, initialVel, spinRate, spinAxis, time) {
    // 중력에 의한 변위
    const gravity = new THREE.Vector3(0, this.GRAVITY * time * time * 0.5, 0);

    // 초기 속도에 의한 변위
    const velocity = new THREE.Vector3().copy(initialVel).multiplyScalar(time);

    // 드래그 효과 계산
    const drag = this.calculateDragEffect(initialVel, time);

    // 마그누스 효과 계산
    const magnus = this.calculateMagnusEffect(
      initialVel,
      spinRate,
      spinAxis,
      time
    );

    // 최종 위치 계산
    return (
      new THREE.Vector3()
        .copy(initialPos)
        .add(velocity)
        // .add(gravity)
        .add(drag)
        .add(magnus)
    );
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
