import * as THREE from 'three';
import cube, { rotate } from './cube';
import requireWebGL from './require-webgl';
import { setCamera, createBasicLine } from './line';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, .1, 1000 );

const renderer = new THREE.WebGLRenderer();

renderer.setSize( window.innerWidth, window.innerHeight, false );
document.body.appendChild( renderer.domElement );

// NOTE: 默认添加到原点位置
scene.add( cube );
const line = createBasicLine();
scene.add( line );
// NOTE: 相机的起始位置也是在原点
// camera.position.z = 5;
setCamera( camera );

function animate ()
{
    requestAnimationFrame( animate )
    rotate();
    renderer.render( scene, camera );
}

requireWebGL();
animate()
