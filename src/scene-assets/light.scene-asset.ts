import { Group, Mesh, BoxGeometry, SphereGeometry, MeshStandardMaterial, MeshBasicMaterial, PlaneGeometry, DoubleSide } from '@iwsdk/core';
// Procedural original assets; meters, Y up, front +Z, local origin at center.
export function drawingPlane() {
  const mesh = new Mesh(new PlaneGeometry(1.28, .64), new MeshBasicMaterial({color:0x163648, side:DoubleSide, transparent:true, opacity:.85}));
  mesh.name = 'DrawingSurface'; return mesh;
}
export function bank() {
  const group = new Group(); group.name='AnchoredBank';
  const base = new Mesh(new BoxGeometry(.24,.14,.38),new MeshStandardMaterial({color:0x18283e,metalness:.65,roughness:.3})); base.position.y=-.07; base.name='Bank';group.add(base);
  const rim=new Mesh(new BoxGeometry(.25,.012,.39),new MeshBasicMaterial({color:0x73e8df}));rim.name='AnchorRim';group.add(rim);return group;
}
export function creature() {
  const group=new Group();group.name='Creature';
  const body=new Mesh(new SphereGeometry(.045,16,12),new MeshStandardMaterial({color:0xffeed0,emissive:0xffab45,emissiveIntensity:.7}));body.scale.set(1,1.1,.85);body.name='Body';group.add(body);
  const eyeMaterial=new MeshBasicMaterial({color:0x11172c});
  for(const x of [-.016,.016]) {const eye=new Mesh(new SphereGeometry(.006,8,6),eyeMaterial);eye.position.set(x,.01,.035);eye.name=x<0?'EyeLeft':'EyeRight';group.add(eye);}
  return group;
}
