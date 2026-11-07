import { Group, Mesh, BoxGeometry, SphereGeometry, MeshStandardMaterial, MeshBasicMaterial, PlaneGeometry, DoubleSide, ConeGeometry } from '@iwsdk/core';
// Procedural original assets; meters, Y up, front +Z, local origin at center.
export function drawingPlane() {
  const mesh = new Mesh(new PlaneGeometry(1.28, .64), new MeshBasicMaterial({color:0x163648, side:DoubleSide, transparent:true, opacity:.85}));
  mesh.name = 'DrawingSurface'; return mesh;
}
export function bank() {
  const group = new Group(); group.name='AnchoredBank';
  const base = new Mesh(new BoxGeometry(.24,.14,.38),new MeshStandardMaterial({color:0x18283e,metalness:.65,roughness:.3})); base.position.y=-.07; base.name='Bank';group.add(base);
  const rim=new Mesh(new BoxGeometry(.25,.012,.39),new MeshBasicMaterial({color:0x3f627e}));rim.name='AnchorRim';group.add(rim);return group;
}
export function creature() {
  const group=new Group();group.name='Lightling';
  const fur=new MeshStandardMaterial({color:0xfff0d4,emissive:0xffbc6b,emissiveIntensity:.42,roughness:.35});
  const body=new Mesh(new SphereGeometry(.039,20,14),fur);body.scale.set(1,1.12,.86);body.name='LanternBody';group.add(body);
  const dark=new MeshBasicMaterial({color:0x14213c}),white=new MeshBasicMaterial({color:0xffffff});
  for(const x of [-.015,.015]) {const eye=new Mesh(new SphereGeometry(.0065,10,8),dark);eye.position.set(x,.011,.031);eye.name=x<0?'EyeLeft':'EyeRight';group.add(eye);const glint=new Mesh(new SphereGeometry(.0023,6,5),white);glint.position.set(x+.0015,.014,.0365);glint.name='EyeGlint';group.add(glint);const ear=new Mesh(new ConeGeometry(.010,.025,8),fur);ear.position.set(x*1.5,.044,-.004);ear.rotation.z=x<0?.3:-.3;ear.name=x<0?'EarLeft':'EarRight';group.add(ear);const foot=new Mesh(new SphereGeometry(.012,10,7),fur);foot.position.set(x*1.2,-.035,.009);foot.scale.set(1,.62,1.12);foot.name=x<0?'FootLeft':'FootRight';group.add(foot);}
  const tail=new Mesh(new ConeGeometry(.013,.036,10),fur);tail.position.set(0,-.012,-.039);tail.rotation.x=-Math.PI/2;tail.name='GlowTail';group.add(tail);return group;
}
