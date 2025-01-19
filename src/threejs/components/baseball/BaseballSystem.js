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
      "/models/baseball/scene.gltf",
      (gltf) => {
        this.ball = gltf.scene;
        // Bounding Box 계산
        const boundingBox = new THREE.Box3().setFromObject(this.ball);
        const size = new THREE.Vector3();
        boundingBox.getSize(size);

        console.log("모델 크기:", size); // x = 너비, y = 높이, z = 깊이
        // 모델 크기 조정 (필요에 따라 조정하세요)

        this.ball.scale.set(
          (this.ballRadius * 2) / size.x,
          (this.ballRadius * 2) / size.y,
          (this.ballRadius * 2) / size.z
        );

        // 공의 초기 위치가 반지름 만큼 아래로 내려가도록 설정

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

    // this.tubeMaterial = new THREE.MeshPhongMaterial({
    //   color: 0xffffe0,
    //   // transparent: true,
    //   opacity: 0.9,
    //   side: THREE.FrontSide,
    //   depthWrite: false,
    //   depthTest: false,
    //   blending: THREE.AdditiveBlending,
    // });
  }

  // 궤적 세그먼트 생성

  createTrajectorySegment(startPos, endPos, curveHeight = 0.01) {
    // 옵션 1. 배지어 커브
    // 두 점 사이의 중간점 계산 (약간의 곡률을 주기 위해)
    const midPoint = new THREE.Vector3()
      .addVectors(startPos, endPos)
      .multiplyScalar(0.5);
    midPoint.y += curveHeight; // 곡률 추가
    const curve = new THREE.QuadraticBezierCurve3(startPos, midPoint, endPos);

    // 옵션 2. 직선 경로
    // const curve = new THREE.LineCurve3(startPos, endPos);

    // 튜브 지오메트리 생성
    const geometry = new THREE.TubeGeometry(
      curve, // 경로
      100, // 튜브의 길이 방향 세그먼트 수
      this.ballRadius, // 반지름
      this.segments, // 튜브 단면의 세그먼트 수
      true // 닫힘 여부
    );
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const curveObject = new THREE.Mesh(geometry, material);

    return curveObject;
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
