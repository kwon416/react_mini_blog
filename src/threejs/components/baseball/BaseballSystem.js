import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import BaseballPhysics from "./BaseballPhysics";

class BaseballSystem extends THREE.Group {
  constructor(rubberOffset, rubberTOHomeplate = 18.44) {
    super();
    // 기본 변수 설정
    this.rubberOffset = rubberOffset;
    this.homeplateDist = rubberTOHomeplate + rubberOffset;
    this.ballRadius = 0.037; // 공의 반지름
    this.segments = 32; // 공의 세그먼트 수
    this.physics = new BaseballPhysics();

    // 상태 초기화
    this.setupState();

    // 시스템 구성 요소 초기화
    this.setupBall();
    this.setupTrajectory();
  }

  // 상태 초기화
  setupState() {
    this.state = {
      isPitching: false,
      currentTime: 0,
      pitchType: "fastball",
      initialPosition: new THREE.Vector3(0, 1.8, this.rubberOffset),
      initialVelocity: new THREE.Vector3(0, -0.1, 1),
      previousPosition: null,
      trajectoryPoints: [],
    };
  }

  // 야구 공 생성
  setupBall() {
    const loader = new GLTFLoader();
    loader.load(
      "/models/design/untitled.glb",
      (gltf) => {
        this.ball = gltf.scene;
        // Bounding Box 계산
        const boundingBox = new THREE.Box3().setFromObject(this.ball);
        const size = new THREE.Vector3();
        boundingBox.getSize(size);

        console.log("모델 크기:", size); // x = 너비, y = 높이, z = 깊이

        this.ball.scale.set(this.ballRadius, this.ballRadius, this.ballRadius);
        console.log(this.ballRadius);
        console.log("공 크기:", this.ball.scale);

        this.ball.position.copy(this.state.initialPosition);

        this.add(this.ball);
      },
      undefined,
      (error) => {
        console.error("모델 로딩 중 오류 발생:", error);
        // 로딩 실패시 기본 구체로 폴백
        const ballGeometry = new THREE.SphereGeometry(
          this.ballRadius,
          this.segments,
          this.segments
        );
        const ballMaterial = new THREE.MeshPhongMaterial({
          color: 0xffffff,
        });
        this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
        this.ball.position.copy(this.state.initialPosition);
        this.add(this.ball);
      }
    );
  }

  resetBall() {
    if (this.ball && this.state.initialPosition) {
      this.ball.position.copy(this.state.initialPosition);
      this.state.currentTime = 0;
      this.state.isPitching = false;
      this.state.previousPosition = null;
      this.state.trajectoryPoints = [];

      // 기존 궤적 제거
      this.trajectoryGroup.children.forEach((tube) => {
        tube.geometry.dispose();
        tube.material.dispose();
      });
      this.trajectoryGroup.clear();
    }
  }

  setupTrajectory() {
    this.trajectoryGroup = new THREE.Group();

    this.add(this.trajectoryGroup);
  }

  update() {
    if (!this.state.isPitching || !this.physics) return;

    this.state.currentTime += 1 / 60; // 60FPS

    // 새로운 공 위치 계산
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

      // 점 배열에 새로운 위치 추가
      this.state.trajectoryPoints.push(newPosition.clone());

      // 일정 개수의 점이 모이면 새로운 튜브 생성
      if (this.state.trajectoryPoints.length >= 3) {
        const curve = new THREE.CatmullRomCurve3(this.state.trajectoryPoints);
        curve.tension = 0.8; // 곡선 텐션
        const geometry = new THREE.TubeGeometry(
          curve,
          Math.max(this.state.trajectoryPoints.length * 10, 200),
          this.ballRadius,
          this.segments,
          false
        );

        // 기존 궤적 제거 후 새로운 궤적 추가
        this.trajectoryGroup.clear();
        const material = new THREE.LineBasicMaterial({
          color: 0xff0000,
          side: THREE.DoubleSide,
        });
        this.trajectoryGroup.add(new THREE.Mesh(geometry, material));
      }
    }

    // 피치가 종료되는 조건

    if (
      newPosition.z >= this.homeplateDist + 0.2 ||
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

    this.state.initialVelocity = new THREE.Vector3(0, -0.1, 1)
      .normalize()
      .multiplyScalar(this.physics.mphToMs(pitchSettings.initialVelocity));
  }
}

export default BaseballSystem;
