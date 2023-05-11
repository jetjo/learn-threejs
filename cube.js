import * as THREE from 'three'

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );

function rotate ()
{
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
}

export default cube;
export
{
    rotate
}
