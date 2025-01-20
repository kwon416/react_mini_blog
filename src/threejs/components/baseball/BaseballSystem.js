import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import BaseballPhysics from "./BaseballPhysics";

class BaseballSystem extends THREE.Group {
  static DEFAULTS = {
    RUBBER_TO_HOMEPLATE: 18.44, // meters
    BALL_RADIUS: 0.037, // meters
    SEGMENTS: 32,
    FPS: 60,
  };
  constructor(
    rubberOffset,
    rubberTOHomeplate = 18.44,
    strikeZonePosition = new THREE.Vector3(0, 0, 0)
  ) {
    super();
    // 기본 변수 설정
    this.rubberOffset = rubberOffset;
    this.homeplateDist = rubberTOHomeplate + rubberOffset;
    this.ballRadius = 0.037; // 공의 반지름
    this.segments = 32; // 공의 세그먼트 수
    this.physics = new BaseballPhysics();
    this.strikeZonePosition = strikeZonePosition;

    // 상태 초기화
    this.setupState();

    // 시스템 구성 요소 초기화
    this.setupBall();
    this.setupTrajectory();

    // 피치 데이터 초기화
    this.pitchData = null;
  }

  // 상태 초기화
  setupState() {
    this.state = {
      isPitching: false,
      currentTime: 0,
      initialPosition: new THREE.Vector3(
        0,
        1.8,
        this.strikeZonePosition.z - 12.192
      ),
      initialVelocity: new THREE.Vector3(0, -0.1, 1),
      previousPosition: null,
      trajectoryPoints: [],
    };
  }

  // 야구 공 생성
  async setupBall() {
    const loader = new GLTFLoader();
    loader.load(
      "models/design/ball.glb",
      (gltf) => {
        this.ball = gltf.scene;
        this.ball.scale.setScalar(BaseballSystem.DEFAULTS.BALL_RADIUS);
        this.add(this.ball);
      },
      undefined,
      (error) => {
        console.error("Ball model loading failed:", error);
        this.createFallbackBall();
      }
    );
  }

  createFallbackBall() {
    const geometry = new THREE.SphereGeometry(
      BaseballSystem.DEFAULTS.BALL_RADIUS,
      BaseballSystem.DEFAULTS.SEGMENTS,
      BaseballSystem.DEFAULTS.SEGMENTS
    );
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    this.ball = new THREE.Mesh(geometry, material);
    this.add(this.ball);
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

    this.state.currentTime += 1 / BaseballSystem.DEFAULTS.FPS;

    // 새로운 공 위치 계산
    const pitchSettings = this.physics.getPitchSettings(this.pitchData);
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

  // 피치 데이터 설정 메서드 추가
  setPitchData(data) {
    this.pitchData = data;
    if (data) {
      // 센티미터를 미터로 변환 (Pfxx, Pfxz는 센티미터 단위)
      const horizontalOffset = data.data.Pitch.NineP.Pfxx / 100;
      const verticalOffset = data.data.Pitch.NineP.Pfxz / 100;

      // 시작 위치 설정
      this.state.initialPosition = new THREE.Vector3(
        horizontalOffset,
        verticalOffset + 1.8, // 기존 높이에 수직 오프셋 추가
        this.strikeZonePosition.z - 12.192
      );

      // 스트라이크존 통과 지점
      const x0 = data.data.Pitch.NineP.X0;
      this.strikeZonePassPoint = new THREE.Vector3(
        x0.X,
        x0.Z,
        this.strikeZonePosition.z
      );
    }
  }

  startPitch() {
    if (!this.state || !this.physics || !this.pitchData) return;

    this.resetBall();
    this.state.isPitching = true;

    // 실제 데이터 기반 궤적 계산
    const direction = new THREE.Vector3()
      .subVectors(this.strikeZonePassPoint, this.state.initialPosition)
      .normalize();

    const pitchSettings = this.physics.getPitchSettings(this.pitchData);
    this.state.initialVelocity = direction.multiplyScalar(
      this.physics.mphToMs(pitchSettings.initialVelocity)
    );
  }
}

export default BaseballSystem;
