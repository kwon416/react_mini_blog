import * as THREE from "three";

class StrikeZoneSystem extends THREE.Object3D {
  constructor(
    batterHeight = 1.8288,
    rubberOffset = 0.4572,
    rubberToHomeplate = 18.44,
    pitchData
  ) {
    super();

    this.plateSize = 0.4318;
    this.batterHeight = batterHeight;
    this.rubberOffset = rubberOffset;
    this.rubberToHomeplate = rubberToHomeplate;

    this.zoneTop = this.batterHeight * 0.5635;
    this.zoneBottom = this.batterHeight * 0.2764;
    this.zoneHeight = this.zoneTop - this.zoneBottom;

    this.initHomePlate();
    this.initStrikeZone();
    this.initFlatStrikeZones();
  }

  createPentagonShape() {
    const shape = new THREE.Shape();
    const halfLength = this.plateSize / 2;

    shape.moveTo(-halfLength, 0);
    shape.lineTo(0, halfLength);
    shape.lineTo(halfLength, 0);
    shape.lineTo(halfLength, -halfLength);
    shape.lineTo(-halfLength, -halfLength);
    shape.lineTo(-halfLength, 0);

    return shape;
  }

  initHomePlate() {
    const shape = this.createPentagonShape();
    const plateGeometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.01,
      bevelEnabled: false,
    });

    const plateMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
    });

    this.homePlate = new THREE.Mesh(plateGeometry, plateMaterial);
    this.homePlate.rotateX(Math.PI / 2);
    this.homePlate.position.set(
      0,
      0.01,
      this.rubberOffset + this.rubberToHomeplate
    );

    this.add(this.homePlate);
  }

  initStrikeZone() {
    const shape = this.createPentagonShape();
    const strikeZoneGeometry = new THREE.ExtrudeGeometry(shape, {
      depth: this.zoneHeight,
      side: THREE.DoubleSide,
      bevelEnabled: false,
    });

    const edges = new THREE.EdgesGeometry(strikeZoneGeometry);
    const edgesMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      opacity: 0,
    });

    this.strikeZone = new THREE.LineSegments(edges, edgesMaterial);

    this.strikeZone.position.set(
      0,
      this.zoneHeight + this.zoneBottom,
      this.rubberOffset + this.rubberToHomeplate
    );
    this.strikeZone.rotateX(Math.PI / 2);

    this.add(this.strikeZone);
  }

  initFlatStrikeZones() {
    // 평면 스트라이크 존을 위한 재질 생성
    const flatZoneMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
    });

    // 중간 평면 스트라이크 존
    const middleZoneGeometry = new THREE.PlaneGeometry(
      this.plateSize + 0.04,
      this.zoneHeight
    );
    // 끝 평면 스트라이크 존
    const endZoneGeometry = new THREE.PlaneGeometry(
      this.plateSize,
      this.zoneHeight
    );
    this.middleFlatZone = new THREE.Mesh(
      middleZoneGeometry,
      flatZoneMaterial.clone()
    );
    this.middleFlatZone.position.set(
      0,
      this.zoneBottom + this.zoneHeight / 2,
      this.rubberOffset + this.rubberToHomeplate
    );

    // 끝 평면 스트라이크 존
    this.endFlatZone = new THREE.Mesh(
      endZoneGeometry,
      flatZoneMaterial.clone()
    );
    this.endFlatZone.position.set(
      0,
      this.zoneBottom + this.zoneHeight / 2 - 0.015,
      this.rubberOffset + this.rubberToHomeplate + this.plateSize / 2
    );

    // 씬에 추가
    this.add(this.middleFlatZone);
    this.add(this.endFlatZone);
  }

  setFlatZonesVisibility(visible) {
    this.middleFlatZone.visible = visible;
    this.endFlatZone.visible = visible;
    this.middleFlatZoneEdges.visible = visible;
    this.endFlatZoneEdges.visible = visible;
  }

  setFlatZonesColor(color) {
    this.middleFlatZone.material.color.set(color);
    this.endFlatZone.material.color.set(color);
    this.middleFlatZoneEdges.material.color.set(color);
    this.endFlatZoneEdges.material.color.set(color);
  }

  setFlatZonesOpacity(opacity) {
    this.middleFlatZone.material.opacity = opacity;
    this.endFlatZone.material.opacity = opacity;
  }

  update() {
    // 필요한 업데이트 로직 추가
  }

  setZoneVisibility(visible) {
    this.strikeZone.visible = visible;
    this.zoneEdges.visible = visible;
  }

  setZoneColor(color) {
    this.strikeZone.material.color.set(color);
    this.zoneEdges.material.color.set(color);
  }

  setZoneOpacity(opacity) {
    this.strikeZone.material.opacity = opacity;
  }
}

export default StrikeZoneSystem;
