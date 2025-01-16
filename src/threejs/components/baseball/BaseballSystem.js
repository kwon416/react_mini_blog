// BaseballSystem.js
import * as THREE from "three";
import BaseballPhysics from "./BaseballPhysics";

class BaseballSystem extends THREE.Group {
  constructor(rubberOffset, rubberTOHomeplate = 18.44) {
    super();
    this.rubberOffset = rubberOffset;
    this.homeplateDist = rubberTOHomeplate + rubberOffset; // 홈플레이트까지의 거리

    this.setupState();
    this.physics = new BaseballPhysics();
    this.setupBall();
    this.setupTrajectory();
  }

  setupState() {
    this.state = {
      isPitching: false,
      currentTime: 0,
      pitchType: "fastball",
      initialPosition: new THREE.Vector3(0, 1.8, this.rubberOffset),
      initialVelocity: new THREE.Vector3(0, -0.1, 1), // z 방향을 양수로 변경
    };
  }

  setupBall() {
    const ballGeometry = new THREE.SphereGeometry(0.037, 32, 32);
    const ballMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
    });
    this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
    this.ball.position.copy(this.state.initialPosition);
    this.add(this.ball);
  }

  setupTrajectory() {
    const trajectoryMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5,
    });

    this.trajectoryGeometry = new THREE.BufferGeometry();
    this.trajectoryLine = new THREE.Line(
      this.trajectoryGeometry,
      trajectoryMaterial
    );
    this.add(this.trajectoryLine);

    this.trajectoryPoints = [];
    this.maxTrajectoryPoints = 1000;
  }

  resetBall() {
    if (this.ball && this.state.initialPosition) {
      this.ball.position.copy(this.state.initialPosition);
      this.trajectoryPoints = [];
      this.trajectoryGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array([]), 3)
      );
      this.updateTrajectoryLine();
      this.state.currentTime = 0;
      this.state.isPitching = false;
    }
  }

  startPitch(type = "fastball") {
    console.log("startPitch", type);

    if (!this.state || !this.physics) {
      console.error("State or physics not initialized");
      return;
    }

    this.resetBall();
    this.state.pitchType = type;
    this.state.isPitching = true;

    const pitchSettings = this.physics.getPitchSettings(type);

    // 초기 속도 벡터 재설정 (z 방향을 양수로)
    this.state.initialVelocity = new THREE.Vector3(0, -0.1, 1)
      .normalize()
      .multiplyScalar(this.physics.mphToMs(pitchSettings.initialVelocity));
  }

  update() {
    if (!this.state.isPitching || !this.physics) return;

    this.state.currentTime += 1 / 60;

    const pitchSettings = this.physics.getPitchSettings(this.state.pitchType);
    const newPosition = this.physics.calculatePosition(
      this.state.initialPosition,
      this.state.initialVelocity,
      pitchSettings.spinRate,
      pitchSettings.spinAxis,
      this.state.currentTime
    );

    if (this.isValidPosition(newPosition)) {
      this.ball.position.copy(newPosition);

      if (this.trajectoryPoints.length < this.maxTrajectoryPoints) {
        this.trajectoryPoints.push(newPosition.clone());
      }

      this.updateTrajectoryLine();
    }

    // 홈플레이트 도달 조건을 양의 z값으로 변경
    if (
      newPosition.z >= this.homeplateDist ||
      !this.isValidPosition(newPosition)
    ) {
      this.state.isPitching = false;
    }
  }

  isValidPosition(position) {
    return (
      position &&
      !isNaN(position.x) &&
      !isNaN(position.y) &&
      !isNaN(position.z) &&
      isFinite(position.x) &&
      isFinite(position.y) &&
      isFinite(position.z)
    );
  }

  updateTrajectoryLine() {
    if (!this.trajectoryPoints || this.trajectoryPoints.length < 2) return;

    const validPoints = this.trajectoryPoints.filter((point) =>
      this.isValidPosition(point)
    );

    if (validPoints.length < 2) return;

    const positions = new Float32Array(validPoints.length * 3);

    validPoints.forEach((point, i) => {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    });

    this.trajectoryGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    if (this.trajectoryGeometry.attributes.position) {
      this.trajectoryGeometry.computeBoundingSphere();
    }
  }
}

export default BaseballSystem;
